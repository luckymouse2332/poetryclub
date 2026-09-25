import "server-only";

import { randomUUID } from "node:crypto";
import { cache } from "react";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  lt,
  max,
  notExists,
  sql,
} from "drizzle-orm";

import {
  canReadMembersOnlyPoems,
  type ContentReaderScope,
} from "@/lib/poem-access";
import { db } from "@/server/db";
import {
  poem,
  poemCollection,
  poemCollectionItem,
  user,
} from "@/server/db/schema";
import {
  type DatabaseTransaction,
  writeAdminAudit,
} from "@/server/services/admin-audit";
import {
  createNotificationInTransaction,
  publishNotificationDispatch,
} from "@/server/services/notifications";
import {
  COLLECTION_PAGE_SIZE,
  type CollectionInput,
  type CollectionMoveDirection,
  type CollectionVisibility,
} from "@/server/validation/collections";
import { MODERATION_PAGE_SIZE } from "@/server/validation/moderation";

export type CollectionStatus = "draft" | "published";
export type CollectionModerationStatus = "visible" | "hidden";

export type PaginatedCollectionResult<T> = Readonly<{
  items: ReadonlyArray<T>;
  page: number;
  pageCount: number;
  total: number;
}>;

export type PublishedCollectionSummary = Readonly<{
  id: string;
  title: string;
  description: string | null;
  ownerName: string;
  visibility: CollectionVisibility;
  publishedAt: Date;
  itemCount: number;
}>;

export type PublishedCollectionDetail = PublishedCollectionSummary &
  Readonly<{ updatedAt: Date }>;

export type PublishedCollectionItem = Readonly<{
  poemId: string;
  title: string;
  authorName: string;
  position: number;
}>;

export type CollectionReadingItem = Readonly<{
  collection: PublishedCollectionDetail;
  poem: Readonly<{
    id: string;
    title: string;
    body: string;
    context: string | null;
    occurredAt: Date | null;
    authorName: string;
    publishedAt: Date;
    updatedAt: Date;
    visibility: "public" | "members_only";
  }>;
  previousPoemId: string | null;
  nextPoemId: string | null;
}>;

export type PublishedCollectionAccess =
  | Readonly<{ kind: "visible"; collection: PublishedCollectionDetail }>
  | Readonly<{ kind: "login_required" }>
  | Readonly<{ kind: "not_found" }>;

export type OwnCollectionSummary = Readonly<{
  id: string;
  title: string;
  status: CollectionStatus;
  visibility: CollectionVisibility;
  moderationStatus: CollectionModerationStatus;
  moderationReason: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  itemCount: number;
  availableItemCount: number;
}>;

export type OwnCollectionDetail = Readonly<{
  id: string;
  title: string;
  description: string | null;
  status: CollectionStatus;
  visibility: CollectionVisibility;
  moderationStatus: CollectionModerationStatus;
  moderationReason: string | null;
  moderatedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  availableItemCount: number;
}>;

export type OwnCollectionItem = Readonly<{
  poemId: string;
  title: string | null;
  authorName: string | null;
  position: number;
  available: boolean;
}>;

export type CollectionPickerItem = Readonly<{
  id: string;
  title: string;
  authorName: string;
  visibility: "public" | "members_only";
  publishedAt: Date;
}>;

export type AdminCollectionSummary = Readonly<{
  id: string;
  title: string;
  description: string | null;
  ownerName: string;
  ownerId: string;
  status: CollectionStatus;
  visibility: CollectionVisibility;
  moderationStatus: CollectionModerationStatus;
  moderationReason: string | null;
  updatedAt: Date;
  publishedAt: Date | null;
}>;

export class CollectionMutationError extends Error {
  constructor(
    public readonly code:
      | "not_found_or_forbidden"
      | "invalid_transition"
      | "empty_collection"
      | "poem_unavailable"
      | "visibility_conflict"
      | "already_included"
      | "concurrent_conflict",
  ) {
    super(code);
    this.name = "CollectionMutationError";
  }
}

export class CollectionModerationError extends Error {
  constructor(
    public readonly code: "not_found" | "concurrent_conflict",
  ) {
    super(code);
    this.name = "CollectionModerationError";
  }
}

function requirePublishedAt(value: Date | null): Date {
  if (!value) throw new Error("Published collection is missing publishedAt");
  return value;
}

function pageOffset(page: number, pageSize = COLLECTION_PAGE_SIZE): number {
  return (page - 1) * pageSize;
}

function paginated<T>(
  items: ReadonlyArray<T>,
  page: number,
  total: number,
  pageSize = COLLECTION_PAGE_SIZE,
): PaginatedCollectionResult<T> {
  return {
    items,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };
}

function publishedCollectionCondition(
  scope: ContentReaderScope = "anonymous",
) {
  return and(
    eq(poemCollection.status, "published"),
    eq(poemCollection.moderationStatus, "visible"),
    isNotNull(poemCollection.publishedAt),
    canReadMembersOnlyPoems(scope)
      ? sql`true`
      : eq(poemCollection.visibility, "public"),
  );
}

function eligiblePoemCondition(visibility: CollectionVisibility) {
  return and(
    eq(poem.status, "published"),
    eq(poem.moderationStatus, "visible"),
    isNotNull(poem.publishedAt),
    visibility === "public" ? eq(poem.visibility, "public") : sql`true`,
  );
}

function correlatedEligibleItemCount() {
  return sql<number>`(
    select count(*)::int
    from "poem_collection_item" as eligible_item
    inner join "poem" as eligible_poem
      on eligible_poem."id" = eligible_item."poem_id"
    where eligible_item."collection_id" = "poem_collection"."id"
      and eligible_poem."status" = 'published'
      and eligible_poem."moderation_status" = 'visible'
      and eligible_poem."published_at" is not null
      and (
        "poem_collection"."visibility" = 'members_only'
        or eligible_poem."visibility" = 'public'
      )
  )`;
}

export async function listPublishedCollections(
  page: number,
  scope: ContentReaderScope = "anonymous",
): Promise<PaginatedCollectionResult<PublishedCollectionSummary>> {
  const condition = publishedCollectionCondition(scope);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poemCollection.id,
        title: poemCollection.title,
        description: poemCollection.description,
        ownerName: user.name,
        visibility: poemCollection.visibility,
        publishedAt: poemCollection.publishedAt,
        itemCount: correlatedEligibleItemCount(),
      })
      .from(poemCollection)
      .innerJoin(user, eq(poemCollection.ownerId, user.id))
      .where(condition)
      .orderBy(desc(poemCollection.publishedAt), desc(poemCollection.id))
      .limit(COLLECTION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(poemCollection).where(condition),
  ]);

  return paginated(
    rows.map((row) => ({
      ...row,
      publishedAt: requirePublishedAt(row.publishedAt),
    })),
    page,
    totalRows[0]?.value ?? 0,
  );
}

const readPublishedCollectionAccess = async (
  id: string,
  scope: ContentReaderScope = "anonymous",
): Promise<PublishedCollectionAccess> => {
  const rows = await db
    .select({
      id: poemCollection.id,
      title: poemCollection.title,
      description: poemCollection.description,
      ownerName: user.name,
      visibility: poemCollection.visibility,
      publishedAt: poemCollection.publishedAt,
      updatedAt: poemCollection.updatedAt,
      itemCount: correlatedEligibleItemCount(),
    })
    .from(poemCollection)
    .innerJoin(user, eq(poemCollection.ownerId, user.id))
    .where(
      and(
        eq(poemCollection.id, id),
        eq(poemCollection.status, "published"),
        eq(poemCollection.moderationStatus, "visible"),
        isNotNull(poemCollection.publishedAt),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return { kind: "not_found" };
  if (
    row.visibility === "members_only" &&
    !canReadMembersOnlyPoems(scope)
  ) {
    return scope === "anonymous"
      ? { kind: "login_required" }
      : { kind: "not_found" };
  }
  return {
    kind: "visible",
    collection: {
      ...row,
      publishedAt: requirePublishedAt(row.publishedAt),
    },
  };
};

export const getPublishedCollectionAccess = cache(readPublishedCollectionAccess);

export async function listPublishedCollectionItems(
  collectionId: string,
  page: number,
  scope: ContentReaderScope = "anonymous",
): Promise<
  | Readonly<{
      kind: "visible";
      collection: PublishedCollectionDetail;
      directory: PaginatedCollectionResult<PublishedCollectionItem>;
    }>
  | Readonly<{ kind: "login_required" }>
  | Readonly<{ kind: "not_found" }>
> {
  const access = await readPublishedCollectionAccess(collectionId, scope);
  if (access.kind !== "visible") return access;
  const eligibility = eligiblePoemCondition(access.collection.visibility);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        poemId: poem.id,
        title: poem.title,
        authorName: user.name,
        position: poemCollectionItem.position,
      })
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .innerJoin(user, eq(poem.authorId, user.id))
      .where(
        and(eq(poemCollectionItem.collectionId, collectionId), eligibility),
      )
      .orderBy(asc(poemCollectionItem.position), asc(poem.id))
      .limit(COLLECTION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db
      .select({ value: count() })
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .where(
        and(eq(poemCollectionItem.collectionId, collectionId), eligibility),
      ),
  ]);
  return {
    kind: "visible",
    collection: access.collection,
    directory: paginated(rows, page, totalRows[0]?.value ?? 0),
  };
}

export async function getCollectionReadingItem(
  collectionId: string,
  poemId: string,
  scope: ContentReaderScope = "anonymous",
): Promise<
  | Readonly<{ kind: "visible"; item: CollectionReadingItem }>
  | Readonly<{ kind: "login_required" }>
  | Readonly<{ kind: "not_found" }>
> {
  const access = await readPublishedCollectionAccess(collectionId, scope);
  if (access.kind !== "visible") return access;
  const eligibility = eligiblePoemCondition(access.collection.visibility);
  const rows = await db
    .select({
      id: poem.id,
      title: poem.title,
      body: poem.body,
      context: poem.context,
      occurredAt: poem.occurredAt,
      authorName: user.name,
      publishedAt: poem.publishedAt,
      updatedAt: poem.updatedAt,
      visibility: poem.visibility,
      position: poemCollectionItem.position,
    })
    .from(poemCollectionItem)
    .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
    .innerJoin(user, eq(poem.authorId, user.id))
    .where(
      and(
        eq(poemCollectionItem.collectionId, collectionId),
        eq(poemCollectionItem.poemId, poemId),
        eligibility,
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return { kind: "not_found" };

  const neighborFields = { poemId: poemCollectionItem.poemId };
  const [previousRows, nextRows] = await Promise.all([
    db
      .select(neighborFields)
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          lt(poemCollectionItem.position, row.position),
          eligibility,
        ),
      )
      .orderBy(desc(poemCollectionItem.position), desc(poem.id))
      .limit(1),
    db
      .select(neighborFields)
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          gt(poemCollectionItem.position, row.position),
          eligibility,
        ),
      )
      .orderBy(asc(poemCollectionItem.position), asc(poem.id))
      .limit(1),
  ]);

  return {
    kind: "visible",
    item: {
      collection: access.collection,
      poem: {
        id: row.id,
        title: row.title,
        body: row.body,
        context: row.context,
        occurredAt: row.occurredAt,
        authorName: row.authorName,
        publishedAt: requirePublishedAt(row.publishedAt),
        updatedAt: row.updatedAt,
        visibility: row.visibility,
      },
      previousPoemId: previousRows[0]?.poemId ?? null,
      nextPoemId: nextRows[0]?.poemId ?? null,
    },
  };
}

export async function listOwnCollections(
  ownerId: string,
  page: number,
): Promise<PaginatedCollectionResult<OwnCollectionSummary>> {
  const owner = eq(poemCollection.ownerId, ownerId);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poemCollection.id,
        title: poemCollection.title,
        status: poemCollection.status,
        visibility: poemCollection.visibility,
        moderationStatus: poemCollection.moderationStatus,
        moderationReason: poemCollection.moderationReason,
        publishedAt: poemCollection.publishedAt,
        updatedAt: poemCollection.updatedAt,
        itemCount: sql<number>`(
          select count(*)::int from ${poemCollectionItem}
          where ${poemCollectionItem.collectionId} = ${poemCollection.id}
        )`,
        availableItemCount: correlatedEligibleItemCount(),
      })
      .from(poemCollection)
      .where(owner)
      .orderBy(desc(poemCollection.updatedAt), desc(poemCollection.id))
      .limit(COLLECTION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(poemCollection).where(owner),
  ]);
  return paginated(rows, page, totalRows[0]?.value ?? 0);
}

export async function getOwnCollection(
  id: string,
  ownerId: string,
): Promise<OwnCollectionDetail | null> {
  const rows = await db
    .select({
      id: poemCollection.id,
      title: poemCollection.title,
      description: poemCollection.description,
      status: poemCollection.status,
      visibility: poemCollection.visibility,
      moderationStatus: poemCollection.moderationStatus,
      moderationReason: poemCollection.moderationReason,
      moderatedAt: poemCollection.moderatedAt,
      publishedAt: poemCollection.publishedAt,
      createdAt: poemCollection.createdAt,
      updatedAt: poemCollection.updatedAt,
      availableItemCount: correlatedEligibleItemCount(),
    })
    .from(poemCollection)
    .where(and(eq(poemCollection.id, id), eq(poemCollection.ownerId, ownerId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listOwnCollectionItems(
  collectionId: string,
  ownerId: string,
  page: number,
): Promise<PaginatedCollectionResult<OwnCollectionItem> | null> {
  const collection = await getOwnCollection(collectionId, ownerId);
  if (!collection) return null;
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        poemId: poemCollectionItem.poemId,
        title: poem.title,
        authorName: user.name,
        poemStatus: poem.status,
        poemModerationStatus: poem.moderationStatus,
        poemPublishedAt: poem.publishedAt,
        poemVisibility: poem.visibility,
        position: poemCollectionItem.position,
      })
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .innerJoin(user, eq(poem.authorId, user.id))
      .where(eq(poemCollectionItem.collectionId, collectionId))
      .orderBy(asc(poemCollectionItem.position), asc(poem.id))
      .limit(COLLECTION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db
      .select({ value: count() })
      .from(poemCollectionItem)
      .where(eq(poemCollectionItem.collectionId, collectionId)),
  ]);
  return paginated(
    rows.map((row) => {
      const available =
        row.poemStatus === "published" &&
        row.poemModerationStatus === "visible" &&
        row.poemPublishedAt !== null &&
        (collection.visibility === "members_only" ||
          row.poemVisibility === "public");
      return {
        poemId: row.poemId,
        title: available ? row.title : null,
        authorName: available ? row.authorName : null,
        position: row.position,
        available,
      };
    }),
    page,
    totalRows[0]?.value ?? 0,
  );
}

export async function listCollectionPickerPoems(
  collectionId: string,
  ownerId: string,
  page: number,
): Promise<PaginatedCollectionResult<CollectionPickerItem> | null> {
  const collection = await getOwnCollection(collectionId, ownerId);
  if (!collection) return null;
  const condition = and(
    eligiblePoemCondition(collection.visibility),
    notExists(
      db
        .select({ value: sql`1` })
        .from(poemCollectionItem)
        .where(
          and(
            eq(poemCollectionItem.collectionId, collectionId),
            eq(poemCollectionItem.poemId, poem.id),
          ),
        ),
    ),
  );
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poem.id,
        title: poem.title,
        authorName: user.name,
        visibility: poem.visibility,
        publishedAt: poem.publishedAt,
      })
      .from(poem)
      .innerJoin(user, eq(poem.authorId, user.id))
      .where(condition)
      .orderBy(desc(poem.publishedAt), desc(poem.id))
      .limit(COLLECTION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(poem).where(condition),
  ]);
  return paginated(
    rows.map((row) => ({
      ...row,
      publishedAt: requirePublishedAt(row.publishedAt),
    })),
    page,
    totalRows[0]?.value ?? 0,
  );
}

export async function createCollectionDraft(
  ownerId: string,
  creationToken: string,
  input: CollectionInput,
): Promise<string> {
  const inserted = await db
    .insert(poemCollection)
    .values({
      id: randomUUID(),
      ownerId,
      creationToken,
      status: "draft",
      ...input,
    })
    .onConflictDoUpdate({
      target: [poemCollection.ownerId, poemCollection.creationToken],
      set: { creationToken },
    })
    .returning({ id: poemCollection.id });
  if (!inserted[0]) throw new Error("Idempotent collection creation returned no row");
  return inserted[0].id;
}

async function lockOwnCollection(
  tx: DatabaseTransaction,
  id: string,
  ownerId: string,
) {
  const rows = await tx
    .select({
      id: poemCollection.id,
      status: poemCollection.status,
      visibility: poemCollection.visibility,
      moderationStatus: poemCollection.moderationStatus,
      publishedAt: poemCollection.publishedAt,
    })
    .from(poemCollection)
    .where(and(eq(poemCollection.id, id), eq(poemCollection.ownerId, ownerId)))
    .for("update");
  const row = rows[0];
  if (!row) throw new CollectionMutationError("not_found_or_forbidden");
  return row;
}

async function hasMembersOnlyItems(
  tx: DatabaseTransaction,
  collectionId: string,
): Promise<boolean> {
  const rows = await tx
    .select({ value: count() })
    .from(poemCollectionItem)
    .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
    .where(
      and(
        eq(poemCollectionItem.collectionId, collectionId),
        eq(poem.visibility, "members_only"),
      ),
    );
  return (rows[0]?.value ?? 0) > 0;
}

export async function updateOwnCollection(
  id: string,
  ownerId: string,
  input: CollectionInput,
): Promise<CollectionStatus> {
  return db.transaction(async (tx) => {
    const current = await lockOwnCollection(tx, id, ownerId);
    if (
      input.visibility === "public" &&
      current.visibility !== "public" &&
      (await hasMembersOnlyItems(tx, id))
    ) {
      throw new CollectionMutationError("visibility_conflict");
    }
    const updated = await tx
      .update(poemCollection)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(poemCollection.id, id), eq(poemCollection.ownerId, ownerId)))
      .returning({ status: poemCollection.status });
    if (!updated[0]) throw new CollectionMutationError("concurrent_conflict");
    return updated[0].status;
  });
}

export async function addPoemToCollection(
  collectionId: string,
  poemId: string,
  ownerId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const collection = await lockOwnCollection(tx, collectionId, ownerId);
    const poems = await tx
      .select({ id: poem.id, visibility: poem.visibility })
      .from(poem)
      .where(
        and(
          eq(poem.id, poemId),
          eq(poem.status, "published"),
          eq(poem.moderationStatus, "visible"),
          isNotNull(poem.publishedAt),
        ),
      )
      .limit(1);
    const target = poems[0];
    if (!target) throw new CollectionMutationError("poem_unavailable");
    if (
      collection.visibility === "public" &&
      target.visibility !== "public"
    ) {
      throw new CollectionMutationError("visibility_conflict");
    }
    const existing = await tx
      .select({ poemId: poemCollectionItem.poemId })
      .from(poemCollectionItem)
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, poemId),
        ),
      )
      .limit(1);
    if (existing[0]) throw new CollectionMutationError("already_included");
    const last = await tx
      .select({ value: max(poemCollectionItem.position) })
      .from(poemCollectionItem)
      .where(eq(poemCollectionItem.collectionId, collectionId));
    await tx.insert(poemCollectionItem).values({
      collectionId,
      poemId,
      position: (last[0]?.value ?? -1) + 1,
    });
    await tx
      .update(poemCollection)
      .set({ updatedAt: new Date() })
      .where(eq(poemCollection.id, collectionId));
  });
}

export async function removePoemFromCollection(
  collectionId: string,
  poemId: string,
  ownerId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await lockOwnCollection(tx, collectionId, ownerId);
    const deleted = await tx
      .delete(poemCollectionItem)
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, poemId),
        ),
      )
      .returning({ poemId: poemCollectionItem.poemId });
    if (!deleted[0]) throw new CollectionMutationError("not_found_or_forbidden");
    await tx
      .update(poemCollection)
      .set({ updatedAt: new Date() })
      .where(eq(poemCollection.id, collectionId));
  });
}

export async function movePoemInCollection(
  collectionId: string,
  poemId: string,
  ownerId: string,
  direction: CollectionMoveDirection,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    await lockOwnCollection(tx, collectionId, ownerId);
    const currentRows = await tx
      .select({ position: poemCollectionItem.position })
      .from(poemCollectionItem)
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, poemId),
        ),
      )
      .limit(1);
    const current = currentRows[0];
    if (!current) throw new CollectionMutationError("not_found_or_forbidden");
    const neighborRows = await tx
      .select({
        poemId: poemCollectionItem.poemId,
        position: poemCollectionItem.position,
      })
      .from(poemCollectionItem)
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          direction === "up"
            ? lt(poemCollectionItem.position, current.position)
            : gt(poemCollectionItem.position, current.position),
        ),
      )
      .orderBy(
        direction === "up"
          ? desc(poemCollectionItem.position)
          : asc(poemCollectionItem.position),
      )
      .limit(1);
    const neighbor = neighborRows[0];
    if (!neighbor) return false;
    const maximum = await tx
      .select({ value: max(poemCollectionItem.position) })
      .from(poemCollectionItem)
      .where(eq(poemCollectionItem.collectionId, collectionId));
    const temporary = (maximum[0]?.value ?? 0) + 1;
    await tx
      .update(poemCollectionItem)
      .set({ position: temporary })
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, poemId),
        ),
      );
    await tx
      .update(poemCollectionItem)
      .set({ position: current.position })
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, neighbor.poemId),
        ),
      );
    await tx
      .update(poemCollectionItem)
      .set({ position: neighbor.position })
      .where(
        and(
          eq(poemCollectionItem.collectionId, collectionId),
          eq(poemCollectionItem.poemId, poemId),
        ),
      );
    await tx
      .update(poemCollection)
      .set({ updatedAt: new Date() })
      .where(eq(poemCollection.id, collectionId));
    return true;
  });
}

export async function publishOwnCollection(
  id: string,
  ownerId: string,
  input?: CollectionInput,
): Promise<Readonly<{ moderationStatus: CollectionModerationStatus }>> {
  return db.transaction(async (tx) => {
    const collection = await lockOwnCollection(tx, id, ownerId);
    if (collection.status !== "draft") {
      throw new CollectionMutationError("invalid_transition");
    }
    const visibility = input?.visibility ?? collection.visibility;
    if (
      visibility === "public" &&
      (await hasMembersOnlyItems(tx, id))
    ) {
      throw new CollectionMutationError("visibility_conflict");
    }
    const valid = await tx
      .select({ value: count() })
      .from(poemCollectionItem)
      .innerJoin(poem, eq(poemCollectionItem.poemId, poem.id))
      .where(
        and(
          eq(poemCollectionItem.collectionId, id),
          eligiblePoemCondition(visibility),
        ),
      );
    if ((valid[0]?.value ?? 0) < 1) {
      throw new CollectionMutationError("empty_collection");
    }
    const updated = await tx
      .update(poemCollection)
      .set({
        ...input,
        status: "published",
        publishedAt: sql`coalesce(${poemCollection.publishedAt}, now())`,
        updatedAt: new Date(),
      })
      .where(and(eq(poemCollection.id, id), eq(poemCollection.status, "draft")))
      .returning({ moderationStatus: poemCollection.moderationStatus });
    if (!updated[0]) throw new CollectionMutationError("concurrent_conflict");
    return updated[0];
  });
}

export async function withdrawOwnCollection(
  id: string,
  ownerId: string,
): Promise<void> {
  const updated = await db
    .update(poemCollection)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(poemCollection.id, id),
        eq(poemCollection.ownerId, ownerId),
        eq(poemCollection.status, "published"),
      ),
    )
    .returning({ id: poemCollection.id });
  if (!updated[0]) throw new CollectionMutationError("invalid_transition");
}

export async function deleteOwnCollectionDraft(
  id: string,
  ownerId: string,
): Promise<void> {
  const deleted = await db
    .delete(poemCollection)
    .where(
      and(
        eq(poemCollection.id, id),
        eq(poemCollection.ownerId, ownerId),
        eq(poemCollection.status, "draft"),
        sql`${poemCollection.publishedAt} is null`,
      ),
    )
    .returning({ id: poemCollection.id });
  if (!deleted[0]) throw new CollectionMutationError("invalid_transition");
}

export async function listAdminCollections(
  page: number,
): Promise<PaginatedCollectionResult<AdminCollectionSummary>> {
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poemCollection.id,
        title: poemCollection.title,
        description: poemCollection.description,
        ownerName: user.name,
        ownerId: poemCollection.ownerId,
        status: poemCollection.status,
        visibility: poemCollection.visibility,
        moderationStatus: poemCollection.moderationStatus,
        moderationReason: poemCollection.moderationReason,
        updatedAt: poemCollection.updatedAt,
        publishedAt: poemCollection.publishedAt,
      })
      .from(poemCollection)
      .innerJoin(user, eq(poemCollection.ownerId, user.id))
      .orderBy(desc(poemCollection.updatedAt), desc(poemCollection.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(pageOffset(page, MODERATION_PAGE_SIZE)),
    db.select({ value: count() }).from(poemCollection),
  ]);
  return paginated(rows, page, totalRows[0]?.value ?? 0, MODERATION_PAGE_SIZE);
}

export async function getAdminCollection(
  id: string,
): Promise<AdminCollectionSummary | null> {
  const rows = await db
    .select({
      id: poemCollection.id,
      title: poemCollection.title,
      description: poemCollection.description,
      ownerName: user.name,
      ownerId: poemCollection.ownerId,
      status: poemCollection.status,
      visibility: poemCollection.visibility,
      moderationStatus: poemCollection.moderationStatus,
      moderationReason: poemCollection.moderationReason,
      updatedAt: poemCollection.updatedAt,
      publishedAt: poemCollection.publishedAt,
    })
    .from(poemCollection)
    .innerJoin(user, eq(poemCollection.ownerId, user.id))
    .where(eq(poemCollection.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function setCollectionHidden(
  adminId: string,
  targetId: string,
  reason: string,
  hidden: boolean,
): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    const expected = hidden ? "visible" : "hidden";
    const desired = hidden ? "hidden" : "visible";
    const changed = await tx
      .update(poemCollection)
      .set(
        hidden
          ? {
              moderationStatus: desired,
              moderationReason: reason,
              moderatedAt: new Date(),
              moderatedBy: adminId,
            }
          : {
              moderationStatus: desired,
              moderationReason: null,
              moderatedAt: null,
              moderatedBy: null,
            },
      )
      .where(
        and(
          eq(poemCollection.id, targetId),
          eq(poemCollection.moderationStatus, expected),
        ),
      )
      .returning({
        ownerId: poemCollection.ownerId,
        status: poemCollection.status,
        visibility: poemCollection.visibility,
      });
    const row = changed[0];
    if (!row) {
      const current = await tx
        .select({ moderationStatus: poemCollection.moderationStatus })
        .from(poemCollection)
        .where(eq(poemCollection.id, targetId))
        .limit(1);
      if (!current[0]) throw new CollectionModerationError("not_found");
      if (current[0].moderationStatus === desired) {
        return { changed: false, dispatch: null };
      }
      throw new CollectionModerationError("concurrent_conflict");
    }
    const action = hidden ? "collection_hidden" : "collection_restored";
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action,
      targetType: "collection",
      targetId,
      reason,
      metadata: {
        ownerId: row.ownerId,
        status: row.status,
        visibility: row.visibility,
      },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type: hidden
        ? "moderation.collection_hidden"
        : "moderation.collection_restored",
      title: hidden ? "你的特辑已被隐藏" : "你的特辑已恢复显示",
      body: hidden ? `管理员处理原因：${reason}` : `管理员恢复说明：${reason}`,
      href: `/account/collections/${targetId}/edit`,
      actorId: adminId,
      targetType: "collection",
      targetId,
      payload: { auditId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [row.ownerId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.changed;
}

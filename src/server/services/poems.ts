import "server-only";

import { randomUUID } from "node:crypto";
import { cache } from "react";

import {
  and,
  count,
  desc,
  eq,
  isNotNull,
  sql,
} from "drizzle-orm";

import {
  canReadMembersOnlyPoems,
  type ContentReaderScope,
} from "@/lib/poem-access";
import { db } from "@/server/db";
import { poem, user } from "@/server/db/schema";
import {
  POEM_PAGE_SIZE,
  type PoemInput,
} from "@/server/validation/poems";

export const POEM_EXCERPT_LENGTH = 240;

export type PoemStatus = "draft" | "published";
export type PoemModerationStatus = "visible" | "hidden";
export type PoemVisibility = "public" | "members_only";

export type PublicPoemSummary = Readonly<{
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: Date;
  visibility: PoemVisibility;
}>;

export type PublicPoemDetail = Readonly<{
  id: string;
  title: string;
  body: string;
  context: string | null;
  occurredAt: Date | null;
  authorName: string;
  publishedAt: Date;
  updatedAt: Date;
  visibility: PoemVisibility;
}>;

export type OwnPoemSummary = Readonly<{
  id: string;
  title: string;
  status: PoemStatus;
  updatedAt: Date;
  publishedAt: Date | null;
  moderationStatus: PoemModerationStatus;
  moderationReason: string | null;
  visibility: PoemVisibility;
}>;

export type OwnPoemDetail = Readonly<{
  id: string;
  title: string;
  body: string;
  context: string | null;
  occurredAt: Date | null;
  status: PoemStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  moderationStatus: PoemModerationStatus;
  moderationReason: string | null;
  moderatedAt: Date | null;
  visibility: PoemVisibility;
}>;

export type PublishedPoemAccess =
  | Readonly<{ kind: "visible"; poem: PublicPoemDetail }>
  | Readonly<{ kind: "login_required" }>
  | Readonly<{ kind: "not_found" }>;

export type PaginatedResult<T> = Readonly<{
  items: ReadonlyArray<T>;
  page: number;
  pageCount: number;
  total: number;
}>;

export class PoemMutationError extends Error {
  constructor(
    public readonly code: "not_found_or_forbidden" | "invalid_transition",
  ) {
    super(code);
    this.name = "PoemMutationError";
  }
}

function requirePublishedAt(value: Date | null): Date {
  if (!value) {
    throw new Error("Published poem is missing publishedAt");
  }
  return value;
}

function pageOffset(page: number): number {
  return (page - 1) * POEM_PAGE_SIZE;
}

function publishedPoemVisibility(scope: ContentReaderScope = "anonymous") {
  const audience =
    canReadMembersOnlyPoems(scope)
      ? sql`true`
      : eq(poem.visibility, "public");
  return and(
    eq(poem.status, "published"),
    eq(poem.moderationStatus, "visible"),
    isNotNull(poem.publishedAt),
    audience,
  );
}

export async function listPublishedPoems(
  page: number,
  scope: ContentReaderScope = "anonymous",
): Promise<PaginatedResult<PublicPoemSummary>> {
  const visibility = publishedPoemVisibility(scope);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poem.id,
        title: poem.title,
        excerpt: sql<string>`left(${poem.body}, ${POEM_EXCERPT_LENGTH})`,
        authorName: user.name,
        publishedAt: poem.publishedAt,
        visibility: poem.visibility,
      })
      .from(poem)
      .innerJoin(user, eq(poem.authorId, user.id))
      .where(visibility)
      .orderBy(desc(poem.publishedAt), desc(poem.id))
      .limit(POEM_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(poem).where(visibility),
  ]);
  const total = totalRows[0]?.value ?? 0;

  return {
    items: rows.map((row) => ({
      ...row,
      publishedAt: requirePublishedAt(row.publishedAt),
    })),
    page,
    pageCount: Math.max(1, Math.ceil(total / POEM_PAGE_SIZE)),
    total,
  };
}

export async function listRecentPublishedPoems(
  limit: number,
  scope: ContentReaderScope = "anonymous",
): Promise<ReadonlyArray<PublicPoemSummary>> {
  const safeLimit = Math.max(1, Math.min(limit, 6));
  const rows = await db
    .select({
      id: poem.id,
      title: poem.title,
      excerpt: sql<string>`left(${poem.body}, ${POEM_EXCERPT_LENGTH})`,
      authorName: user.name,
      publishedAt: poem.publishedAt,
      visibility: poem.visibility,
    })
    .from(poem)
    .innerJoin(user, eq(poem.authorId, user.id))
    .where(publishedPoemVisibility(scope))
    .orderBy(desc(poem.publishedAt), desc(poem.id))
    .limit(safeLimit);

  return rows.map((row) => ({
    ...row,
    publishedAt: requirePublishedAt(row.publishedAt),
  }));
}

const readPublishedPoemAccess = async (
  id: string,
  scope: ContentReaderScope = "anonymous",
): Promise<PublishedPoemAccess> => {
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
    })
    .from(poem)
    .innerJoin(user, eq(poem.authorId, user.id))
    .where(
      and(
        eq(poem.id, id),
        and(
          eq(poem.status, "published"),
          eq(poem.moderationStatus, "visible"),
          isNotNull(poem.publishedAt),
        ),
      ),
    )
    .limit(1);
  const row = rows[0];

  if (!row) return { kind: "not_found" };
  if (row.visibility === "members_only" && !canReadMembersOnlyPoems(scope)) {
    return scope === "anonymous"
      ? { kind: "login_required" }
      : { kind: "not_found" };
  }
  return {
    kind: "visible",
    poem: { ...row, publishedAt: requirePublishedAt(row.publishedAt) },
  };
};

// Request-scoped memoization prevents generateMetadata and the detail page from
// issuing the same database query twice. React cache does not persist across
// requests, so published/withdrawn visibility cannot become stale here.
export const getPublishedPoemAccess = cache(readPublishedPoemAccess);

export const getPublishedPoem = cache(
  async (id: string, scope: ContentReaderScope = "anonymous") => {
    const result = await readPublishedPoemAccess(id, scope);
    return result.kind === "visible" ? result.poem : null;
  },
);

export async function listOwnPoems(
  authorId: string,
  page: number,
): Promise<PaginatedResult<OwnPoemSummary>> {
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poem.id,
        title: poem.title,
        status: poem.status,
        updatedAt: poem.updatedAt,
        publishedAt: poem.publishedAt,
        moderationStatus: poem.moderationStatus,
        moderationReason: poem.moderationReason,
        visibility: poem.visibility,
      })
      .from(poem)
      .where(eq(poem.authorId, authorId))
      .orderBy(desc(poem.updatedAt), desc(poem.id))
      .limit(POEM_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(poem).where(eq(poem.authorId, authorId)),
  ]);
  const total = totalRows[0]?.value ?? 0;

  return {
    items: rows,
    page,
    pageCount: Math.max(1, Math.ceil(total / POEM_PAGE_SIZE)),
    total,
  };
}

export async function getOwnPoem(
  id: string,
  authorId: string,
): Promise<OwnPoemDetail | null> {
  const rows = await db
    .select({
      id: poem.id,
      title: poem.title,
      body: poem.body,
      context: poem.context,
      occurredAt: poem.occurredAt,
      status: poem.status,
      createdAt: poem.createdAt,
      updatedAt: poem.updatedAt,
      publishedAt: poem.publishedAt,
      moderationStatus: poem.moderationStatus,
      moderationReason: poem.moderationReason,
      moderatedAt: poem.moderatedAt,
      visibility: poem.visibility,
    })
    .from(poem)
    .where(and(eq(poem.id, id), eq(poem.authorId, authorId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createDraft(
  authorId: string,
  creationToken: string,
  input: PoemInput,
): Promise<string> {
  const inserted = await db
    .insert(poem)
    .values({
      id: randomUUID(),
      authorId,
      creationToken,
      status: "draft",
      ...input,
    })
    .onConflictDoUpdate({
      target: [poem.authorId, poem.creationToken],
      // A repeated submission keeps the first payload and returns its id in
      // the same atomic statement. Assigning the key to itself avoids the
      // DO NOTHING + SELECT race with a concurrent draft deletion.
      set: { creationToken },
    })
    .returning({ id: poem.id });

  if (inserted[0]) {
    return inserted[0].id;
  }
  throw new Error("Idempotent poem creation returned no row");
}

export async function updateOwnPoem(
  id: string,
  authorId: string,
  input: PoemInput,
): Promise<PoemStatus> {
  const updated = await db
    .update(poem)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(poem.id, id), eq(poem.authorId, authorId)))
    .returning({ status: poem.status });

  if (!updated[0]) {
    throw new PoemMutationError("not_found_or_forbidden");
  }
  return updated[0].status;
}

export async function publishOwnDraft(
  id: string,
  authorId: string,
): Promise<Readonly<{
  publishedAt: Date;
  moderationStatus: PoemModerationStatus;
}>> {
  const updated = await db
    .update(poem)
    .set({
      status: "published",
      publishedAt: sql`coalesce(${poem.publishedAt}, now())`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(poem.id, id),
        eq(poem.authorId, authorId),
        eq(poem.status, "draft"),
      ),
    )
    .returning({
      publishedAt: poem.publishedAt,
      moderationStatus: poem.moderationStatus,
    });

  if (!updated[0]) {
    throw new PoemMutationError("invalid_transition");
  }
  return {
    publishedAt: requirePublishedAt(updated[0].publishedAt),
    moderationStatus: updated[0].moderationStatus,
  };
}

export async function withdrawOwnPublishedPoem(
  id: string,
  authorId: string,
): Promise<void> {
  const updated = await db
    .update(poem)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(poem.id, id),
        eq(poem.authorId, authorId),
        eq(poem.status, "published"),
      ),
    )
    .returning({ id: poem.id });

  if (!updated[0]) {
    throw new PoemMutationError("invalid_transition");
  }
}

export async function deleteOwnDraft(
  id: string,
  authorId: string,
): Promise<void> {
  const deleted = await db
    .delete(poem)
    .where(
      and(
        eq(poem.id, id),
        eq(poem.authorId, authorId),
        eq(poem.status, "draft"),
      ),
    )
    .returning({ id: poem.id });

  if (!deleted[0]) {
    throw new PoemMutationError("invalid_transition");
  }
}

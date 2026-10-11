import { randomUUID } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), write: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: () => { throw new Error("NEXT_REDIRECT"); } }));
vi.mock("@/server/policies/access", () => {
  class AccessControlError extends Error {
    constructor(public readonly code: "account_suspended" | "forbidden" | "user_not_found") { super(code); }
  }
  return { AccessControlError, requireAdmin: mocks.authorize, requireActiveUser: mocks.authorize };
});
vi.mock("@/server/services/moderation", () => ({
  ModerationMutationError: class extends Error {},
  createInvitation: mocks.write, disableInvitation: mocks.write,
  hidePoem: mocks.write, restorePoem: mocks.write,
  setUserRole: mocks.write, setUserSuspended: mocks.write,
}));
vi.mock("@/server/services/poems", () => ({
  PoemMutationError: class extends Error {}, createDraft: mocks.write, deleteOwnDraft: mocks.write,
  publishOwnDraft: mocks.write, updateOwnPoem: mocks.write, withdrawOwnPublishedPoem: mocks.write,
}));
vi.mock("@/server/services/collections", () => ({
  CollectionMutationError: class extends Error {}, CollectionModerationError: class extends Error {},
  addPoemToCollection: mocks.write, createCollectionDraft: mocks.write, deleteOwnCollectionDraft: mocks.write,
  movePoemInCollection: mocks.write, publishOwnCollection: mocks.write, removePoemFromCollection: mocks.write,
  setCollectionHidden: mocks.write, updateOwnCollection: mocks.write, withdrawOwnCollection: mocks.write,
}));
vi.mock("@/server/services/comments", () => ({
  CommentError: class extends Error {}, hideComment: mocks.write, restoreComment: mocks.write,
}));
vi.mock("@/server/services/notifications", () => ({
  AnnouncementMutationError: class extends Error {}, createAnnouncementDraft: mocks.write,
  publishAnnouncement: mocks.write, updateAnnouncementDraft: mocks.write,
}));

import { AccessControlError } from "@/server/policies/access";
import { hidePoemAction, createInvitationAction } from "@/features/moderation/actions";
import { hideCommentAction } from "@/features/comments/admin-actions";
import { createCollectionAction, hideCollectionAction } from "@/features/collections/actions";
import { createPoemAction, publishPoemAction } from "@/features/posts/actions";
import { createAnnouncementAction, updateAnnouncementAction } from "@/features/notifications/announcement-actions";

const initial = { status: "idle" as const };
const id = randomUUID();
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    title: "authority test", body: "body", description: "description", context: "", occurredAt: "",
    visibility: "public", creationToken: randomUUID(), reason: "authority race test",
    maxUses: "1", expiresAt: new Date(Date.now() + 86_400_000).toISOString(), audience: "all_accounts", href: "", intent: "publish",
  })) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authorize.mockResolvedValue({ id, role: "admin", status: "active" });
  mocks.write.mockRejectedValue(new AccessControlError("account_suspended"));
});

it.each([
  ["poem governance", () => hidePoemAction(id, initial, form())],
  ["invitation creation", () => createInvitationAction(initial, form())],
  ["comment governance", () => hideCommentAction(id, initial, form())],
  ["collection governance", () => hideCollectionAction(id, initial, form())],
  ["announcement creation", () => createAnnouncementAction(initial, form())],
  ["announcement publication", () => updateAnnouncementAction(id, initial, form())],
  ["poem creation", () => createPoemAction(initial, form())],
  ["poem publication", () => publishPoemAction(id, initial, form())],
  ["collection creation", () => createCollectionAction(initial, form())],
])("returns a friendly authority error when %s loses permission after entry authorization", async (_name, action) => {
  const result = await action();
  expect(mocks.authorize).toHaveBeenCalledOnce();
  expect(mocks.write).toHaveBeenCalledOnce();
  expect(result).toMatchObject({ status: "error", message: expect.stringMatching(/禁用|权限/) });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});

it("preserves Next redirect control flow after a successful create", async () => {
  mocks.write.mockResolvedValue(id);
  await expect(createAnnouncementAction(initial, form())).rejects.toThrow("NEXT_REDIRECT");
});

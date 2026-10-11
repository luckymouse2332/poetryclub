import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getContentViewer = vi.hoisted(() => vi.fn());
const listCommentRoots = vi.hoisted(() => vi.fn());
const listThreadReplies = vi.hoisted(() => vi.fn());

vi.mock("@/server/policies/access", () => ({ getContentViewer }));
vi.mock("@/server/services/comments", async () => {
  class CommentError extends Error {
    constructor(public readonly code: string) {
      super(code);
    }
  }
  return { CommentError, listCommentRoots, listThreadReplies };
});

import { GET as getRoots } from "@/app/api/poems/[poemId]/comments/route";
import { GET as getReplies } from "@/app/api/poems/[poemId]/comments/[rootId]/replies/route";

const poemId = "123e4567-e89b-42d3-a456-426614174000";
const rootId = "223e4567-e89b-42d3-a456-426614174000";

beforeEach(() => {
  getContentViewer.mockReset();
  listCommentRoots.mockReset();
  listThreadReplies.mockReset();
  getContentViewer.mockResolvedValue({
    scope: "anonymous",
    userId: null,
    role: null,
    status: null,
  });
});

describe("comment read Route Handlers", () => {
  it("returns an anonymous public page without sensitive fields", async () => {
    listCommentRoots.mockResolvedValue({
      items: [
        {
          id: rootId,
          poemId,
          rootId,
          parentId: null,
          depth: 0,
          authorName: "测试成员",
          body: "公开评论",
          placeholder: null,
          moderationReason: null,
          createdAt: "2026-08-22T00:00:00.000Z",
          editedAt: null,
          replyCount: 0,
          isOwner: false,
          canReply: false,
          canEdit: false,
          canDelete: false,
          replies: [],
        },
      ],
      nextCursor: null,
    });
    const response = await getRoots(
      new NextRequest(`http://localhost/api/poems/${poemId}/comments`),
      { params: Promise.resolve({ poemId }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const text = await response.text();
    expect(text).toContain("公开评论");
    expect(text).not.toMatch(/email|authorId|moderatedBy|creationToken/);
    expect(getContentViewer).toHaveBeenCalledOnce();
  });

  it("rejects malformed cursors before calling the service", async () => {
    const response = await getRoots(
      new NextRequest(
        `http://localhost/api/poems/${poemId}/comments?cursor=bad%2Bcursor`,
      ),
      { params: Promise.resolve({ poemId }) },
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(listCommentRoots).not.toHaveBeenCalled();
  });

  it("maps protected member content to an authentication response", async () => {
    const { CommentError } = await import("@/server/services/comments");
    listCommentRoots.mockRejectedValue(new CommentError("login_required"));
    const response = await getRoots(
      new NextRequest(`http://localhost/api/poems/${poemId}/comments`),
      { params: Promise.resolve({ poemId }) },
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "login_required" });
  });

  it("validates thread ownership through the reply service", async () => {
    const { CommentError } = await import("@/server/services/comments");
    listThreadReplies.mockRejectedValue(new CommentError("not_found"));
    const response = await getReplies(
      new NextRequest(
        `http://localhost/api/poems/${poemId}/comments/${rootId}/replies`,
      ),
      { params: Promise.resolve({ poemId, rootId }) },
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

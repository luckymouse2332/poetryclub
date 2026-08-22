import { describe, expect, it } from "vitest";

import {
  COMMENT_ERROR_MESSAGES,
  getCommentErrorMessage,
} from "@/features/comments/error-messages";
import { toCommentDto } from "@/server/services/comments/presentation";

const row = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  poemId: "223e4567-e89b-42d3-a456-426614174000",
  rootId: "123e4567-e89b-42d3-a456-426614174000",
  parentId: null,
  depth: 0,
  authorId: "author-1",
  authorName: "测试作者",
  body: "只应向有权读者显示的正文",
  createdAt: new Date("2026-08-20T12:00:00.000Z"),
  editedAt: new Date("2026-08-20T12:05:00.000Z"),
  deletedAt: null,
  lastActivityAt: new Date("2026-08-20T12:00:00.000Z"),
  moderationStatus: "hidden" as const,
  moderationReason: "治理原因",
  replyCount: 2,
};

describe("comment presentation", () => {
  it("returns hidden content and reason only to its active owner", () => {
    const owner = toCommentDto(row, {
      scope: "active_member",
      userId: "author-1",
      role: "member",
      status: "active",
    });
    const reader = toCommentDto(row, {
      scope: "active_member",
      userId: "reader-1",
      role: "member",
      status: "active",
    });

    expect(owner).toMatchObject({
      body: row.body,
      placeholder: null,
      moderationReason: "治理原因",
      isOwner: true,
      canReply: false,
      canEdit: false,
      canDelete: false,
    });
    expect(reader).toMatchObject({
      body: null,
      placeholder: "hidden",
      moderationReason: null,
      isOwner: false,
    });
    expect(Object.keys(reader).sort()).toEqual(
      [
        "authorName",
        "body",
        "canDelete",
        "canEdit",
        "canReply",
        "createdAt",
        "depth",
        "editedAt",
        "id",
        "isOwner",
        "moderationReason",
        "parentId",
        "placeholder",
        "poemId",
        "replyCount",
        "rootId",
      ].sort(),
    );
  });

  it("always uses a deleted placeholder and removes owner actions", () => {
    const dto = toCommentDto(
      { ...row, body: "", deletedAt: new Date("2026-08-20T12:10:00.000Z") },
      {
        scope: "active_member",
        userId: "author-1",
        role: "member",
        status: "active",
      },
    );

    expect(dto).toMatchObject({
      body: null,
      placeholder: "deleted",
      canReply: false,
      canEdit: false,
      canDelete: false,
    });
  });

  it("maps every domain error code to a stable public message", () => {
    for (const [code, message] of Object.entries(COMMENT_ERROR_MESSAGES)) {
      expect(getCommentErrorMessage(code as keyof typeof COMMENT_ERROR_MESSAGES)).toBe(
        message,
      );
    }
  });
});

import { describe, expect, it } from "vitest";

import {
  CommentCursorError,
  decodeCommentCursor,
  encodeCommentCursor,
} from "@/lib/comment-cursor";
import {
  COMMENT_BODY_MAX_LENGTH,
  commentBodySchema,
  commentCreationTokenSchema,
  commentCursorSchema,
  commentIdSchema,
  moderateCommentInputSchema,
} from "@/server/validation/comments";

const id = "123e4567-e89b-42d3-a456-426614174000";

describe("comment validation", () => {
  it("trims plain text and preserves internal newlines", () => {
    expect(commentBodySchema.parse("  第一行\n<script>alert(1)</script>  ")).toBe(
      "第一行\n<script>alert(1)</script>",
    );
  });

  it("rejects empty and oversized bodies", () => {
    expect(commentBodySchema.safeParse(" \n\t ").success).toBe(false);
    expect(
      commentBodySchema.safeParse("字".repeat(COMMENT_BODY_MAX_LENGTH + 1)).success,
    ).toBe(false);
    expect(
      commentBodySchema.safeParse("字".repeat(COMMENT_BODY_MAX_LENGTH)).success,
    ).toBe(true);
  });

  it("strictly validates comment and creation UUIDs", () => {
    expect(commentIdSchema.parse(id)).toBe(id);
    expect(commentCreationTokenSchema.parse(id)).toBe(id);
    expect(commentIdSchema.safeParse("comment-1").success).toBe(false);
    expect(commentCreationTokenSchema.safeParse("123").success).toBe(false);
  });

  it("requires a non-empty governance reason", () => {
    expect(
      moderateCommentInputSchema.safeParse({ targetId: id, reason: "  " }).success,
    ).toBe(false);
    expect(
      moderateCommentInputSchema.parse({ targetId: id, reason: "  违规内容  " }),
    ).toEqual({ targetId: id, reason: "违规内容" });
  });

  it("rejects malformed transport cursors before decoding", () => {
    expect(commentCursorSchema.safeParse("not+a+cursor").success).toBe(false);
    expect(commentCursorSchema.safeParse("a".repeat(513)).success).toBe(false);
  });
});

describe("versioned comment cursors", () => {
  it("round-trips a strict opaque cursor", () => {
    const at = new Date("2026-08-20T12:34:56.000Z");
    const cursor = encodeCommentCursor("root", at, id);
    expect(cursor).not.toContain("{");
    expect(decodeCommentCursor(cursor, "root")).toEqual({ at, id });
  });

  it("rejects the wrong cursor kind and unexpected fields", () => {
    const cursor = encodeCommentCursor(
      "reply",
      new Date("2026-08-20T12:34:56.000Z"),
      id,
    );
    expect(() => decodeCommentCursor(cursor, "root")).toThrow(CommentCursorError);

    const invalid = Buffer.from(
      JSON.stringify({
        v: 1,
        kind: "root",
        at: "2026-08-20T12:34:56.000Z",
        id,
        email: "should-not-be-here@example.test",
      }),
    ).toString("base64url");
    expect(() => decodeCommentCursor(invalid, "root")).toThrow(CommentCursorError);
  });

  it("rejects malformed, unversioned, and invalid-id cursors", () => {
    for (const cursor of [
      "not-json",
      Buffer.from(JSON.stringify({ kind: "root", at: new Date().toISOString(), id })).toString("base64url"),
      Buffer.from(JSON.stringify({ v: 2, kind: "root", at: new Date().toISOString(), id })).toString("base64url"),
      Buffer.from(JSON.stringify({ v: 1, kind: "root", at: new Date().toISOString(), id: "bad" })).toString("base64url"),
    ]) {
      expect(() => decodeCommentCursor(cursor, "root")).toThrow(CommentCursorError);
    }
  });
});

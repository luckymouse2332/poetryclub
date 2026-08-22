import { Buffer } from "node:buffer";

import { z } from "zod";

const cursorPayloadSchema = z.object({
  v: z.literal(1),
  kind: z.enum(["root", "reply"]),
  at: z.iso.datetime(),
  id: z.uuid(),
}).strict();

export type CommentCursorKind = z.infer<typeof cursorPayloadSchema>["kind"];

export class CommentCursorError extends Error {
  constructor() {
    super("invalid_cursor");
    this.name = "CommentCursorError";
  }
}

export function encodeCommentCursor(
  kind: CommentCursorKind,
  at: Date,
  id: string,
): string {
  return Buffer.from(
    JSON.stringify({ v: 1, kind, at: at.toISOString(), id }),
    "utf8",
  ).toString("base64url");
}

export function decodeCommentCursor(
  cursor: string,
  expectedKind: CommentCursorKind,
): Readonly<{ at: Date; id: string }> {
  try {
    const parsed = cursorPayloadSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")),
    );
    if (parsed.kind !== expectedKind) throw new Error("cursor kind mismatch");
    const at = new Date(parsed.at);
    if (Number.isNaN(at.getTime())) throw new Error("invalid cursor date");
    return { at, id: parsed.id };
  } catch {
    throw new CommentCursorError();
  }
}

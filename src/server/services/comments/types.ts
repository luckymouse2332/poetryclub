import type { CommentDto } from "./presentation";
export type CommentModerationStatus = "visible" | "hidden";

export { toCommentDto } from "@/server/services/comments/presentation";
export type { CommentDto } from "@/server/services/comments/presentation";

export class CommentError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "login_required"
      | "forbidden"
      | "invalid_depth"
      | "invalid_transition"
      | "idempotency_conflict"
      | "rate_limited"
      | "invalid_cursor",
  ) {
    super(code);
    this.name = "CommentError";
  }
}

export type CommentRootDto = CommentDto &
  Readonly<{ replies: ReadonlyArray<CommentDto> }>;

export type CursorPage<T> = Readonly<{
  items: ReadonlyArray<T>;
  nextCursor: string | null;
}>;

export type CommentThreadResult = Readonly<{
  root: CommentDto;
  replies: ReadonlyArray<CommentDto>;
  nextCursor: string | null;
  focusId: string | null;
}>;

export type AdminCommentSummary = Readonly<{
  id: string;
  poemId: string;
  poemTitle: string;
  authorName: string;
  body: string;
  depth: number;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  moderationStatus: CommentModerationStatus;
  moderationReason: string | null;
  moderatedAt: Date | null;
}>;

export type AdminCommentPage = Readonly<{
  items: ReadonlyArray<AdminCommentSummary>;
  page: number;
  pageCount: number;
  total: number;
}>;


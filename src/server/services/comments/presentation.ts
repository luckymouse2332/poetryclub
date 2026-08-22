import type { ContentViewer } from "@/server/policies/access";

type CommentPlaceholder = "deleted" | "hidden" | null;

export type CommentDto = Readonly<{
  id: string;
  poemId: string;
  rootId: string;
  parentId: string | null;
  depth: number;
  authorName: string;
  body: string | null;
  placeholder: CommentPlaceholder;
  moderationReason: string | null;
  createdAt: string;
  editedAt: string | null;
  replyCount: number;
  isOwner: boolean;
  canReply: boolean;
  canEdit: boolean;
  canDelete: boolean;
}>;

export type CommentPresentationRow = Readonly<{
  id: string;
  poemId: string;
  rootId: string;
  parentId: string | null;
  depth: number;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  lastActivityAt: Date;
  moderationStatus: "visible" | "hidden";
  moderationReason: string | null;
  replyCount: number;
}>;

export function toCommentDto(
  row: CommentPresentationRow,
  viewer: ContentViewer,
): CommentDto {
  const isOwner = viewer.userId === row.authorId;
  const placeholder: CommentPlaceholder = row.deletedAt
    ? "deleted"
    : row.moderationStatus === "hidden" && !isOwner
      ? "hidden"
      : null;
  const activeOwner = viewer.status === "active" && isOwner;

  return {
    id: row.id,
    poemId: row.poemId,
    rootId: row.rootId,
    parentId: row.parentId,
    depth: row.depth,
    authorName: row.authorName,
    body: placeholder ? null : row.body,
    placeholder,
    moderationReason:
      isOwner && row.moderationStatus === "hidden"
        ? row.moderationReason
        : null,
    createdAt: row.createdAt.toISOString(),
    editedAt: row.editedAt?.toISOString() ?? null,
    replyCount: row.replyCount,
    isOwner,
    canReply:
      viewer.status === "active" &&
      row.depth === 0 &&
      !row.deletedAt &&
      row.moderationStatus === "visible",
    canEdit:
      activeOwner && !row.deletedAt && row.moderationStatus === "visible",
    canDelete:
      activeOwner && !row.deletedAt && row.moderationStatus === "visible",
  };
}

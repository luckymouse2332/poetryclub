import { NextResponse, type NextRequest } from "next/server";

import { getContentViewer } from "@/server/policies/access";
import { CommentError, listThreadReplies } from "@/server/services/comments";
import {
  commentCursorSchema,
  commentFocusSchema,
  commentIdSchema,
} from "@/server/validation/comments";
import { poemIdSchema } from "@/server/validation/poems";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" } as const;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ poemId: string; rootId: string }> },
) {
  const { poemId, rootId } = await context.params;
  const parsedPoemId = poemIdSchema.safeParse(poemId);
  const parsedRootId = commentIdSchema.safeParse(rootId);
  const parsedCursor = commentCursorSchema.safeParse(
    request.nextUrl.searchParams.get("cursor") ?? undefined,
  );
  const parsedFocus = commentFocusSchema.safeParse(
    request.nextUrl.searchParams.get("focus") ?? undefined,
  );
  if (
    !parsedPoemId.success ||
    !parsedRootId.success ||
    !parsedCursor.success ||
    !parsedFocus.success
  ) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }
  try {
    const viewer = await getContentViewer();
    const result = await listThreadReplies(
      parsedPoemId.data,
      parsedRootId.data,
      viewer,
      { cursor: parsedCursor.data, focusId: parsedFocus.data },
    );
    return NextResponse.json(
      { items: result.replies, nextCursor: result.nextCursor },
      { headers: PRIVATE_HEADERS },
    );
  } catch (error) {
    if (error instanceof CommentError) {
      const status =
        error.code === "invalid_cursor"
          ? 400
          : error.code === "login_required"
            ? 401
            : 404;
      return NextResponse.json(
        { error: error.code },
        { status, headers: PRIVATE_HEADERS },
      );
    }
    console.error("Unexpected comment reply list failure");
    return NextResponse.json(
      { error: "unavailable" },
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}

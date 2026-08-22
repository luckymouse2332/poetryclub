import { NextResponse, type NextRequest } from "next/server";

import { getContentViewer } from "@/server/policies/access";
import { CommentError, listCommentRoots } from "@/server/services/comments";
import { commentCursorSchema } from "@/server/validation/comments";
import { poemIdSchema } from "@/server/validation/poems";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" } as const;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ poemId: string }> },
) {
  const { poemId } = await context.params;
  const parsedId = poemIdSchema.safeParse(poemId);
  const parsedCursor = commentCursorSchema.safeParse(
    request.nextUrl.searchParams.get("cursor") ?? undefined,
  );
  if (!parsedId.success || !parsedCursor.success) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }
  try {
    const viewer = await getContentViewer();
    const result = await listCommentRoots(
      parsedId.data,
      viewer,
      parsedCursor.data,
    );
    return NextResponse.json(result, { headers: PRIVATE_HEADERS });
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
    console.error("Unexpected comment list failure");
    return NextResponse.json(
      { error: "unavailable" },
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}

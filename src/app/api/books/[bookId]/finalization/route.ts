import { sweetbookFetch } from "@/lib/sweetbook";
import type { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/books/[bookId]/finalization">
) {
  const { bookId } = await ctx.params;

  return sweetbookFetch(`/books/${bookId}/finalization`, {
    method: "POST",
  });
}

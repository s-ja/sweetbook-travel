import { sweetbookFetch } from "@/lib/sweetbook";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/books/[bookId]/cover">
) {
  const { bookId } = await ctx.params;
  const formData = await request.formData();

  return sweetbookFetch(`/books/${bookId}/cover`, {
    method: "POST",
    body: formData,
  });
}

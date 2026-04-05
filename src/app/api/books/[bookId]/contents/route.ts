import { sweetbookFetch } from "@/lib/sweetbook";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/books/[bookId]/contents">
) {
  const { bookId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const breakBefore = searchParams.get("breakBefore");
  const formData = await request.formData();

  const path = `/books/${bookId}/contents${breakBefore ? `?breakBefore=${breakBefore}` : ""}`;

  return sweetbookFetch(path, {
    method: "POST",
    body: formData,
  });
}

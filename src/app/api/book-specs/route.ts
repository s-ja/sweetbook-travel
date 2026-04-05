import { sweetbookFetch } from "@/lib/sweetbook";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const path = `/book-specs${query ? `?${query}` : ""}`;

  return sweetbookFetch(path);
}

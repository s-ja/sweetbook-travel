import { sweetbookFetch } from "@/lib/sweetbook";

export async function POST(request: Request) {
  const body = await request.json();

  return sweetbookFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

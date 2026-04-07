import { sweetbookFetch } from "@/lib/sweetbook";

export async function POST(request: Request) {
  const body = await request.json();

  // 프론트에서 보낸 키가 있으면 그대로, 없으면 서버에서 생성
  const idempotencyKey =
    request.headers.get("Idempotency-Key") ?? crypto.randomUUID();

  return sweetbookFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

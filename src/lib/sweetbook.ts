const API_URL = process.env.SWEETBOOK_API_URL!;
const API_KEY = process.env.SWEETBOOK_API_KEY!;

export async function sweetbookFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { body, headers: extraHeaders, ...restOptions } = options;
  const isFormData = body instanceof FormData;
  const isJsonBody = body !== undefined && body !== "" && !isFormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    body: body ?? (restOptions.method === "POST" ? "" : undefined),
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  return Response.json(data);
}

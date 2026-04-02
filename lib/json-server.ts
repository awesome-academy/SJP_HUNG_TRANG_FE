const BASE = process.env.JSON_SERVER_URL;

function isAbsoluteHttpUrl(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

function withQuery(path: string, params?: Record<string, string>): string {
  if (!params) return path;

  const query = new URLSearchParams(params).toString();
  if (!query) return path;

  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

function resolvePath(path: string): string {
  if (isAbsoluteHttpUrl(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    // In server context we target JSON server; in client context keep relative API path.
    return BASE ? `${BASE}${path}` : path;
  }

  if (!BASE) {
    throw new Error("JSON_SERVER_URL environment variable must be set");
  }

  return `${BASE}/${path}`;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = withQuery(resolvePath(path), params);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(resolvePath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(resolvePath(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(resolvePath(path), {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
}

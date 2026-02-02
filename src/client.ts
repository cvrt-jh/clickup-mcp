const BASE_URL = "https://api.clickup.com/api/v2";

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    throw new Error("CLICKUP_API_TOKEN environment variable is required");
  }
  return token;
}

export async function clickupFetch<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  query?: Record<string, string | string[] | undefined>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, v);
        }
      } else {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: getToken(),
    "Content-Type": "application/json",
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickUp API ${method} ${path} failed (${response.status}): ${text}`);
  }

  // DELETE endpoints may return empty body
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export const get = <T = unknown>(path: string, query?: Record<string, string | string[] | undefined>) =>
  clickupFetch<T>("GET", path, undefined, query);

export const post = <T = unknown>(path: string, body?: unknown) =>
  clickupFetch<T>("POST", path, body);

export const put = <T = unknown>(path: string, body?: unknown) =>
  clickupFetch<T>("PUT", path, body);

export const del = <T = unknown>(path: string, query?: Record<string, string | string[] | undefined>) =>
  clickupFetch<T>("DELETE", path, undefined, query);

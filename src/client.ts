const BASE_URL = "https://api.clickup.com/api/v2";

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    throw new Error("CLICKUP_API_TOKEN environment variable is required");
  }
  return token;
}

// Custom task IDs (e.g. "DEV-1217") contain a hyphen; internal IDs
// ("123wwm5cdf0", "86caqr85m") never do. The API only resolves a custom ID
// when the request also carries custom_task_ids=true and the team_id - without
// them it answers 401 "Team not authorized" (OAUTH_027).
const CUSTOM_TASK_ID = /^[A-Za-z][A-Za-z0-9_]*-\d+$/;
const TASK_SEGMENT = /\/task\/([^/]+)/;

export function isCustomTaskId(id: string): boolean {
  return CUSTOM_TASK_ID.test(id);
}

let cachedTeamId: string | undefined;

/** Test hook: forget the resolved team id. */
export function resetTeamIdCache(): void {
  cachedTeamId = undefined;
}

// CLICKUP_TEAM_ID wins; otherwise the token's only workspace. A token with
// several workspaces cannot be guessed and must set the variable.
async function resolveTeamId(): Promise<string> {
  if (process.env.CLICKUP_TEAM_ID) return process.env.CLICKUP_TEAM_ID;
  if (cachedTeamId) return cachedTeamId;
  const data = await request<{ teams?: Array<{ id: string }> }>("GET", `${BASE_URL}/team`);
  const teams = data.teams ?? [];
  if (teams.length !== 1) {
    throw new Error(
      `Custom task IDs need a workspace id: the token sees ${teams.length} workspaces. Set CLICKUP_TEAM_ID.`,
    );
  }
  cachedTeamId = teams[0].id;
  return cachedTeamId;
}

/** Query params the API needs when a path addresses a task by custom ID. */
export async function customTaskQuery(path: string): Promise<Record<string, string>> {
  const match = TASK_SEGMENT.exec(path);
  if (!match || !isCustomTaskId(decodeURIComponent(match[1]))) return {};
  return { custom_task_ids: "true", team_id: await resolveTeamId() };
}

async function request<T>(method: string, url: string, init: { body?: BodyInit; json?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: getToken() };
  if (init.json) headers["Content-Type"] = "application/json";
  const response = await fetch(url, { method, headers, body: init.body });

  if (!response.ok) {
    const text = await response.text();
    const path = url.slice(BASE_URL.length).split("?")[0];
    throw new Error(`ClickUp API ${method} ${path} failed (${response.status}): ${text}`);
  }

  // DELETE endpoints may return empty body
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function buildUrl(path: string, query?: Record<string, string | string[] | undefined>): string {
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
  return url.toString();
}

export async function clickupFetch<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  query?: Record<string, string | string[] | undefined>,
): Promise<T> {
  const url = buildUrl(path, { ...query, ...(await customTaskQuery(path)) });
  return request<T>(method, url, {
    json: true,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Multipart POST (file uploads). fetch sets the multipart boundary itself. */
export async function postForm<T = unknown>(path: string, form: FormData): Promise<T> {
  const url = buildUrl(path, await customTaskQuery(path));
  return request<T>("POST", url, { body: form });
}

export const get = <T = unknown>(path: string, query?: Record<string, string | string[] | undefined>) =>
  clickupFetch<T>("GET", path, undefined, query);

export const post = <T = unknown>(path: string, body?: unknown) =>
  clickupFetch<T>("POST", path, body);

export const put = <T = unknown>(path: string, body?: unknown) =>
  clickupFetch<T>("PUT", path, body);

export const del = <T = unknown>(path: string, query?: Record<string, string | string[] | undefined>) =>
  clickupFetch<T>("DELETE", path, undefined, query);

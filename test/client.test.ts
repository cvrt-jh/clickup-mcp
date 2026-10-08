import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clickupFetch, customTaskQuery, isCustomTaskId, postForm, resetTeamIdCache } from "../src/client.js";
import { attachmentForm } from "../src/tools/attachments.js";

type Call = { url: URL; init: RequestInit };

function mockFetch(responder: (url: URL) => { status?: number; body?: unknown }) {
  const calls: Call[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string, init: RequestInit) => {
    const url = new URL(input);
    calls.push({ url, init });
    const { status = 200, body = {} } = responder(url);
    return new Response(JSON.stringify(body), { status });
  }));
  return calls;
}

beforeEach(() => {
  process.env.CLICKUP_API_TOKEN = "pk_test";
  delete process.env.CLICKUP_TEAM_ID;
  resetTeamIdCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isCustomTaskId", () => {
  it.each(["DEV-1217", "OPS-2090", "CMR-1", "dev-7"])("treats %s as custom", (id) => {
    expect(isCustomTaskId(id)).toBe(true);
  });
  it.each(["123wwm5cdf0", "86caqr85m", "DEV-", "-12", "DEV-12a"])("treats %s as internal", (id) => {
    expect(isCustomTaskId(id)).toBe(false);
  });
});

describe("custom task ids", () => {
  it("adds custom_task_ids and the env team id for a custom id", async () => {
    process.env.CLICKUP_TEAM_ID = "30307367";
    const calls = mockFetch(() => ({ body: { id: "x" } }));
    await clickupFetch("GET", "/task/DEV-1217", undefined, { include_subtasks: "true" });
    expect(calls).toHaveLength(1);
    const q = calls[0].url.searchParams;
    expect(calls[0].url.pathname).toBe("/api/v2/task/DEV-1217");
    expect(q.get("custom_task_ids")).toBe("true");
    expect(q.get("team_id")).toBe("30307367");
    expect(q.get("include_subtasks")).toBe("true");
  });

  it("covers nested task paths (comments, list membership)", async () => {
    process.env.CLICKUP_TEAM_ID = "1";
    const calls = mockFetch(() => ({}));
    await clickupFetch("POST", "/task/DEV-5/comment", { comment_text: "hi" });
    await clickupFetch("DELETE", "/list/99/task/DEV-5");
    for (const c of calls) expect(c.url.searchParams.get("custom_task_ids")).toBe("true");
  });

  it("leaves internal ids and non-task paths untouched", async () => {
    const calls = mockFetch(() => ({}));
    await clickupFetch("GET", "/task/86caqr85m");
    await clickupFetch("POST", "/list/901523030894/task", { name: "x" });
    expect(calls).toHaveLength(2);
    for (const c of calls) {
      expect(c.url.searchParams.has("custom_task_ids")).toBe(false);
      expect(c.url.searchParams.has("team_id")).toBe(false);
    }
  });

  it("resolves the team id from the token's only workspace and caches it", async () => {
    const calls = mockFetch((url) => (url.pathname.endsWith("/team") ? { body: { teams: [{ id: "777" }] } } : {}));
    await clickupFetch("GET", "/task/DEV-1");
    await clickupFetch("GET", "/task/DEV-2");
    expect(calls.filter((c) => c.url.pathname.endsWith("/team"))).toHaveLength(1);
    expect(calls.at(-1)?.url.searchParams.get("team_id")).toBe("777");
  });

  it("refuses to guess when the token sees several workspaces", async () => {
    mockFetch(() => ({ body: { teams: [{ id: "1" }, { id: "2" }] } }));
    await expect(customTaskQuery("/task/DEV-1")).rejects.toThrow(/CLICKUP_TEAM_ID/);
  });
});

describe("errors", () => {
  it("reports method, path and status without the query string", async () => {
    mockFetch(() => ({ status: 401, body: { err: "Team not authorized" } }));
    await expect(clickupFetch("GET", "/task/86caqr85m", undefined, { a: "b" })).rejects.toThrow(
      'ClickUp API GET /task/86caqr85m failed (401): {"err":"Team not authorized"}',
    );
  });
});

describe("attachments", () => {
  it("posts multipart with the file under 'attachment' and no JSON content type", async () => {
    process.env.CLICKUP_TEAM_ID = "1";
    const calls = mockFetch(() => ({ body: { id: "a1", title: "shot.png", url: "https://x" } }));
    const res = await postForm<{ title: string }>("/task/DEV-1104/attachment", attachmentForm(new Uint8Array([1, 2, 3]), "shot.png"));
    expect(res.title).toBe("shot.png");
    const { url, init } = calls[0];
    expect(url.pathname).toBe("/api/v2/task/DEV-1104/attachment");
    expect(url.searchParams.get("custom_task_ids")).toBe("true");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
    const file = (init.body as FormData).get("attachment") as File;
    expect(file.name).toBe("shot.png");
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });
});

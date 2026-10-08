import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { postForm } from "../client.js";
import { taskId, jsonResult } from "../types.js";

type Obj = Record<string, unknown>;

/** Builds the multipart body ClickUp expects: one file in the field "attachment". */
export function attachmentForm(content: Uint8Array, filename: string): FormData {
  const form = new FormData();
  // Copy into a plain ArrayBuffer: Blob rejects a view that may sit on a
  // SharedArrayBuffer (which a Node Buffer's type allows).
  form.append("attachment", new Blob([new Uint8Array(content)]), filename);
  return form;
}

export function register(server: McpServer) {
  server.registerTool("clickup_upload_attachment", {
    description: "Upload a local file (screenshot, PDF, ...) as an attachment to a task",
    inputSchema: {
      task_id: taskId,
      file_path: z.string().describe("Absolute path of the local file to upload"),
      filename: z.string().optional().describe("Name shown in ClickUp (default: the file's own name)"),
    },
  }, async ({ task_id, file_path, filename }) => {
    const content = await readFile(file_path);
    const data = await postForm<Obj>(
      `/task/${task_id}/attachment`,
      attachmentForm(content, filename ?? basename(file_path)),
    );
    return jsonResult({ id: data.id, title: data.title, url: data.url });
  });
}

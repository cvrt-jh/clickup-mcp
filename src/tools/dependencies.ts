import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { post, del } from "../client.js";
import { taskId, jsonResult } from "../types.js";
import { slimTask } from "../slim.js";

type Obj = Record<string, unknown>;

export function register(server: McpServer) {
  server.registerTool("clickup_add_dependency", {
    description: "Add a dependency between tasks (waiting_on or blocking)",
    inputSchema: {
      task_id: taskId.describe("The task to add the dependency to"),
      depends_on: z.string().optional().describe("Task ID this task is waiting on"),
      dependency_of: z.string().optional().describe("Task ID that this task blocks"),
    },
  }, async ({ task_id, depends_on, dependency_of }) => {
    if (!depends_on && !dependency_of) {
      throw new Error("Provide either depends_on or dependency_of");
    }
    const body: Record<string, string> = {};
    if (depends_on) body.depends_on = depends_on;
    if (dependency_of) body.dependency_of = dependency_of;
    const data = await post(`/task/${task_id}/dependency`, body);
    return jsonResult(data);
  });

  server.registerTool("clickup_delete_dependency", {
    description: "Remove a dependency. Note: uses query params, not body.",
    inputSchema: {
      task_id: taskId.describe("The task to remove the dependency from"),
      depends_on: z.string().optional().describe("Task ID this task was waiting on"),
      dependency_of: z.string().optional().describe("Task ID that this task was blocking"),
    },
  }, async ({ task_id, depends_on, dependency_of }) => {
    if (!depends_on && !dependency_of) {
      throw new Error("Provide either depends_on or dependency_of");
    }
    const query: Record<string, string | undefined> = {};
    if (depends_on) query.depends_on = depends_on;
    if (dependency_of) query.dependency_of = dependency_of;
    await del(`/task/${task_id}/dependency`, query);
    return jsonResult({ deleted: true, task_id });
  });

  server.registerTool("clickup_add_task_link", {
    description: "Link two tasks together",
    inputSchema: {
      task_id: taskId.describe("First task ID"),
      links_to: z.string().describe("Second task ID to link to"),
    },
  }, async ({ task_id, links_to }) => {
    const data = await post(`/task/${task_id}/link/${links_to}`) as Obj;
    return jsonResult(data.task ? { task: slimTask(data.task) } : { linked: true, task_id, links_to });
  });

  server.registerTool("clickup_delete_task_link", {
    description: "Remove a link between two tasks",
    inputSchema: {
      task_id: taskId.describe("First task ID"),
      links_to: z.string().describe("Second task ID to unlink"),
    },
  }, async ({ task_id, links_to }) => {
    await del(`/task/${task_id}/link/${links_to}`);
    return jsonResult({ deleted: true, task_id, links_to });
  });
}

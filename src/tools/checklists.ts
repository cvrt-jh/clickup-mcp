import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { post, put, del } from "../client.js";
import { taskId, checklistId, jsonResult } from "../types.js";

export function register(server: McpServer) {
  server.registerTool("clickup_create_checklist", {
    description: "Create a checklist on a task",
    inputSchema: {
      task_id: taskId,
      name: z.string().describe("Checklist name"),
    },
  }, async ({ task_id, name }) => {
    const data = await post(`/task/${task_id}/checklist`, { name });
    return jsonResult(data);
  });

  server.registerTool("clickup_edit_checklist", {
    description: "Rename or reorder a checklist",
    inputSchema: {
      checklist_id: checklistId,
      name: z.string().optional().describe("New checklist name"),
      position: z.number().optional().describe("New position (0-indexed)"),
    },
  }, async ({ checklist_id, name, position }) => {
    const body: Record<string, unknown> = {};
    if (name !== undefined) body.name = name;
    if (position !== undefined) body.position = position;
    const data = await put(`/checklist/${checklist_id}`, body);
    return jsonResult(data);
  });

  server.registerTool("clickup_delete_checklist", {
    description: "Delete a checklist and all its items",
    inputSchema: {
      checklist_id: checklistId,
    },
  }, async ({ checklist_id }) => {
    await del(`/checklist/${checklist_id}`);
    return jsonResult({ deleted: true, checklist_id });
  });

  server.registerTool("clickup_create_checklist_item", {
    description: "Add an item to a checklist",
    inputSchema: {
      checklist_id: checklistId,
      name: z.string().describe("Item name"),
      assignee: z.number().optional().describe("User ID to assign"),
    },
  }, async ({ checklist_id, name, assignee }) => {
    const body: Record<string, unknown> = { name };
    if (assignee !== undefined) body.assignee = assignee;
    const data = await post(`/checklist/${checklist_id}/checklist_item`, body);
    return jsonResult(data);
  });

  server.registerTool("clickup_edit_checklist_item", {
    description: "Edit a checklist item (name, resolved status, assignee, or parent)",
    inputSchema: {
      checklist_id: checklistId,
      checklist_item_id: z.string().describe("Checklist item ID"),
      name: z.string().optional().describe("New item name"),
      resolved: z.boolean().optional().describe("Mark as resolved/unresolved"),
      assignee: z.number().optional().describe("User ID to assign (or null to unassign)"),
      parent: z.string().optional().describe("Parent checklist item ID (to nest items)"),
    },
  }, async ({ checklist_id, checklist_item_id, ...body }) => {
    const data = await put(`/checklist/${checklist_id}/checklist_item/${checklist_item_id}`, body);
    return jsonResult(data);
  });

  server.registerTool("clickup_delete_checklist_item", {
    description: "Delete a checklist item",
    inputSchema: {
      checklist_id: checklistId,
      checklist_item_id: z.string().describe("Checklist item ID"),
    },
  }, async ({ checklist_id, checklist_item_id }) => {
    await del(`/checklist/${checklist_id}/checklist_item/${checklist_item_id}`);
    return jsonResult({ deleted: true, checklist_id, checklist_item_id });
  });
}

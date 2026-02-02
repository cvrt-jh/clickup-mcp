import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get, post, put, del } from "../client.js";
import { spaceId, taskId, jsonResult } from "../types.js";

export function register(server: McpServer) {
  server.registerTool("clickup_get_space_tags", {
    description: "List all tags in a space",
    inputSchema: {
      space_id: spaceId,
    },
  }, async ({ space_id }) => {
    const data = await get(`/space/${space_id}/tag`);
    return jsonResult(data);
  });

  server.registerTool("clickup_create_space_tag", {
    description: "Create a new tag in a space",
    inputSchema: {
      space_id: spaceId,
      name: z.string().describe("Tag name"),
      tag_fg: z.string().optional().describe("Foreground color hex (e.g. '#ffffff')"),
      tag_bg: z.string().optional().describe("Background color hex (e.g. '#000000')"),
    },
  }, async ({ space_id, name, tag_fg, tag_bg }) => {
    const tag: Record<string, string> = { name };
    if (tag_fg) tag.tag_fg = tag_fg;
    if (tag_bg) tag.tag_bg = tag_bg;
    const data = await post(`/space/${space_id}/tag`, { tag });
    return jsonResult(data);
  });

  server.registerTool("clickup_edit_space_tag", {
    description: "Edit (rename or recolor) a tag in a space",
    inputSchema: {
      space_id: spaceId,
      tag_name: z.string().describe("Current tag name"),
      new_name: z.string().optional().describe("New tag name"),
      tag_fg: z.string().optional().describe("New foreground color hex"),
      tag_bg: z.string().optional().describe("New background color hex"),
    },
  }, async ({ space_id, tag_name, new_name, tag_fg, tag_bg }) => {
    const tag: Record<string, string> = {};
    if (new_name) tag.name = new_name;
    if (tag_fg) tag.tag_fg = tag_fg;
    if (tag_bg) tag.tag_bg = tag_bg;
    const data = await put(`/space/${space_id}/tag/${encodeURIComponent(tag_name)}`, { tag });
    return jsonResult(data);
  });

  server.registerTool("clickup_delete_space_tag", {
    description: "Delete a tag from a space",
    inputSchema: {
      space_id: spaceId,
      tag_name: z.string().describe("Tag name to delete"),
    },
  }, async ({ space_id, tag_name }) => {
    await del(`/space/${space_id}/tag/${encodeURIComponent(tag_name)}`);
    return jsonResult({ deleted: true, tag_name });
  });

  server.registerTool("clickup_add_tag_to_task", {
    description: "Add a tag to a task",
    inputSchema: {
      task_id: taskId,
      tag_name: z.string().describe("Tag name to add"),
    },
  }, async ({ task_id, tag_name }) => {
    const data = await post(`/task/${task_id}/tag/${encodeURIComponent(tag_name)}`);
    return jsonResult(data);
  });

  server.registerTool("clickup_remove_tag_from_task", {
    description: "Remove a tag from a task",
    inputSchema: {
      task_id: taskId,
      tag_name: z.string().describe("Tag name to remove"),
    },
  }, async ({ task_id, tag_name }) => {
    await del(`/task/${task_id}/tag/${encodeURIComponent(tag_name)}`);
    return jsonResult({ removed: true, task_id, tag_name });
  });
}

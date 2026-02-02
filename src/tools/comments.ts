import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get, post, put } from "../client.js";
import { taskId, commentId, jsonResult } from "../types.js";
import { slimCommentResponse } from "../slim.js";

export function register(server: McpServer) {
  server.registerTool("clickup_create_comment", {
    description: "Add a comment to a task",
    inputSchema: {
      task_id: taskId,
      comment_text: z.string().describe("Comment text"),
      assignee: z.number().optional().describe("User ID to assign with this comment"),
      notify_all: z.boolean().optional().describe("Notify all assignees (default true)"),
    },
  }, async ({ task_id, ...body }) => {
    const data = await post(`/task/${task_id}/comment`, body);
    return jsonResult(slimCommentResponse(data));
  });

  server.registerTool("clickup_get_comments", {
    description: "Get comments on a task (paginated, 25 per page)",
    inputSchema: {
      task_id: taskId,
      start: z.number().optional().describe("Start offset for pagination"),
      start_id: z.string().optional().describe("Comment ID to start from"),
    },
  }, async ({ task_id, start, start_id }) => {
    const query: Record<string, string | undefined> = {};
    if (start !== undefined) query.start = String(start);
    if (start_id) query.start_id = start_id;
    const data = await get(`/task/${task_id}/comment`, query);
    return jsonResult(data);
  });

  server.registerTool("clickup_update_comment", {
    description: "Edit a comment's text or resolve/unresolve it",
    inputSchema: {
      comment_id: commentId,
      comment_text: z.string().optional().describe("New comment text"),
      assignee: z.number().optional().describe("New assignee user ID"),
      resolved: z.boolean().optional().describe("Mark as resolved/unresolved"),
    },
  }, async ({ comment_id, ...body }) => {
    const data = await put(`/comment/${comment_id}`, body);
    return jsonResult(data);
  });

  server.registerTool("clickup_create_reply", {
    description: "Add a threaded reply to a comment",
    inputSchema: {
      comment_id: commentId,
      comment_text: z.string().describe("Reply text"),
    },
  }, async ({ comment_id, comment_text }) => {
    const data = await post(`/comment/${comment_id}/reply`, { comment_text });
    return jsonResult(slimCommentResponse(data));
  });

  server.registerTool("clickup_get_replies", {
    description: "Get threaded replies to a comment",
    inputSchema: {
      comment_id: commentId,
    },
  }, async ({ comment_id }) => {
    const data = await get(`/comment/${comment_id}/reply`);
    return jsonResult(data);
  });
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get, post, put, del } from "../client.js";
import {
  taskId, listId, teamId,
  priority, assignees, tags, dueDate, startDate, timeEstimate,
  customFieldValue, jsonResult,
} from "../types.js";
import { slimTask, slimArray } from "../slim.js";

export function register(server: McpServer) {
  server.registerTool("clickup_get_task", {
    description: "Get a task by its ID",
    inputSchema: {
      task_id: taskId,
      include_subtasks: z.boolean().optional().describe("Include subtasks (default false)"),
      include_markdown_description: z.boolean().optional().describe("Return description as markdown"),
    },
  }, async ({ task_id, include_subtasks, include_markdown_description }) => {
    const query: Record<string, string | undefined> = {};
    if (include_subtasks) query.include_subtasks = "true";
    if (include_markdown_description) query.include_markdown_description = "true";
    const data = await get(`/task/${task_id}`, query);
    return jsonResult(slimTask(data));
  });

  server.registerTool("clickup_create_task", {
    description: "Create a new task in a list",
    inputSchema: {
      list_id: listId,
      name: z.string().describe("Task name"),
      description: z.string().optional().describe("Task description (plain text or markdown)"),
      markdown_description: z.string().optional().describe("Task description in markdown"),
      status: z.string().optional().describe("Status name (must match list's statuses)"),
      priority: priority,
      assignees: assignees,
      tags: tags,
      due_date: dueDate,
      due_date_time: z.boolean().optional().describe("Whether due_date includes time"),
      start_date: startDate,
      start_date_time: z.boolean().optional().describe("Whether start_date includes time"),
      time_estimate: timeEstimate,
      parent: z.string().optional().describe("Parent task ID (to create subtask)"),
      notify_all: z.boolean().optional().describe("Notify assignees (default true)"),
      custom_fields: z.array(z.object({
        id: z.string().describe("Custom field ID"),
        value: customFieldValue,
      })).optional().describe("Custom field values to set"),
    },
  }, async ({ list_id, ...body }) => {
    const data = await post(`/list/${list_id}/task`, body);
    return jsonResult(slimTask(data));
  });

  server.registerTool("clickup_update_task", {
    description: "Update a task. Assignees use add/rem arrays, not a flat list.",
    inputSchema: {
      task_id: taskId,
      name: z.string().optional().describe("New task name"),
      description: z.string().optional().describe("New description"),
      markdown_description: z.string().optional().describe("New description in markdown"),
      status: z.string().optional().describe("New status"),
      priority: priority,
      assignees: z.object({
        add: z.array(z.number()).optional().describe("User IDs to add"),
        rem: z.array(z.number()).optional().describe("User IDs to remove"),
      }).optional().describe("Assignee changes (add/rem)"),
      due_date: dueDate,
      due_date_time: z.boolean().optional(),
      start_date: startDate,
      start_date_time: z.boolean().optional(),
      time_estimate: timeEstimate,
      parent: z.string().optional().describe("Move to new parent (set null to unparent)"),
      archived: z.boolean().optional().describe("Archive/unarchive the task"),
    },
  }, async ({ task_id, ...body }) => {
    const data = await put(`/task/${task_id}`, body);
    return jsonResult(slimTask(data));
  });

  server.registerTool("clickup_get_tasks", {
    description: "List tasks in a list with optional filters",
    inputSchema: {
      list_id: listId,
      archived: z.boolean().optional().describe("Include archived tasks"),
      page: z.number().optional().describe("Page number (0-indexed)"),
      order_by: z.enum(["id", "created", "updated", "due_date"]).optional(),
      reverse: z.boolean().optional().describe("Reverse sort order"),
      subtasks: z.boolean().optional().describe("Include subtasks"),
      statuses: z.array(z.string()).optional().describe("Filter by status names"),
      include_closed: z.boolean().optional().describe("Include closed tasks"),
      assignees: z.array(z.string()).optional().describe("Filter by assignee IDs"),
      due_date_gt: z.number().optional().describe("Due date greater than (ms)"),
      due_date_lt: z.number().optional().describe("Due date less than (ms)"),
      date_created_gt: z.number().optional().describe("Created after (ms)"),
      date_created_lt: z.number().optional().describe("Created before (ms)"),
      date_updated_gt: z.number().optional().describe("Updated after (ms)"),
      date_updated_lt: z.number().optional().describe("Updated before (ms)"),
      include_markdown_description: z.boolean().optional(),
    },
  }, async ({ list_id, statuses, assignees: filterAssignees, ...rest }) => {
    const query: Record<string, string | string[] | undefined> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        query[key] = String(value);
      }
    }
    if (statuses) query["statuses[]"] = statuses;
    if (filterAssignees) query["assignees[]"] = filterAssignees;
    const data = await get(`/list/${list_id}/task`, query);
    return jsonResult(slimArray(data, "tasks", slimTask));
  });

  server.registerTool("clickup_search_tasks", {
    description: "Search tasks across an entire workspace",
    inputSchema: {
      team_id: teamId,
      page: z.number().optional().describe("Page number (0-indexed)"),
      order_by: z.enum(["id", "created", "updated", "due_date"]).optional(),
      reverse: z.boolean().optional(),
      subtasks: z.boolean().optional(),
      statuses: z.array(z.string()).optional(),
      include_closed: z.boolean().optional(),
      assignees: z.array(z.string()).optional(),
      list_ids: z.array(z.string()).optional().describe("Filter by list IDs"),
      space_ids: z.array(z.string()).optional().describe("Filter by space IDs"),
      folder_ids: z.array(z.string()).optional().describe("Filter by folder IDs"),
      project_ids: z.array(z.string()).optional().describe("Filter by project IDs"),
      due_date_gt: z.number().optional(),
      due_date_lt: z.number().optional(),
      date_created_gt: z.number().optional(),
      date_created_lt: z.number().optional(),
      date_updated_gt: z.number().optional(),
      date_updated_lt: z.number().optional(),
      include_markdown_description: z.boolean().optional(),
    },
  }, async ({ team_id, statuses, assignees: filterAssignees, list_ids, space_ids, folder_ids, project_ids, ...rest }) => {
    const query: Record<string, string | string[] | undefined> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        query[key] = String(value);
      }
    }
    if (statuses) query["statuses[]"] = statuses;
    if (filterAssignees) query["assignees[]"] = filterAssignees;
    if (list_ids) query["list_ids[]"] = list_ids;
    if (space_ids) query["space_ids[]"] = space_ids;
    if (folder_ids) query["folder_ids[]"] = folder_ids;
    if (project_ids) query["project_ids[]"] = project_ids;
    const data = await get(`/team/${team_id}/task`, query);
    return jsonResult(slimArray(data, "tasks", slimTask));
  });

  server.registerTool("clickup_set_custom_field", {
    description: "Set a custom field value on a task (update_task cannot do this)",
    inputSchema: {
      task_id: taskId,
      field_id: z.string().describe("Custom field ID"),
      value: customFieldValue,
    },
  }, async ({ task_id, field_id, value }) => {
    const data = await post(`/task/${task_id}/field/${field_id}`, { value });
    return jsonResult(data);
  });

  server.registerTool("clickup_delete_task", {
    description: "Permanently delete a task",
    inputSchema: {
      task_id: taskId,
    },
  }, async ({ task_id }) => {
    await del(`/task/${task_id}`);
    return jsonResult({ deleted: true, task_id });
  });
}

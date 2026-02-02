import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get, post, del } from "../client.js";
import { teamId, spaceId, folderId, listId, jsonResult } from "../types.js";
import { slimSpace, slimFolder, slimList, slimArray } from "../slim.js";

export function register(server: McpServer) {
  server.registerTool("clickup_whoami", {
    description: "Get current user info and list of workspaces with members",
    inputSchema: {},
  }, async () => {
    const [userData, teamsData] = await Promise.all([
      get<{ user: Record<string, unknown> }>("/user"),
      get<{ teams: Array<{ id: string; name: string; members: unknown[] }> }>("/team"),
    ]);
    const user = userData.user;
    const workspaces = teamsData.teams.map((t) => ({
      id: t.id,
      name: t.name,
      member_count: t.members.length,
    }));
    return jsonResult({
      id: user.id,
      username: user.username,
      email: user.email,
      timezone: user.timezone,
      workspaces,
    });
  });

  server.registerTool("clickup_get_spaces", {
    description: "List all spaces in a workspace",
    inputSchema: {
      team_id: teamId,
      archived: z.boolean().optional().describe("Include archived spaces (default false)"),
    },
  }, async ({ team_id, archived }) => {
    const data = await get(`/team/${team_id}/space`, {
      archived: archived ? "true" : undefined,
    });
    return jsonResult(slimArray(data, "spaces", slimSpace));
  });

  server.registerTool("clickup_get_folders", {
    description: "List folders in a space (includes nested lists)",
    inputSchema: {
      space_id: spaceId,
      archived: z.boolean().optional().describe("Include archived folders (default false)"),
    },
  }, async ({ space_id, archived }) => {
    const data = await get(`/space/${space_id}/folder`, {
      archived: archived ? "true" : undefined,
    });
    return jsonResult(slimArray(data, "folders", slimFolder));
  });

  server.registerTool("clickup_get_lists", {
    description: "Get lists in a folder, or folderless lists in a space. Provide either folder_id or space_id.",
    inputSchema: {
      folder_id: folderId.optional(),
      space_id: spaceId.optional(),
      archived: z.boolean().optional().describe("Include archived lists (default false)"),
    },
  }, async ({ folder_id, space_id, archived }) => {
    if (!folder_id && !space_id) {
      throw new Error("Provide either folder_id or space_id");
    }
    const path = folder_id
      ? `/folder/${folder_id}/list`
      : `/space/${space_id}/list`;
    const data = await get(path, {
      archived: archived ? "true" : undefined,
    });
    return jsonResult(slimArray(data, "lists", slimList));
  });

  server.registerTool("clickup_get_list", {
    description: "Get a single list's details including its statuses",
    inputSchema: {
      list_id: listId,
    },
  }, async ({ list_id }) => {
    const data = await get(`/list/${list_id}`);
    return jsonResult(slimList(data));
  });

  server.registerTool("clickup_create_list", {
    description: "Create a new list in a folder or as a folderless list in a space",
    inputSchema: {
      folder_id: folderId.optional().describe("Folder ID (for list inside folder)"),
      space_id: spaceId.optional().describe("Space ID (for folderless list)"),
      name: z.string().describe("List name"),
      content: z.string().optional().describe("List description"),
      due_date: z.number().optional().describe("Due date as Unix timestamp in milliseconds"),
      priority: z.number().optional().describe("Priority (1=urgent, 2=high, 3=normal, 4=low)"),
      status: z.string().optional().describe("Status name to use as default"),
    },
  }, async ({ folder_id, space_id, name, content, due_date, priority, status }) => {
    if (!folder_id && !space_id) {
      throw new Error("Provide either folder_id or space_id");
    }
    const path = folder_id
      ? `/folder/${folder_id}/list`
      : `/space/${space_id}/list`;
    const body: Record<string, unknown> = { name };
    if (content) body.content = content;
    if (due_date) body.due_date = due_date;
    if (priority) body.priority = priority;
    if (status) body.status = status;
    const data = await post(path, body);
    return jsonResult(slimList(data));
  });

  server.registerTool("clickup_delete_list", {
    description: "Delete a list. This is permanent and cannot be undone.",
    inputSchema: {
      list_id: listId,
    },
  }, async ({ list_id }) => {
    await del(`/list/${list_id}`);
    return jsonResult({ deleted: true, list_id });
  });
}

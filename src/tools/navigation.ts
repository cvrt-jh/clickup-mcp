import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../client.js";
import { teamId, spaceId, folderId, listId, jsonResult } from "../types.js";

export function register(server: McpServer) {
  server.registerTool("clickup_whoami", {
    description: "Get current user info and list of workspaces with members",
    inputSchema: {},
  }, async () => {
    const [user, teams] = await Promise.all([
      get("/user"),
      get("/team"),
    ]);
    return jsonResult({ user, teams });
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
    return jsonResult(data);
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
    return jsonResult(data);
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
    return jsonResult(data);
  });

  server.registerTool("clickup_get_list", {
    description: "Get a single list's details including its statuses",
    inputSchema: {
      list_id: listId,
    },
  }, async ({ list_id }) => {
    const data = await get(`/list/${list_id}`);
    return jsonResult(data);
  });
}

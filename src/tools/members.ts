import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../client.js";
import { listId, jsonResult } from "../types.js";

export function register(server: McpServer) {
  server.registerTool("clickup_get_workspace_members", {
    description: "Get all members across all workspaces (extracted from teams response)",
    inputSchema: {},
  }, async () => {
    const data = await get<{ teams: Array<{ id: string; name: string; members: unknown[] }> }>("/team");
    const members = data.teams.flatMap((team) =>
      team.members.map((m) => ({ workspace_id: team.id, workspace_name: team.name, ...m as Record<string, unknown> }))
    );
    return jsonResult({ members });
  });

  server.registerTool("clickup_get_list_members", {
    description: "Get members with access to a specific list",
    inputSchema: {
      list_id: listId,
    },
  }, async ({ list_id }) => {
    const data = await get(`/list/${list_id}/member`);
    return jsonResult(data);
  });
}

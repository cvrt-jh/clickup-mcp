import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { register as registerNavigation } from "./tools/navigation.js";
import { register as registerTasks } from "./tools/tasks.js";
import { register as registerTags } from "./tools/tags.js";
import { register as registerChecklists } from "./tools/checklists.js";
import { register as registerDependencies } from "./tools/dependencies.js";
import { register as registerComments } from "./tools/comments.js";
import { register as registerMembers } from "./tools/members.js";

const server = new McpServer({
  name: "clickup-mcp",
  version: "1.0.0",
});

registerNavigation(server);
registerTasks(server);
registerTags(server);
registerChecklists(server);
registerDependencies(server);
registerComments(server);
registerMembers(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("clickup-mcp server running on stdio");

#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { register as registerNavigation } from "./tools/navigation.js";
import { register as registerTasks } from "./tools/tasks.js";
import { register as registerTags } from "./tools/tags.js";
import { register as registerChecklists } from "./tools/checklists.js";
import { register as registerDependencies } from "./tools/dependencies.js";
import { register as registerComments } from "./tools/comments.js";
import { register as registerMembers } from "./tools/members.js";
import { register as registerAttachments } from "./tools/attachments.js";

// One version source: package.json (was a hardcoded "1.0.0" next to 1.0.4).
const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

const server = new McpServer({
  name: "clickup-mcp",
  version,
});

registerNavigation(server);
registerTasks(server);
registerTags(server);
registerChecklists(server);
registerDependencies(server);
registerComments(server);
registerMembers(server);
registerAttachments(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("clickup-mcp server running on stdio");

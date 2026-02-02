# clickup-mcp

Lightweight ClickUp MCP server focused on task management. Replaces the official ClickUp MCP with a minimal, fast implementation covering 35 tools.

All API responses are automatically slimmed to reduce token usage — verbose fields like `features`, `sharing`, `watchers`, and full user objects are stripped down to essentials.

## Setup

```bash
npm install
npm run build
```

## Configuration

Add via Claude Code CLI:

```bash
claude mcp add -s user clickup -- bash -c 'source ~/path/to/.env && exec env CLICKUP_API_TOKEN="$CLICKUP_API_TOKEN" node /path/to/clickup-mcp/build/index.js'
```

Or add manually to `~/.claude.json` under `mcpServers`:

```json
"clickup": {
  "type": "stdio",
  "command": "bash",
  "args": ["-c", "source ~/path/to/.env && exec env CLICKUP_API_TOKEN=\"$CLICKUP_API_TOKEN\" node /path/to/clickup-mcp/build/index.js"]
}
```

Requires a ClickUp Personal API Token (`CLICKUP_API_TOKEN`). Generate one at ClickUp Settings > Apps.

## Response Slimming

All responses are automatically trimmed to save tokens. The ClickUp API returns extremely verbose JSON — this server strips it down to what matters.

**`clickup_whoami`** — from ~3,500 chars to ~160:
```json
// Before (ClickUp API raw)
{"user":{"id":12345678,"username":"Jane Doe","email":"jane@example.com","color":"#0388d1",
"profilePicture":"https://attachments.clickup.com/...","initials":"JD",
"week_start_day":1,"global_font_support":true,"timezone":"Europe/Berlin"},
"teams":{"teams":[{"id":"99999999","name":"My Workspace","color":"#40BC86",
"avatar":"https://attachments2.clickup.com/...?Expires=...&Key-Pair-Id=...&Signature=...",
"members":[{"user":{"id":11111111,"username":"Bob Smith","email":"bob@example.com",
"color":"#aa2fff","profilePicture":null,"initials":"BS","role":4,"role_subtype":2,
"role_key":"guest","custom_role":null,"last_active":"...","date_joined":"...",
"date_invited":"..."},"invited_by":{"id":22222222,...},
"can_see_time_spent":true,...}, ...]}]}}

// After (slimmed)
{"id":12345678,"username":"Jane Doe","email":"jane@example.com",
"timezone":"Europe/Berlin","workspaces":[{"id":"99999999",
"name":"My Workspace","member_count":4}]}
```

**`clickup_create_comment`** — from ~1,500 chars to 38:
```json
// Before
{"id":90150191300876,"hist_id":"...","date":1770053982842,
"version":{"object_type":"comment","object_id":"...","workspace_id":99999999,
"operation":"c","data":{"context":{"root_parent_type":1,"is_chat":false,
"audit_context":{"userid":12345678,"current_time":...,"route":"*"},...},...},...}}

// After
{"id":90150191300876,"date":1770053982842}
```

**What gets stripped:**

| Field | Where | Why |
|-------|-------|-----|
| `features{}` | spaces | ~50 lines of boolean flags per space |
| `sharing{}`, `permission_level` | tasks | Internal access config, not useful |
| `watchers[]` | tasks | Usually same as assignees |
| Full user objects | everywhere | Reduced to `{id, username, email}` |
| `profilePicture`, `initials`, `color` | users | Visual metadata, not useful for LLMs |
| `version{}` blobs | comment/reply creates | Internal versioning data |
| `invited_by`, `profileInfo` | members | Invitation metadata |
| Pretty-print JSON | all responses | Compact single-line output |
| Empty arrays | tasks | `checklists`, `dependencies`, `custom_fields` omitted when empty |

## Tools (35)

### Navigation (5)
- `clickup_whoami` - Current user + workspaces
- `clickup_get_spaces` - Spaces in workspace
- `clickup_get_folders` - Folders in space
- `clickup_get_lists` - Lists in folder or space
- `clickup_get_list` - Single list details

### Task CRUD (5)
- `clickup_get_task` - Get task by ID
- `clickup_create_task` - Create task with all fields
- `clickup_update_task` - Update any task field
- `clickup_get_tasks` - List tasks in a list
- `clickup_search_tasks` - Search tasks across workspace

### Custom Fields (1)
- `clickup_set_custom_field` - Set custom field value

### Tags (6)
- `clickup_get_space_tags` - List space tags
- `clickup_create_space_tag` - Create tag
- `clickup_edit_space_tag` - Edit tag
- `clickup_delete_space_tag` - Delete tag
- `clickup_add_tag_to_task` - Tag a task
- `clickup_remove_tag_from_task` - Untag a task

### Checklists (6)
- `clickup_create_checklist` - Create checklist
- `clickup_edit_checklist` - Edit checklist
- `clickup_delete_checklist` - Delete checklist
- `clickup_create_checklist_item` - Add item
- `clickup_edit_checklist_item` - Edit item
- `clickup_delete_checklist_item` - Delete item

### Dependencies (4)
- `clickup_add_dependency` - Add dependency
- `clickup_delete_dependency` - Remove dependency
- `clickup_add_task_link` - Link tasks
- `clickup_delete_task_link` - Unlink tasks

### Comments (5)
- `clickup_create_comment` - Add comment
- `clickup_get_comments` - Get comments
- `clickup_update_comment` - Edit/resolve comment
- `clickup_create_reply` - Threaded reply
- `clickup_get_replies` - Get replies

### Delete Task (1)
- `clickup_delete_task` - Delete a task

### Workspace Members (2)
- `clickup_get_workspace_members` - All workspace members
- `clickup_get_list_members` - List-specific members

## Architecture

```
src/
  index.ts          # Entry: McpServer + StdioServerTransport
  client.ts         # ClickUp API v2 fetch wrapper
  types.ts          # Shared Zod schemas + jsonResult helper
  slim.ts           # Response slimming transformers
  tools/
    navigation.ts   # 5 tools
    tasks.ts        # 7 tools (CRUD + custom fields + delete)
    tags.ts         # 6 tools
    checklists.ts   # 6 tools
    dependencies.ts # 4 tools
    comments.ts     # 5 tools
    members.ts      # 2 tools
```

## License

MIT

# clickup-mcp

Lightweight ClickUp MCP server focused on task management. Replaces the official ClickUp MCP with a minimal, fast implementation covering 35 tools.

## Setup

```bash
npm install
npm run build
```

## Configuration

Add to `~/.claude/.mcp.json`:

```json
{
  "clickup": {
    "type": "stdio",
    "command": "node",
    "args": ["/path/to/clickup-mcp/build/index.js"],
    "env": {
      "CLICKUP_API_TOKEN": "your-token-here"
    }
  }
}
```

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

## License

MIT

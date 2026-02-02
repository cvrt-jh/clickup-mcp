# Registry Submissions

Status of clickup-mcp registry submissions.

---

## Submission Status

| Registry | Status | Link |
|----------|--------|------|
| npm | **Published** | [@cavort-it-systems/clickup-mcp](https://www.npmjs.com/package/@cavort-it-systems/clickup-mcp) |
| GitHub Releases | **Published** | [v1.0.1](https://github.com/cvrt-jh/clickup-mcp/releases/tag/v1.0.1) |
| Official MCP Registry | **Published** | io.github.cvrt-jh/clickup-mcp |
| mcpservers.org | Submitted | Pending review |
| MCP.so | Not submitted | Optional |

---

## 1. Official MCP Registry (registry.modelcontextprotocol.io)

**Status: PUBLISHED**

Published as `io.github.cvrt-jh/clickup-mcp` using mcp-publisher CLI.

### To Update

```bash
cd /Users/jh/Git/cvrt-jh/clickup-mcp

# Bump version in package.json and server.json
# Publish to npm first
npm publish --access public

# Then update MCP registry
mcp-publisher publish
```

### GitHub Actions (Optional)

Add `.github/workflows/publish-mcp.yml` for automatic publishing on release:

```yaml
name: Publish to MCP Registry
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
    steps:
      - uses: modelcontextprotocol/registry-action@v1
        with:
          name: io.github.cvrt-jh/clickup-mcp
```

---

## 2. awesome-mcp-servers (mcpservers.org)

**Status: SUBMITTED** (Feb 2026)

Submitted at: https://mcpservers.org/submit

**Form values used:**

| Field | Value |
|-------|-------|
| Server Name | clickup-mcp |
| Short Description | Lightweight ClickUp MCP server with 35 tools. Token-optimized responses reduce API verbosity by 95%+ (3500 chars → 160). Tasks, comments, checklists, tags, dependencies. |
| Link | https://github.com/cvrt-jh/clickup-mcp |
| Category | productivity |
| Contact Email | jh@cavort.de |

---

## 3. MCP.so (Optional)

**Status: NOT SUBMITTED**

Submit at: https://mcp.so

**Details:**
- Name: clickup-mcp
- URL: https://github.com/cvrt-jh/clickup-mcp
- npm: @cavort-it-systems/clickup-mcp
- Description: Token-optimized ClickUp MCP server. 35 tools covering tasks, comments, checklists, tags, dependencies. Reduces API response size by 95%+.

---

## Completed Checklist

- [x] GitHub topics added (8 topics)
- [x] package.json updated for npm
- [x] README with badges and clear install instructions
- [x] Published to npm v1.0.1
- [x] GitHub release v1.0.1
- [x] Official MCP Registry published
- [x] mcpservers.org submitted

---

## Installation

```bash
npx @cavort-it-systems/clickup-mcp
```

## Configuration

```bash
claude mcp add clickup -e CLICKUP_API_TOKEN=xxx -- npx @cavort-it-systems/clickup-mcp
```

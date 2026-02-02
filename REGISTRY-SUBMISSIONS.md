# Registry Submissions

Guide for submitting clickup-mcp to MCP registries.

---

## 1. Official MCP Registry (registry.modelcontextprotocol.io)

### Method: Publisher CLI

```bash
# Clone registry tools
git clone https://github.com/modelcontextprotocol/registry.git
cd registry

# Build publisher
make publisher

# Authenticate with GitHub
./bin/mcp-publisher login --github

# Publish (namespace based on GitHub user)
./bin/mcp-publisher publish \
  --name "io.github.cvrt-jh/clickup-mcp" \
  --description "Lightweight ClickUp MCP server - 35 tools with token-optimized responses (95%+ reduction)" \
  --repository "https://github.com/cvrt-jh/clickup-mcp" \
  --npm "@cvrt-jh/clickup-mcp"
```

### Alternative: GitHub Actions

Add `.github/workflows/publish-mcp.yml`:

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

### Submit at: https://mcpservers.org/submit

**Form values:**

| Field | Value |
|-------|-------|
| Server Name | clickup-mcp |
| Short Description | Lightweight ClickUp MCP server with 35 tools. Token-optimized responses reduce API verbosity by 95%+ (3500 chars → 160). Tasks, comments, checklists, tags, dependencies. |
| Link | https://github.com/cvrt-jh/clickup-mcp |
| Category | productivity |
| Contact Email | jh@cavort.de |

**Notes:**
- Free submission (no payment required)
- Premium ($39) gets faster review + badge

---

## 3. MCP.so

### Submit at: https://mcp.so (look for submit/add button)

**Details:**
- Name: clickup-mcp
- URL: https://github.com/cvrt-jh/clickup-mcp
- npm: @cvrt-jh/clickup-mcp
- Description: Token-optimized ClickUp MCP server. 35 tools covering tasks, comments, checklists, tags, dependencies. Reduces API response size by 95%+.

---

## Pre-Submission Checklist

- [x] GitHub topics added
- [x] package.json updated for npm
- [x] README with badges and clear install instructions
- [ ] Publish to npm: `npm publish --access public`
- [ ] Create GitHub release v1.0.0
- [ ] Submit to registries (above)

---

## After Publishing to npm

Update Claude config examples to use simpler command:

```bash
claude mcp add clickup -e CLICKUP_API_TOKEN=xxx -- npx @cvrt-jh/clickup-mcp
```

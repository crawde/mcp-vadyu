# Installing Vadyu 2.0 MCP Server in Cline / Claude Code / Cursor

## Option 1: Zero-Install Streamable HTTP (Recommended)

`vadyu_preview_storefront`, `vadyu_list_recipes`, `vadyu_list_sequences_and_formats`, `resources`, and `prompts` work immediately **without an API key**. Add `Authorization` only when rendering paid MP4 ads:

```json
{
  "mcpServers": {
    "vadyu": {
      "type": "streamableHttp",
      "url": "https://vadyu.com/api/mcp"
    }
  }
}
```

With an API key (`vadyu_live_...` from https://vadyu.com/dashboard):

```json
{
  "mcpServers": {
    "vadyu": {
      "type": "streamableHttp",
      "url": "https://vadyu.com/api/mcp",
      "headers": {
        "Authorization": "Bearer vadyu_live_YOUR_API_KEY"
      }
    }
  }
}
```

## Option 2: Local `stdio` via `npx`

```json
{
  "mcpServers": {
    "vadyu": {
      "command": "npx",
      "args": ["-y", "github:crawde/mcp-vadyu"],
      "env": {
        "VADYU_API_KEY": "vadyu_live_YOUR_API_KEY"
      }
    }
  }
}
```

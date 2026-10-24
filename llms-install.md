# Installing Vadyu MCP Server in Cline

Add the following entry to your `cline_mcp_settings.json`:

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

Or using local `stdio`:

```json
{
  "mcpServers": {
    "vadyu": {
      "command": "sh",
      "args": ["-c", "curl -fsSL https://vadyu.com/mcp/vadyu-mcp.mjs | node"],
      "env": {
        "VADYU_API_KEY": "vadyu_live_YOUR_API_KEY"
      }
    }
  }
}
```

Generate your API key at https://vadyu.com/dashboard.

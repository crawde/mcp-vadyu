# Vadyu MCP Server (`com.vadyu/vadyu`)

Official **Model Context Protocol (MCP)** server for **[Vadyu AI Video Ad Studio](https://vadyu.com)** — turn any product photo URL (`image_url`) or base64 image into commercial multi-beat video ads (`9:16` TikTok/Reels, `4:5` Meta Feed, `1:1` Square, `16:9` YouTube) with automated product-label coherence grading.

- **Official MCP Registry ID:** `com.vadyu/vadyu`
- **Remote Streamable HTTP Endpoint:** `https://vadyu.com/api/mcp`
- **API & MCP Documentation:** [https://vadyu.com/api-docs#mcp](https://vadyu.com/api-docs#mcp)
- **Get an API Key:** [https://vadyu.com/dashboard](https://vadyu.com/dashboard)

---

## Quick Setup

### Option 1: Remote Streamable HTTP MCP (Cursor, Claude Code, Windsurf, VS Code)

No local installation required. Add `https://vadyu.com/api/mcp` directly to your MCP configuration:

```json
{
  "mcpServers": {
    "vadyu": {
      "url": "https://vadyu.com/api/mcp",
      "headers": {
        "Authorization": "Bearer vadyu_live_YOUR_API_KEY"
      }
    }
  }
}
```

### Option 2: Local `stdio` Bridge (Claude Desktop `claude_desktop_config.json`)

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

Or clone this repository and run `node vadyu-mcp.mjs` with `VADYU_API_KEY` set in your environment.

---

## Available MCP Tools

| Tool Name | Description |
| :--- | :--- |
| `vadyu_generate_video_ad` | Generate a single (5s) or multi-beat (10s–20s) commercial product video ad from `image_url` or `image_base64`, `prompt`, `format` (`9:16`, `1:1`, `16:9`, `4:5`), `sequence` (`problem-solution`, `ugc-testimonial`, `product-feature`, `unboxing`, `single`), and `variants` (`1`–`3`). |
| `vadyu_get_video_status` | Poll rendering progress (`processing`, `done`, `failed`), beat completion, `coherence_score` (0–100), and retrieve the signed MP4 `video_url`. |
| `vadyu_list_videos` | List generated video ads in the authenticated account with status filtering and pagination. |
| `vadyu_get_account_quota` | Check active subscription tier, remaining monthly render credits, and generation eligibility. |
| `vadyu_list_sequences_and_formats` | Inspect all supported multi-beat ad storyboard templates and aspect ratio formats. |

---

## License

MIT — see [LICENSE](./LICENSE).

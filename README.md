# Vadyu 2.0 MCP Server (`com.vadyu/vadyu`)

[![Glama MCP Server](https://glama.ai/mcp/servers/crawde/mcp-vadyu/badges/score.svg)](https://glama.ai/mcp/servers/crawde/mcp-vadyu)
[![Verified on Appside](https://mcp.appside.build/mcp-servers/vadyu-com/badge.svg)](https://mcp.appside.build/mcp-servers/vadyu-com/)
[![Official MCP Registry](https://img.shields.io/badge/MCP_Registry-com.vadyu%2Fvadyu_v2.0.0-10b981)](https://registry.modelcontextprotocol.io/v0/servers?search=vadyu)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Official **Model Context Protocol (MCP)** server (`2026-07-28` / `2024-11-05`) for **[Vadyu 2.0 AI Commercial Video Ad Studio](https://vadyu.com)** — preview any Shopify or DTC store URL with **zero authentication** and render multi-cut commercial video ads (`9:16` TikTok/Reels, `4:5` Meta Feed, `1:1` Square, `16:9` YouTube/CTV) with precision product cutouts, live-action 3D studio lighting, golden-hour lifestyle cinema, and AI studio voiceover in ~60 seconds.

- **Official MCP Registry ID:** `com.vadyu/vadyu` (`v2.0.0`)
- **Remote Streamable HTTP Endpoint:** `https://vadyu.com/api/mcp`
- **Server Card & Discovery:** [`https://vadyu.com/.well-known/mcp/server-card.json`](https://vadyu.com/.well-known/mcp/server-card.json) · [`https://vadyu.com/.well-known/ai-catalog.json`](https://vadyu.com/.well-known/ai-catalog.json)
- **API & MCP Documentation:** [https://vadyu.com/api-docs#mcp](https://vadyu.com/api-docs#mcp)
- **Unlock an API Key (`vadyu_live_...`):** [https://vadyu.com/dashboard](https://vadyu.com/dashboard)
- **Privacy Policy & Support:** [https://vadyu.com/privacy](https://vadyu.com/privacy) · `hello@vadyu.com`

---

## Quick Setup

> **Zero-Auth Instant Start:** `vadyu_preview_storefront`, `vadyu_list_recipes`, `vadyu_list_sequences_and_formats`, `resources/read`, and `prompts/get` work **immediately without an API key**. Add `Authorization: Bearer vadyu_live_...` (or `VADYU_API_KEY`) when you want your agent to render full MP4 commercial ads.

### 1. Claude Code (`claude` CLI)

```bash
# Zero-auth preview & catalog:
claude mcp add --transport http vadyu https://vadyu.com/api/mcp

# Or with rendering API key:
claude mcp add --transport http vadyu https://vadyu.com/api/mcp \
  --header "Authorization: Bearer vadyu_live_YOUR_API_KEY"
```

### 2. Cursor / Windsurf / Cline (`mcp.json`)

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

### 3. VS Code / GitHub Copilot (`.vscode/mcp.json`)

```json
{
  "servers": {
    "vadyu": {
      "type": "http",
      "url": "https://vadyu.com/api/mcp"
    }
  }
}
```

### 4. Local `stdio` Runner (Claude Desktop / `npx` / Gemini CLI)

Zero runtime dependencies (Node.js 18+):

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

Or install as a **Gemini CLI Extension**:

```bash
gemini extensions install https://github.com/crawde/mcp-vadyu
```

---

## Available MCP Tools (7)

| Tool Name | Auth | Description |
| :--- | :---: | :--- |
| `vadyu_preview_storefront` | **Public (Free)** | Extract up to 4 hero product packshots, vertical detection, recommended Vadyu 2.0 commercial ad style, recommended 3-ad funnel, and a 1-click preloaded Studio URL from any Shopify or DTC store URL. |
| `vadyu_list_recipes` | **Public (Free)** | List all **20 curated Vadyu 2.0 Commercial Ad Styles**, **16 3-ad campaign funnels**, and **9 procedural audio moods**. |
| `vadyu_list_sequences_and_formats` | **Public (Free)** | List supported commercial aspect ratios (`9:16`, `4:5`, `1:1`, `16:9`), ad placements, and style IDs. |
| `vadyu_generate_video_ad` | `vadyu_live_...` | Render a multi-cut commercial video ad from `product_url`, `image_url`, `image_base64`, or 0-credit `reuse_video_id` across 20 curated styles or a 3-ad `campaign_preset`. |
| `vadyu_get_video_status` | `vadyu_live_...` | Check render progress, download MP4 `video_url`, `coherence_score`, and shareable Screening-Room `share_url`. |
| `vadyu_get_account_quota` | `vadyu_live_...` | Check active credit pack (`$9` Creator Pack / `$29` Starter Pack) or monthly plan and remaining video credits. |
| `vadyu_list_videos` | `vadyu_live_...` | List recent generated commercial video ads on the authenticated Vadyu account. |

## MCP Resources & Prompts

- **Resources:**
  - `vadyu://catalog/styles` — Live JSON catalog of all 20 commercial ad styles, 16 campaign funnels, 9 audio moods, and 4 aspect ratios.
  - `vadyu://pricing/packs` — Self-serve credit packs and monthly plans that unlock `vadyu_live_...` API & MCP keys.
- **Prompts:**
  - `storefront_to_ad` (`store_url`, `format`) — Preview any DTC storefront for free and generate a Pixel-Lock commercial video ad.
  - `three_ad_funnel` (`store_url`) — Launch a 3-stage Hero Studio + Scroll-Stop Hook + Proof/UGC paid-social video funnel.

---

## License

MIT — see [LICENSE](./LICENSE).

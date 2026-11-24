#!/usr/bin/env node
/**
 * Vadyu 2.0 AI Commercial Video Ad Studio — Official Stdio MCP Server (v2.0.0)
 * Zero-dependency Node.js Model Context Protocol (MCP) server over stdio.
 *
 * Public tools (vadyu_preview_storefront, vadyu_list_recipes, vadyu_list_sequences_and_formats),
 * resources, and prompts work out of the box with ZERO API key required.
 * Video rendering and account tools authenticate with VADYU_API_KEY (vadyu_live_...).
 *
 * Usage:
 *   npx -y github:crawde/mcp-vadyu
 *   VADYU_API_KEY="vadyu_live_..." npx -y github:crawde/mcp-vadyu
 */

import readline from "node:readline";

const SERVER_VERSION = "2.0.0";
const SUPPORTED_PROTOCOLS = ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const BASE_URL = (process.env.VADYU_API_URL || "https://vadyu.com").replace(/\/+$/, "");
const MCP_ENDPOINT = `${BASE_URL}/api/mcp`;

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  process.stdout.write(`${SERVER_VERSION}\n`);
  process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  process.stdout.write(
    [
      `mcp-vadyu v${SERVER_VERSION} — Vadyu 2.0 AI Commercial Video Ad Studio MCP Server`,
      "",
      "Usage:",
      "  npx -y github:crawde/mcp-vadyu [--api-key vadyu_live_...]",
      "",
      "Environment Variables:",
      "  VADYU_API_KEY   Optional for preview/catalog; required for rendering (https://vadyu.com/dashboard)",
      "  VADYU_API_URL   Override Vadyu base URL (default: https://vadyu.com)",
      "",
    ].join("\n")
  );
  process.exit(0);
}

const SERVER_INSTRUCTIONS =
  "Vadyu 2.0 Commercial Video Ad Studio. Public read-only tools (vadyu_preview_storefront, vadyu_list_recipes, vadyu_list_sequences_and_formats), resources, and prompts need no API key. Rendering and account tools use VADYU_API_KEY (vadyu_live_...) from https://vadyu.com/dashboard.";

const MCP_TOOLS = [
  {
    name: "vadyu_preview_storefront",
    title: "Preview Storefront Products",
    description:
      "Extract up to 4 hero SKUs, recommended Vadyu 2.0 ad style, and preloaded Studio link from a Shopify or DTC URL (no API key).",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Public Shopify or DTC storefront/product URL.",
          examples: ["https://www.voluspa.com"],
        },
      },
      required: ["url"],
      examples: [{ url: "https://www.voluspa.com" }],
    },
    annotations: {
      title: "Preview Storefront Products",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    examples: [{ url: "https://www.voluspa.com" }],
  },
  {
    name: "vadyu_generate_video_ad",
    title: "Generate Commercial Video Ad",
    description:
      "Render a multi-cut AI commercial video ad (3D studio lighting, lifestyle scene, and voiceover) from a URL, image, or reuse_video_id.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        product_url: { type: "string", description: "Public Shopify or DTC product/store URL." },
        image_url: { type: "string", description: "Direct HTTPS product or portrait image URL." },
        image_base64: { type: "string", description: "Base64 or data URL of input photo." },
        reuse_video_id: { type: "number", description: "Completed video ID to restitch at 0 credits." },
        recipe: { type: "string", description: "Style ID (e.g. flagship_launch, horology_atelier, or 'auto')." },
        campaign_preset: { type: "string", description: "3-ad funnel ID (e.g. dtc_flagship_funnel, spirits_funnel)." },
        recipe_variants: {
          type: "array",
          items: { type: "string" },
          description: "Up to 4 style IDs to render in parallel.",
        },
        format: { type: "string", description: "Aspect ratio: 9:16, 4:5, 1:1, or 16:9." },
        voiceover: { type: "boolean", description: "Enable studio AI voiceover narration." },
        audio_mood: { type: "string", description: "Background music mood ID." },
        brand_text: { type: "string", description: "Brand headline for title/end cards." },
        brand_subtext: { type: "string", description: "Product subtitle for cards." },
        cta_text: { type: "string", description: "Closing call-to-action button copy." },
        prompt: { type: "string", description: "Creative direction notes for scene staging." },
        wait_for_completion: { type: "boolean", description: "Poll until MP4 render completes (~60s)." },
      },
      examples: [{ product_url: "https://www.voluspa.com", recipe: "auto", format: "9:16" }],
    },
    annotations: {
      title: "Generate Commercial Video Ad",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    examples: [{ product_url: "https://www.voluspa.com", recipe: "auto", format: "9:16" }],
  },
  {
    name: "vadyu_get_video_status",
    title: "Get Video Render Status",
    description: "Get render status, MP4 download URL, coherence score, and share URL for a video ID.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        video_id: { type: "number", description: "Numeric video job ID.", examples: [1580] },
      },
      required: ["video_id"],
      examples: [{ video_id: 1580 }],
    },
    annotations: {
      title: "Get Video Render Status",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [{ video_id: 1580 }],
  },
  {
    name: "vadyu_list_recipes",
    title: "List Commercial Ad Styles",
    description: "List all 20 Vadyu 2.0 commercial ad styles, 16 campaign funnels, and 9 audio moods (no API key).",
    inputSchema: { type: "object", additionalProperties: false, properties: {}, examples: [{}] },
    annotations: {
      title: "List Commercial Ad Styles",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [{}],
  },
  {
    name: "vadyu_list_sequences_and_formats",
    title: "List Ad Formats & Styles",
    description: "List supported commercial aspect ratios (9:16, 4:5, 1:1, 16:9) and style IDs (no API key).",
    inputSchema: { type: "object", additionalProperties: false, properties: {}, examples: [{}] },
    annotations: {
      title: "List Ad Formats & Styles",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [{}],
  },
  {
    name: "vadyu_get_account_quota",
    title: "Get Account Video Quota",
    description: "Get remaining video credits and active credit pack or plan.",
    inputSchema: { type: "object", additionalProperties: false, properties: {}, examples: [{}] },
    annotations: {
      title: "Get Account Video Quota",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [{}],
  },
  {
    name: "vadyu_list_videos",
    title: "List Generated Videos",
    description: "List recent generated video ads on the authenticated account.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        limit: { type: "number", description: "Max videos to return (1-50, default 10).", examples: [10] },
      },
      examples: [{ limit: 10 }],
    },
    annotations: {
      title: "List Generated Videos",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [{ limit: 10 }],
  },
];

const MCP_RESOURCES = [
  {
    uri: "vadyu://catalog/styles",
    name: "Vadyu 2.0 Ad Styles & Funnels",
    description: "JSON catalog of 20 commercial ad styles, 16 funnels, 9 audio moods, and 4 aspect ratios.",
    mimeType: "application/json",
  },
  {
    uri: "vadyu://pricing/packs",
    name: "Vadyu 2.0 Credit Packs & Plans",
    description: "Credit packs ($9 Creator Pack, $29 Starter Pack) and monthly plans unlocking API & MCP keys.",
    mimeType: "application/json",
  },
];

const MCP_PROMPTS = [
  {
    name: "storefront_to_ad",
    description: "Preview a Shopify/DTC storefront for free, recommend the best Vadyu 2.0 commercial ad style, and render a Pixel-Lock video ad.",
    arguments: [
      { name: "store_url", description: "Public Shopify or DTC store/product URL (e.g. https://www.voluspa.com)", required: true },
      { name: "format", description: "Aspect ratio: 9:16, 4:5, 1:1, or 16:9 (default 9:16)", required: false },
    ],
  },
  {
    name: "three_ad_funnel",
    description: "Build a 3-stage paid-social video funnel (Hero Studio + Scroll-Stop Hook + Proof/UGC) from any DTC product URL.",
    arguments: [{ name: "store_url", description: "Public Shopify or DTC store/product URL", required: true }],
  },
];

function getApiKey() {
  const argIdx = process.argv.indexOf("--api-key");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return process.argv[argIdx + 1].trim();
  }
  return (process.env.VADYU_API_KEY || "").trim();
}

function negotiateProtocol(requested) {
  if (typeof requested === "string" && SUPPORTED_PROTOCOLS.includes(requested.trim())) {
    return requested.trim();
  }
  return SUPPORTED_PROTOCOLS[0];
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleMessage(msg) {
  const hasId = Object.prototype.hasOwnProperty.call(msg, "id");
  const id = hasId ? msg.id : null;
  const method = msg?.method;
  const params = msg?.params || {};

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: negotiateProtocol(params.protocolVersion),
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: {
          name: "vadyu-mcp-server",
          title: "Vadyu 2.0 AI Commercial Video Ad Studio",
          version: SERVER_VERSION,
          websiteUrl: "https://vadyu.com/api-docs#mcp",
        },
        instructions: SERVER_INSTRUCTIONS,
      },
    };
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (typeof method === "string" && method.startsWith("notifications/")) {
    return hasId ? { jsonrpc: "2.0", id, result: {} } : null;
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
  }

  if (method === "resources/list") {
    return { jsonrpc: "2.0", id, result: { resources: MCP_RESOURCES } };
  }

  if (method === "prompts/list") {
    return { jsonrpc: "2.0", id, result: { prompts: MCP_PROMPTS } };
  }

  const apiKey = getApiKey();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const isGenerateCall =
    method === "tools/call" &&
    params?.name === "vadyu_generate_video_ad" &&
    params?.arguments?.wait_for_completion === true;

  let forwardBody = msg;
  if (isGenerateCall && params?.arguments) {
    const cleanArgs = { ...params.arguments };
    delete cleanArgs.wait_for_completion;
    forwardBody = { ...msg, params: { ...params, arguments: cleanArgs } };
  }

  const res = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(forwardBody),
  });

  if (res.status === 202 || !hasId || id === null) {
    return null;
  }

  const data = await res.json();

  if (isGenerateCall && data?.result && !data.result.isError) {
    const structured = data.result.structuredContent;
    const videoId = structured?.video_id;
    if (videoId && apiKey) {
      const deadline = Date.now() + 4 * 60 * 1000;
      const pollEndpoint = structured?.poll_url || `${BASE_URL}/api/v2/videos/${videoId}`;
      while (Date.now() < deadline) {
        await sleep(5000);
        const pollRes = await fetch(pollEndpoint, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json();
        if (pollData.status === "done" || pollData.status === "failed") {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(pollData, null, 2) }],
              structuredContent: pollData,
              isError: pollData.status === "failed",
            },
          };
        }
      }
    }
  }

  return data;
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    sendResponse({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
    return;
  }

  try {
    const response = await handleMessage(msg);
    if (response !== null && response !== undefined) {
      sendResponse(response);
    }
  } catch (err) {
    if (msg?.id !== undefined && msg?.id !== null) {
      sendResponse({
        jsonrpc: "2.0",
        id: msg.id,
        error: {
          code: -32603,
          message: err instanceof Error ? err.message : "Failed to reach Vadyu MCP server",
        },
      });
    }
  }
});

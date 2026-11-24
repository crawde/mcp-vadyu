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
  "Vadyu 2.0 AI Commercial Video Ad Studio MCP Server. Public tools (vadyu_preview_storefront, vadyu_list_recipes, vadyu_list_sequences_and_formats), resources (vadyu://catalog/styles, vadyu://pricing/packs), and prompts work immediately with zero authentication. Video rendering and account tools require VADYU_API_KEY (vadyu_live_...) from https://vadyu.com/dashboard.";

const CURATED_STYLES =
  "flagship_launch, problem_solution, ugc_testimonial, tiktok_hook_3cut, creator_vlog, luxury_editorial, minimalist_apple, cyberpunk_neon, nature_botanical, kinetic_streetwear, food_sensory, flash_offer_drop, unbox_reveal, founder_story, macro_craft, clinical_proof, split_comparison, social_proof_wall, podcast_clip, seasonal_gift";

const CAMPAIGN_FUNNELS =
  "full_funnel_3pack, ecommerce_launch, tiktok_hook_lab, meta_advantage_plus, beauty_skincare_funnel, beverage_food_funnel, fashion_apparel_funnel, supplement_wellness_funnel, tech_gadget_funnel, home_fragrance_funnel, luxury_prestige_funnel, flash_sale_promo, ugc_social_proof_pack, founder_brand_story, amazon_pdp_pack, holiday_gifting_pack";

const MCP_TOOLS = [
  {
    name: "vadyu_preview_storefront",
    title: "Preview Storefront Products",
    description:
      "Public zero-credit preview: extract up to 4 hero product packshots, recommended Vadyu 2.0 commercial ad style, and a 1-click preloaded Studio URL from any Shopify or DTC store URL (no API key required).",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Public Shopify or DTC storefront or product page URL (e.g. https://www.voluspa.com).",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Preview Storefront Products",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    examples: [{ url: "https://www.voluspa.com" }, { url: "https://fischersund.com" }],
  },
  {
    name: "vadyu_generate_video_ad",
    title: "Generate Commercial Video Ad",
    description:
      "Generate a commercial multi-cut AI video ad (with precision product cutout, live-action 3D studio lighting, golden-hour lifestyle scene, and AI studio voiceover) from a product_url, image_url, image_base64, or 0-credit reuse_video_id.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        product_url: {
          type: "string",
          description: "Public Shopify or DTC storefront or product page URL to auto-extract packaging, brand, and copy.",
        },
        image_url: {
          type: "string",
          description: "Direct public HTTPS URL of a product packshot or portrait reference photo.",
        },
        image_base64: {
          type: "string",
          description: "Base64-encoded image string or data URL of a product or portrait photo.",
        },
        reuse_video_id: {
          type: "number",
          description: "Optional completed Vadyu video ID to instantly restitch with new CTA or aspect ratio at 0 credits.",
        },
        recipe: {
          type: "string",
          description: `Commercial ad style ID ('auto' or one of the 20 curated styles: ${CURATED_STYLES}).`,
        },
        campaign_preset: {
          type: "string",
          description: `Optional 3-ad full-funnel preset ID (${CAMPAIGN_FUNNELS}).`,
        },
        recipe_variants: {
          type: "array",
          items: { type: "string" },
          description: "Optional array of up to 4 commercial ad style IDs to render in parallel.",
        },
        format: {
          type: "string",
          description: "Commercial aspect ratio: 9:16 (TikTok/Reels), 4:5 (Meta Feed), 1:1 (Square), or 16:9 (YouTube/CTV).",
        },
        voiceover: {
          type: "boolean",
          description: "Enable studio AI voiceover narration (defaults to the selected style default).",
        },
        audio_mood: {
          type: "string",
          description: "Optional procedural background score mood ID (e.g. luxury_ambient, upbeat_pop, warm_acoustic).",
        },
        brand_text: {
          type: "string",
          description: "Optional brand headline shown on commercial title and end cards.",
        },
        brand_subtext: {
          type: "string",
          description: "Optional product subtitle or tagline shown on cards.",
        },
        cta_text: {
          type: "string",
          description: "Optional call-to-action button copy on the closing card (e.g. 'Shop Now').",
        },
        prompt: {
          type: "string",
          description: "Optional creative direction notes for lighting, mood, or scene staging.",
        },
        wait_for_completion: {
          type: "boolean",
          description: "When true in local stdio mode, automatically polls until the MP4 render completes (~60s).",
        },
      },
    },
    annotations: {
      title: "Generate Commercial Video Ad",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    examples: [
      { product_url: "https://www.voluspa.com", recipe: "auto", format: "9:16" },
      { image_url: "https://vadyu.com/icon.png", recipe: "flagship_launch", format: "4:5", cta_text: "Shop Now" },
    ],
  },
  {
    name: "vadyu_get_video_status",
    title: "Get Video Render Status",
    description: "Check render progress, MP4 video download URL, coherence score, and shareable Screening-Room URL for a Vadyu video ID.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        video_id: {
          type: "number",
          description: "Numeric Vadyu video job ID returned by vadyu_generate_video_ad.",
        },
      },
      required: ["video_id"],
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
    description: "List all 20 curated Vadyu 2.0 Commercial Ad Styles, 16 3-ad campaign funnels, and 9 procedural audio moods (no API key required).",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
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
    description: "List supported commercial aspect ratios (9:16, 4:5, 1:1, 16:9), ad placements, and curated style IDs (no API key required).",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
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
    description: "Check remaining video generation credits and active credit pack or monthly studio plan on the authenticated account.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
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
    description: "List recent generated commercial video ads on the authenticated Vadyu account with MP4 and share URLs.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of recent videos to return (1 to 50, default 10).",
        },
      },
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
    name: "Vadyu 2.0 Commercial Ad Styles & Campaign Funnels",
    description: "Live JSON catalog of all 20 curated commercial ad styles, 16 3-ad campaign funnels, 9 audio moods, and 4 aspect ratios.",
    mimeType: "application/json",
  },
  {
    uri: "vadyu://pricing/packs",
    name: "Vadyu 2.0 Self-Serve Credit Packs & API Access",
    description: "Self-serve video credit packs ($9 Creator Pack, $29 Brand Starter Pack) and monthly studio plans that unlock vadyu_live_... REST & MCP API keys.",
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

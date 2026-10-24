#!/usr/bin/env node
/**
 * Vadyu AI Video Ad Studio — Official Stdio MCP Server
 * Zero-dependency Node.js Model Context Protocol (MCP) server over stdio.
 *
 * Usage:
 *   VADYU_API_KEY="vadyu_live_..." node vadyu-mcp.mjs
 *
 * Or via one-liner in claude_desktop_config.json / .cursor/mcp.json:
 *   "command": "sh",
 *   "args": ["-c", "curl -fsSL https://vadyu.com/mcp/vadyu-mcp.mjs | node"],
 *   "env": { "VADYU_API_KEY": "vadyu_live_..." }
 */

import readline from "node:readline";

const BASE_URL = (process.env.VADYU_API_URL || "https://vadyu.com").replace(/\/+$/, "");
const MCP_ENDPOINT = `${BASE_URL}/api/mcp`;

function getApiKey() {
  const argIdx = process.argv.indexOf("--api-key");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return process.argv[argIdx + 1].trim();
  }
  return (process.env.VADYU_API_KEY || "").trim();
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function forwardToRemoteMcp(msg) {
  const apiKey = getApiKey();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // Optional auto-wait support when calling vadyu_generate_video_ad locally
  const isGenerateCall =
    msg?.method === "tools/call" &&
    msg?.params?.name === "vadyu_generate_video_ad" &&
    msg?.params?.arguments?.wait_for_completion === true;

  const res = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(msg),
  });

  if (res.status === 202 || msg.id === undefined || msg.id === null) {
    return null;
  }

  const data = await res.json();

  if (isGenerateCall && data?.result && !data.result.isError) {
    const structured = data.result.structuredContent;
    const videoId = structured?.video_id;
    if (videoId && apiKey) {
      const deadline = Date.now() + 4 * 60 * 1000; // up to 4 minutes
      const pollEndpoint = structured?.poll_url || `${BASE_URL}/api/v3/videos/${videoId}`;
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
            id: msg.id,
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
    const response = await forwardToRemoteMcp(msg);
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

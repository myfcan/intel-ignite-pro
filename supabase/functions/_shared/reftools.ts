/**
 * Ref.tools MCP Client — calls the Ref.tools Design MCP API
 * Endpoint: https://api.ref.tools/mcp
 * Protocol: MCP over HTTP (JSON-RPC 2.0)
 *
 * Available tools:
 *   - SEARCH(query, limit?)  → search technical documentation
 *   - READ(url)              → read a specific documentation page
 */

const REFTOOLS_MCP_URL = "https://api.ref.tools/mcp";

function getApiKey(): string {
  return Deno.env.get("REFTOOLS_API_KEY") ?? "";
}

interface McpToolResult {
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  isError?: boolean;
}

export interface ReftoolsSearchResult {
  results: Array<{
    title?: string;
    url?: string;
    snippet?: string;
    [key: string]: unknown;
  }>;
  total: number;
  query: string;
}

export interface ReftoolsReadResult {
  title?: string;
  content?: string;
  url: string;
  [key: string]: unknown;
}

let _sessionId: string | null = null;

async function initSession(): Promise<string | null> {
  if (_sessionId) return _sessionId;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("REFTOOLS_API_KEY not configured — skipping Ref.tools MCP init");
    return null;
  }

  try {
    const url = `${REFTOOLS_MCP_URL}?apiKey=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "intel-ignite-pro", version: "1.0.0" },
        },
      }),
    });

    _sessionId = response.headers.get("mcp-session-id");
    return _sessionId;
  } catch (err) {
    console.error("Ref.tools MCP init failed:", err);
    return null;
  }
}

async function callTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<McpToolResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("REFTOOLS_API_KEY not configured — skipping Ref.tools call");
    return null;
  }

  const sessionId = await initSession();

  const url = `${REFTOOLS_MCP_URL}?apiKey=${apiKey}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ref.tools MCP error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return data.result ?? null;
  } catch (err) {
    console.error(`Ref.tools MCP call '${toolName}' failed:`, err);
    return null;
  }
}

function parseToolContent(result: McpToolResult | null): unknown {
  if (!result || !result.content) return null;
  const textContent = result.content.find((c) => c.type === "text");
  if (!textContent?.text) return null;
  try {
    return JSON.parse(textContent.text);
  } catch {
    return textContent.text;
  }
}

/**
 * Search Ref.tools for technical documentation matching a query
 */
export async function searchDocs(
  query: string,
  limit = 10
): Promise<ReftoolsSearchResult> {
  const result = await callTool("SEARCH", { query, limit });
  const parsed = parseToolContent(result) as any;

  if (!parsed || result?.isError) {
    return { results: [], total: 0, query };
  }

  const results = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.results)
      ? parsed.results
      : [];

  return {
    results: results.slice(0, limit),
    total: parsed?.total ?? results.length,
    query,
  };
}

/**
 * Read a specific documentation page from Ref.tools
 */
export async function readDoc(
  url: string
): Promise<ReftoolsReadResult | null> {
  const result = await callTool("READ", { url });
  const parsed = parseToolContent(result) as any;
  return parsed ?? null;
}

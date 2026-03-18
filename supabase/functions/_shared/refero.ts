/**
 * Refero MCP Client — calls the Refero Design MCP API
 * Endpoint: https://api.refero.design/mcp
 * Protocol: MCP over HTTP (JSON-RPC 2.0)
 *
 * Available tools:
 *   - search_screens(query, limit?)  → screens matching the query
 *   - search_flows(query, limit?)    → user flows matching the query
 *   - get_screen(screen_id)          → full screen details
 *   - get_flow(flow_id)              → full flow details
 *   - get_design_guidance(topic)     → design guidance for a topic
 */

const REFERO_MCP_URL = "https://api.refero.design/mcp";

function getApiKey(): string {
  return Deno.env.get("REFERO_API_KEY") ?? "";
}

interface McpToolResult {
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  isError?: boolean;
}

interface ReferoScreen {
  id: string;
  app_name?: string;
  screen_name?: string;
  url?: string;
  thumbnail_url?: string;
  description?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface ReferoFlow {
  id: string;
  app_name?: string;
  flow_name?: string;
  description?: string;
  steps?: Array<{ screen_id: string; description?: string }>;
  [key: string]: unknown;
}

export interface ReferoSearchResult {
  screens: ReferoScreen[];
  total: number;
  query: string;
}

export interface ReferoFlowResult {
  flows: ReferoFlow[];
  total: number;
  query: string;
}

let _sessionId: string | null = null;

async function initSession(): Promise<string | null> {
  if (_sessionId) return _sessionId;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("REFERO_API_KEY not configured — skipping Refero MCP init");
    return null;
  }

  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "intel-ignite-pro", version: "1.0.0" },
      },
    });
    console.log("[Refero] initSession request:", body);
    const response = await fetch(REFERO_MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });

    const responseText = await response.text();
    console.log("[Refero] initSession status:", response.status, "body:", responseText.substring(0, 500));
    _sessionId = response.headers.get("mcp-session-id");
    console.log("[Refero] sessionId:", _sessionId);
    return _sessionId;
  } catch (err) {
    console.error("[Refero] MCP init failed:", err);
    return null;
  }
}

async function callTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<McpToolResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("REFERO_API_KEY not configured — skipping Refero call");
    return null;
  }

  const sessionId = await initSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    Authorization: `Bearer ${apiKey}`,
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    });
    console.log("[Refero] callTool request:", toolName, JSON.stringify(args));
    const response = await fetch(REFERO_MCP_URL, {
      method: "POST",
      headers,
      body,
    });

    const responseText = await response.text();
    console.log("[Refero] callTool status:", response.status, "body:", responseText.substring(0, 1000));

    if (!response.ok) {
      console.error(`[Refero] MCP error (${response.status}):`, responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    console.log("[Refero] callTool result keys:", data.result ? Object.keys(data.result) : "null");
    return data.result ?? null;
  } catch (err) {
    console.error(`[Refero] MCP call '${toolName}' failed:`, err);
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
 * Search Refero for screens matching a query (app name, feature, etc.)
 */
export async function searchScreens(
  query: string,
  limit = 10
): Promise<ReferoSearchResult> {
  const result = await callTool("search_screens", { query, limit });
  const parsed = parseToolContent(result) as any;

  if (!parsed || result?.isError) {
    return { screens: [], total: 0, query };
  }

  // Normalize different possible response shapes
  const screens = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.screens)
      ? parsed.screens
      : [];

  return {
    screens: screens.slice(0, limit),
    total: parsed?.total ?? screens.length,
    query,
  };
}

/**
 * Search Refero for user flows matching a query
 */
export async function searchFlows(
  query: string,
  limit = 5
): Promise<ReferoFlowResult> {
  const result = await callTool("search_flows", { query, limit });
  const parsed = parseToolContent(result) as any;

  if (!parsed || result?.isError) {
    return { flows: [], total: 0, query };
  }

  const flows = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.flows)
      ? parsed.flows
      : [];

  return {
    flows: flows.slice(0, limit),
    total: parsed?.total ?? flows.length,
    query,
  };
}

/**
 * Get full details for a specific screen
 */
export async function getScreen(
  screenId: string
): Promise<ReferoScreen | null> {
  const result = await callTool("get_screen", { screen_id: screenId });
  const parsed = parseToolContent(result) as any;
  return parsed ?? null;
}

/**
 * Get full details for a specific flow
 */
export async function getFlow(flowId: string): Promise<ReferoFlow | null> {
  const result = await callTool("get_flow", { flow_id: flowId });
  const parsed = parseToolContent(result) as any;
  return parsed ?? null;
}

/**
 * Get design guidance for a topic
 */
export async function getDesignGuidance(
  topic: string
): Promise<string | null> {
  const result = await callTool("get_design_guidance", { topic });
  const parsed = parseToolContent(result);
  return typeof parsed === "string" ? parsed : parsed ? JSON.stringify(parsed) : null;
}

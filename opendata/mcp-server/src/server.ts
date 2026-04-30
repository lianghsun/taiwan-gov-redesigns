#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadAll, get, readFile } from "./registry.js";
import { TOOLS } from "./tools.js";

const server = new Server(
  {
    name: "if-opendata",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

const URI_PREFIX = "taiwan-data://datasets";

function metaUri(id: string) {
  return `${URI_PREFIX}/${id}`;
}
function fileUri(id: string, p: string) {
  return `${URI_PREFIX}/${id}/files/${p}`;
}

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const datasets = loadAll();
  const resources: Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
  }> = [
    {
      uri: URI_PREFIX,
      name: "全部資料集索引",
      description: "if·opendata 所有資料集列表（JSON）。",
      mimeType: "application/json",
    },
  ];
  for (const d of datasets) {
    resources.push({
      uri: metaUri(d.id),
      name: `${d.title}（metadata）`,
      description: d.summary,
      mimeType: "application/json",
    });
    for (const f of d.files) {
      resources.push({
        uri: fileUri(d.id, f.path),
        name: `${d.title} · ${f.label ?? f.path}`,
        description: `${d.id}/${f.path}（${f.format}${d.fabricated ? "，示意" : ""}）`,
        mimeType:
          f.format === "json"
            ? "application/json"
            : f.format === "jsonl"
              ? "application/x-ndjson"
              : f.format === "csv"
                ? "text/csv"
                : f.format === "md"
                  ? "text/markdown"
                  : "text/plain",
      });
    }
  }
  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const uri = req.params.uri;
  if (uri === URI_PREFIX) {
    const datasets = loadAll().map((d) => ({
      id: d.id,
      kind: d.kind,
      title: d.title,
      summary: d.summary,
      tags: d.tags,
      fabricated: d.fabricated ?? false,
      uri: metaUri(d.id),
    }));
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ data: datasets }, null, 2),
        },
      ],
    };
  }
  // 兩種型態：metaUri / fileUri
  const metaMatch = uri.match(/^taiwan-data:\/\/datasets\/([^/]+)$/);
  if (metaMatch) {
    const ds = get(metaMatch[1]);
    if (!ds) throw new Error(`unknown dataset: ${metaMatch[1]}`);
    const { dirAbs: _ignored, ...payload } = ds;
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
  const fileMatch = uri.match(/^taiwan-data:\/\/datasets\/([^/]+)\/files\/(.+)$/);
  if (fileMatch) {
    const [, id, p] = fileMatch;
    const text = readFile(id, decodeURIComponent(p));
    const ds = get(id);
    const f = ds?.files.find((x) => x.path === decodeURIComponent(p));
    const mime =
      f?.format === "json"
        ? "application/json"
        : f?.format === "jsonl"
          ? "application/x-ndjson"
          : f?.format === "csv"
            ? "text/csv"
            : f?.format === "md"
              ? "text/markdown"
              : "text/plain";
    return { contents: [{ uri, mimeType: mime, text }] };
  }
  throw new Error(`unknown resource uri: ${uri}`);
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`unknown tool: ${name}`);
  const result = await tool.handler((args ?? {}) as Record<string, unknown>);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[if-opendata-mcp] ready on stdio");
}

main().catch((err) => {
  console.error("[if-opendata-mcp] fatal:", err);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";

export type Kind = "structured" | "unstructured";

export interface DatasetFile {
  path: string;
  label?: string;
  format: "json" | "jsonl" | "csv" | "md" | "txt";
}

export interface SchemaField {
  name: string;
  type: string;
  description?: string;
}

export interface DatasetMeta {
  id: string;
  org: string;
  kind: Kind;
  title: string;
  summary: string;
  publisher: string;
  license: string;
  tags: string[];
  fabricated?: boolean;
  files: DatasetFile[];
  schema?: SchemaField[];
  updatedAt: string;
}

export interface LoadedDataset extends DatasetMeta {
  dirAbs: string;
}

// 編譯後 import.meta.url 指向 dist/registry.js，故回兩層即 mcp-server/，再上一層為 opendata/
const SITE_ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const DATA_ROOT = path.join(SITE_ROOT, "data");

let cache: LoadedDataset[] | null = null;

export function loadAll(): LoadedDataset[] {
  if (cache) return cache;
  const out: LoadedDataset[] = [];
  for (const org of fs.readdirSync(DATA_ROOT)) {
    const orgDir = path.join(DATA_ROOT, org);
    if (!fs.statSync(orgDir).isDirectory()) continue;
    for (const id of fs.readdirSync(orgDir)) {
      const dsDir = path.join(orgDir, id);
      if (!fs.statSync(dsDir).isDirectory()) continue;
      const metaPath = path.join(dsDir, "meta.json");
      if (!fs.existsSync(metaPath)) continue;
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as DatasetMeta;
      out.push({ ...meta, kind: meta.kind ?? "structured", dirAbs: dsDir });
    }
  }
  cache = out;
  return out;
}

export function get(id: string): LoadedDataset | null {
  return loadAll().find((d) => d.id === id) ?? null;
}

export function readFile(id: string, relPath: string): string {
  const ds = get(id);
  if (!ds) throw new Error(`unknown dataset: ${id}`);
  return fs.readFileSync(path.join(ds.dirAbs, relPath), "utf-8");
}

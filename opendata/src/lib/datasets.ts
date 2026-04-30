import fs from "node:fs";
import path from "node:path";
import type { DatasetMeta, Kind, Org } from "./types";

const DATA_ROOT = path.join(process.cwd(), "data");

interface LoadedDataset extends DatasetMeta {
  /** 內部使用：相對於 process.cwd() 的目錄路徑 */
  _dirRel: string;
}

let cache: LoadedDataset[] | null = null;

function loadAll(): LoadedDataset[] {
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
      // 為向後相容，未指定 kind 視為 structured
      const filled: DatasetMeta = { ...meta, kind: meta.kind ?? "structured" };
      filled.files = filled.files.map((f) => {
        const abs = path.join(dsDir, f.path);
        const exists = fs.existsSync(abs);
        return {
          ...f,
          size: exists ? fs.statSync(abs).size : 0,
        };
      });
      out.push({ ...filled, _dirRel: path.join("data", org, id) });
    }
  }
  // 結構化在前、然後依標題排序（穩定順序、UX 一致）
  out.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "structured" ? -1 : 1;
    return a.title.localeCompare(b.title, "zh-Hant");
  });
  cache = out;
  return out;
}

function strip(d: LoadedDataset): DatasetMeta {
  const { _dirRel: _ignored, ...rest } = d;
  return rest;
}

export function listDatasets(kind?: Kind): DatasetMeta[] {
  const all = loadAll();
  const filtered = kind ? all.filter((d) => d.kind === kind) : all;
  return filtered.map(strip);
}

export function getDataset(id: string): DatasetMeta | null {
  const found = loadAll().find((d) => d.id === id);
  return found ? strip(found) : null;
}

export function readDatasetFile(id: string, relPath: string): string {
  const ds = loadAll().find((d) => d.id === id);
  if (!ds) throw new Error(`unknown dataset: ${id}`);
  const abs = path.join(process.cwd(), ds._dirRel, relPath);
  return fs.readFileSync(abs, "utf-8");
}

/** 列出 dataset 目錄下所有實體檔案（含 examples/ 與根層 README、data 等） */
export function listDatasetTree(id: string): {
  path: string;
  size: number;
  isDir: boolean;
}[] {
  const ds = loadAll().find((d) => d.id === id);
  if (!ds) return [];
  const root = path.join(process.cwd(), ds._dirRel);
  const out: { path: string; size: number; isDir: boolean }[] = [];
  walk(root, "", out);
  return out;
}

function walk(
  abs: string,
  rel: string,
  out: { path: string; size: number; isDir: boolean }[],
) {
  for (const name of fs.readdirSync(abs)) {
    if (name === "meta.json") continue;
    const sub = path.join(abs, name);
    const subRel = rel ? `${rel}/${name}` : name;
    const st = fs.lstatSync(sub);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      out.push({ path: subRel, size: 0, isDir: true });
      walk(sub, subRel, out);
    } else {
      out.push({ path: subRel, size: st.size, isDir: false });
    }
  }
}

export function listKinds(): {
  kind: Kind;
  count: number;
  label: string;
  description: string;
}[] {
  const all = loadAll();
  const c = (k: Kind) => all.filter((d) => d.kind === k).length;
  return [
    {
      kind: "structured",
      count: c("structured"),
      label: "結構化資料",
      description:
        "JSON / JSONL / CSV，附 schema 與表格化預覽。適合 ETL 管線、資料分析、機器學習。",
    },
    {
      kind: "unstructured",
      count: c("unstructured"),
      label: "非結構化資料",
      description:
        "法規條文、會議紀錄、敘述性文本。適合 LLM 處理、檢索、知識整理。",
    },
  ];
}

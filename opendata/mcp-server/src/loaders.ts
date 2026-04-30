import Papa from "papaparse";
import { readFile, get } from "./registry.js";

export function loadStructured(id: string): Record<string, unknown>[] {
  const ds = get(id);
  if (!ds) throw new Error(`unknown dataset: ${id}`);
  const file = ds.files.find(
    (f) => f.format === "csv" || f.format === "json" || f.format === "jsonl",
  );
  if (!file) throw new Error(`dataset ${id} has no structured file`);
  const raw = readFile(id, file.path);
  if (file.format === "jsonl") {
    return raw
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l));
  }
  if (file.format === "json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    for (const v of Object.values(parsed)) {
      if (Array.isArray(v) && v.every((x) => x && typeof x === "object")) {
        return v as Record<string, unknown>[];
      }
    }
    return [parsed];
  }
  // csv
  const result = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  return result.data;
}

export function loadText(id: string): { path: string; content: string }[] {
  const ds = get(id);
  if (!ds) throw new Error(`unknown dataset: ${id}`);
  return ds.files
    .filter((f) => f.format === "txt" || f.format === "md")
    .map((f) => ({ path: f.path, content: readFile(id, f.path) }));
}

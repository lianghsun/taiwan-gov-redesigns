import Papa from "papaparse";

export interface PreviewTable {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  totalRows: number;
}

const MAX_PREVIEW_ROWS = 100;

export function parseCsv(raw: string): PreviewTable {
  const result = Papa.parse<Record<string, unknown>>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  const headers = result.meta.fields ?? [];
  const allRows = result.data;
  const rows = allRows.slice(0, MAX_PREVIEW_ROWS).map((r) =>
    headers.map((h) => {
      const v = r[h];
      return v === undefined || v === null ? null : (v as string | number | boolean);
    })
  );
  return { headers, rows, totalRows: allRows.length };
}

export function parseJsonl(raw: string): PreviewTable {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const objs = lines.map((l) => JSON.parse(l) as Record<string, unknown>);
  const headers = unionKeys(objs);
  const rows = objs.slice(0, MAX_PREVIEW_ROWS).map((o) =>
    headers.map((h) => stringify(o[h]))
  );
  return { headers, rows, totalRows: objs.length };
}

export function parseJson(raw: string): PreviewTable {
  const parsed: unknown = JSON.parse(raw);
  const arr: Record<string, unknown>[] = Array.isArray(parsed)
    ? (parsed as Record<string, unknown>[])
    : findArrayInObject(parsed) ?? [parsed as Record<string, unknown>];
  const headers = unionKeys(arr);
  const rows = arr.slice(0, MAX_PREVIEW_ROWS).map((o) =>
    headers.map((h) => stringify(o[h]))
  );
  return { headers, rows, totalRows: arr.length };
}

function unionKeys(arr: Record<string, unknown>[]): string[] {
  const set = new Set<string>();
  for (const o of arr) {
    if (o && typeof o === "object") {
      for (const k of Object.keys(o)) set.add(k);
    }
  }
  return [...set];
}

function findArrayInObject(o: unknown): Record<string, unknown>[] | null {
  if (!o || typeof o !== "object") return null;
  const obj = o as Record<string, unknown>;
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.every((x) => x && typeof x === "object")) {
      return v as Record<string, unknown>[];
    }
  }
  return null;
}

function stringify(v: unknown): string | number | boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  return JSON.stringify(v);
}

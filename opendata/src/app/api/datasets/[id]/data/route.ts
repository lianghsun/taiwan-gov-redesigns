import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getDataset, readDatasetFile } from "@/lib/datasets";
import type { DatasetFile } from "@/lib/types";

// query params 影響回傳，無法 force-static；走 SSR
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

const MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 100;

function pickStructuredFile(files: DatasetFile[]): DatasetFile | undefined {
  return files.find((f) => f.format === "csv" || f.format === "json" || f.format === "jsonl");
}

function loadRows(file: DatasetFile, raw: string): Record<string, unknown>[] {
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
  });
  return result.data;
}

function project(rows: Record<string, unknown>[], fields: string[]): Record<string, unknown>[] {
  if (fields.length === 0) return rows;
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const f of fields) out[f] = r[f];
    return out;
  });
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const ds = getDataset(id);
  if (!ds) {
    return NextResponse.json(
      { error: "not_found", message: `dataset '${id}' not found` },
      { status: 404 },
    );
  }
  if (ds.kind === "unstructured") {
    return NextResponse.json(
      {
        error: "unstructured",
        message:
          "此資料集為非結構化（純文字 / markdown），請改用 /data/{org}/{id}/{path} 直接下載各檔案。",
        files: ds.files.map((f) => ({
          path: f.path,
          download: `/data/${ds.org}/${ds.id}/${f.path}`,
        })),
      },
      { status: 400 },
    );
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");
  const fieldsRaw = url.searchParams.get("fields");
  const formatRaw = url.searchParams.get("format");

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, limitRaw ? Number.parseInt(limitRaw, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT),
  );
  const offset = Math.max(0, offsetRaw ? Number.parseInt(offsetRaw, 10) || 0 : 0);
  const fields = (fieldsRaw ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const file = pickStructuredFile(ds.files);
  if (!file) {
    return NextResponse.json(
      { error: "no_data_file", message: "此資料集沒有可解析的結構化資料檔。" },
      { status: 500 },
    );
  }

  const raw = readDatasetFile(ds.id, file.path);
  const all = loadRows(file, raw);
  const total = all.length;
  const slice = all.slice(offset, offset + limit);
  const projected = project(slice, fields);

  // 預設回 JSON；?format=csv|jsonl 提供下載格式轉換
  if (formatRaw === "csv") {
    const csv = Papa.unparse(projected, { header: true });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `inline; filename="${id}.csv"`,
      },
    });
  }
  if (formatRaw === "jsonl") {
    const jsonl = projected.map((r) => JSON.stringify(r)).join("\n") + "\n";
    return new NextResponse(jsonl, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Content-Disposition": `inline; filename="${id}.jsonl"`,
      },
    });
  }

  return NextResponse.json({
    data: projected,
    meta: {
      id: ds.id,
      total,
      offset,
      limit,
      returned: projected.length,
      fields: fields.length > 0 ? fields : null,
      sourceFile: file.path,
      sourceFormat: file.format,
    },
    links: {
      self: `/api/datasets/${ds.id}/data?offset=${offset}&limit=${limit}`,
      next:
        offset + limit < total
          ? `/api/datasets/${ds.id}/data?offset=${offset + limit}&limit=${limit}`
          : null,
      prev:
        offset > 0
          ? `/api/datasets/${ds.id}/data?offset=${Math.max(0, offset - limit)}&limit=${limit}`
          : null,
      schema: `/api/datasets/${ds.id}/schema`,
      raw: `/data/${ds.org}/${ds.id}/${file.path}`,
    },
  });
}

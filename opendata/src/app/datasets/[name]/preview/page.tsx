import { notFound } from "next/navigation";
import { getDataset, listDatasets, readDatasetFile } from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";
import { DataPreview } from "@/components/DataPreview";
import { SchemaPanel } from "@/components/SchemaPanel";
import { TextPreview } from "@/components/TextPreview";
import { parseCsv, parseJson, parseJsonl, type PreviewTable } from "@/lib/parsers";
import type { DatasetFile } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ name: d.id }));
}

interface Params {
  params: Promise<{ name: string }>;
}

function pickStructured(files: DatasetFile[]): DatasetFile | null {
  return (
    files.find((f) => f.format === "csv" || f.format === "json" || f.format === "jsonl") ?? null
  );
}

function buildPreview(file: DatasetFile, raw: string): PreviewTable | { error: string } {
  try {
    if (file.format === "csv") return parseCsv(raw);
    if (file.format === "jsonl") return parseJsonl(raw);
    if (file.format === "json") return parseJson(raw);
    return { error: `不支援的格式：${file.format}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export default async function DatasetPreviewPage({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();

  if (ds.kind === "unstructured") {
    const textFiles = ds.files.filter((f) => f.format === "txt" || f.format === "md");
    return (
      <>
        <DatasetHeader ds={ds} />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">文字預覽</h2>
              <p className="text-sm text-ink-500 mt-0.5">
                非結構化資料集，無法表格化。下方顯示各檔案前若干行。
              </p>
            </div>
            <div className="text-sm text-ink-500">共 {textFiles.length} 個文字檔</div>
          </div>
          <div className="space-y-6">
            {textFiles.map((f, i) => {
              const raw = (() => {
                try {
                  return readDatasetFile(ds.id, f.path);
                } catch {
                  return "(無法讀取檔案)";
                }
              })();
              return (
                <TextPreview
                  key={f.path}
                  filename={f.label ?? f.path}
                  format={f.format}
                  content={raw}
                  limit={i === 0 ? 80 : 30}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  const primary = pickStructured(ds.files);
  let table: PreviewTable | null = null;
  let error: string | null = null;

  if (primary) {
    const raw = readDatasetFile(ds.id, primary.path);
    const result = buildPreview(primary, raw);
    if ("error" in result) error = result.error;
    else table = result;
  } else {
    error = "本資料集沒有可預覽的結構化檔案。";
  }

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-ink-500">
            預覽檔案：
            <span className="font-mono text-ink-900 ml-1">
              {primary?.label ?? primary?.path ?? "(無)"}
            </span>
          </div>
        </div>
        {error ? (
          <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg px-4 py-3 text-sm">
            無法解析：{error}
          </div>
        ) : null}
        {table ? <DataPreview table={table} /> : null}
        {ds.schema && ds.schema.length > 0 ? <SchemaPanel schema={ds.schema} /> : null}
      </div>
    </>
  );
}

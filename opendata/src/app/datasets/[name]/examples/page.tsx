import { notFound } from "next/navigation";
import { getDataset, listDatasets, readDatasetFile } from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";
import { parseCsv, parseJson, parseJsonl } from "@/lib/parsers";
import { DEMO_META } from "@/demos/meta";
import DemoClient from "@/components/DemoClient";
import type { DatasetFile } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ name: d.id }));
}

interface Params {
  params: Promise<{ name: string }>;
}

function pickStructured(files: DatasetFile[]): DatasetFile | undefined {
  return files.find((f) => f.format === "csv" || f.format === "json" || f.format === "jsonl");
}

function loadAllRows(file: DatasetFile, raw: string): Record<string, unknown>[] {
  if (file.format === "csv") {
    const r = parseCsv(raw);
    return r.rows.map((row) => {
      const o: Record<string, unknown> = {};
      r.headers.forEach((h, i) => (o[h] = row[i]));
      return o;
    });
  }
  if (file.format === "jsonl") {
    return raw
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l));
  }
  if (file.format === "json") {
    const r = parseJson(raw);
    return r.rows.map((row) => {
      const o: Record<string, unknown> = {};
      r.headers.forEach((h, i) => (o[h] = row[i]));
      return o;
    });
  }
  return [];
}

export default async function DatasetExamplesPage({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();

  // 為 demo 準備資料
  const demoMeta = DEMO_META[ds.id];
  let rows: Record<string, unknown>[] = [];
  let texts: { path: string; content: string }[] = [];
  if (demoMeta) {
    if (ds.kind === "structured") {
      const file = pickStructured(ds.files);
      if (file) {
        try {
          const raw = readDatasetFile(ds.id, file.path);
          // 對 csv：因為 parseCsv 上限 100 列，要重新 parse 全部
          if (file.format === "csv") {
            const Papa = await import("papaparse");
            const result = Papa.default.parse<Record<string, string>>(raw, {
              header: true,
              skipEmptyLines: true,
            });
            rows = result.data;
          } else {
            rows = loadAllRows(file, raw);
          }
        } catch {
          rows = [];
        }
      }
    } else {
      texts = ds.files
        .filter((f) => f.format === "txt" || f.format === "md")
        .map((f) => {
          try {
            return { path: f.path, content: readDatasetFile(ds.id, f.path) };
          } catch {
            return { path: f.path, content: "" };
          }
        });
    }
  }

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {demoMeta ? (
          <section className="border border-sovereign-100 bg-sovereign-50/30 rounded-lg overflow-hidden">
            <header className="px-5 py-4 border-b border-sovereign-100 bg-white/60">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sovereign-500 text-white font-semibold">
                  Live
                </span>
                <h2 className="text-lg font-semibold text-ink-900">{demoMeta.title}</h2>
              </div>
              <p className="text-sm text-ink-600">{demoMeta.blurb}</p>
            </header>
            <div className="p-5">
              <DemoClient id={ds.id} rows={rows} texts={texts} />
            </div>
          </section>
        ) : null}

        {ds.examples.length === 0 ? (
          <div className="text-ink-400 py-12 text-center">本資料集尚未提供應用範例。</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-ink-900">驅動 demo 的範例程式</h2>
            {ds.examples.map((e) => {
              let code = "";
              try {
                code = readDatasetFile(ds.id, e.path);
              } catch {
                code = "// 無法讀取檔案";
              }
              return (
                <section
                  key={e.path}
                  className="border border-ink-200 rounded-lg bg-white overflow-hidden"
                >
                  <header className="px-5 py-4 border-b border-ink-200">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="text-base font-semibold text-ink-900">{e.title}</h3>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ink-100 text-ink-500">
                        {e.language}
                      </span>
                    </div>
                    <p className="text-sm text-ink-500">{e.description}</p>
                    <div className="text-xs text-ink-400 font-mono mt-2">{e.path}</div>
                  </header>
                  <pre className="bg-ink-900 text-ink-50 p-5 overflow-x-auto text-xs leading-6 max-h-[36rem]">
                    <code>{code}</code>
                  </pre>
                </section>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}

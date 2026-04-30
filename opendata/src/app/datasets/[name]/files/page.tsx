import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataset, listDatasetTree, listDatasets } from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ name: d.id }));
}

interface Params {
  params: Promise<{ name: string }>;
}

function fileIcon(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "csv":
    case "tsv":
      return "▦";
    case "json":
    case "jsonl":
      return "{}";
    case "md":
      return "✎";
    case "txt":
      return "≡";
    case "py":
    case "ts":
    case "tsx":
    case "js":
    case "mjs":
    case "r":
    case "sql":
      return "›_";
    default:
      return "•";
  }
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DatasetFilesPage({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();

  const tree = listDatasetTree(name).filter((e) => e.path !== "meta.json");
  // 目錄優先、字母順序
  const sorted = [...tree].sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.path.localeCompare(b.path, "zh-Hant");
  });

  const latestCommit = ds.history?.[0];

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ink-200 bg-ink-50 text-sm">
            <div className="flex items-center gap-2 text-ink-500">
              <code className="font-mono text-ink-700">main</code>
              <span>·</span>
              <span>{tree.filter((e) => !e.isDir).length} 個檔案</span>
            </div>
            {latestCommit ? (
              <div className="text-xs text-ink-500 truncate max-w-[60%] hidden sm:block">
                <span className="text-ink-400 mr-2">最後 commit</span>
                <code className="font-mono text-ink-400 mr-2">{latestCommit.sha}</code>
                <span className="text-ink-700">{latestCommit.message}</span>
              </div>
            ) : null}
          </div>
          <ul className="divide-y divide-ink-100">
            {sorted.map((e) => {
              const lastSlash = e.path.lastIndexOf("/");
              const dir = lastSlash >= 0 ? e.path.slice(0, lastSlash) : "";
              const base = lastSlash >= 0 ? e.path.slice(lastSlash + 1) : e.path;
              const commitForFile = ds.history?.find(
                (c) => c.files.includes(e.path) || c.files.includes(base) || c.files.includes(dir),
              );
              return (
                <li key={e.path}>
                  {e.isDir ? (
                    <div className="flex items-center gap-3 px-4 py-2.5 text-sm bg-ink-50/40">
                      <span className="font-mono text-ink-400 w-5 text-center" aria-hidden>
                        ▸
                      </span>
                      <span className="font-mono text-ink-700">{e.path}/</span>
                      <span className="ml-auto text-xs text-ink-400">資料夾</span>
                    </div>
                  ) : (
                    <Link
                      href={`/datasets/${ds.id}/files/${e.path}`}
                      prefetch={false}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-ink-50 transition"
                    >
                      <span className="font-mono text-ink-400 w-5 text-center text-[13px]" aria-hidden>
                        {fileIcon(e.path)}
                      </span>
                      <span className="flex flex-col min-w-0 flex-1">
                        <span className="text-ink-900 truncate">
                          {(() => {
                            const meta = ds.files.find((f) => f.path === e.path);
                            return meta?.label && meta.label !== e.path ? meta.label : e.path;
                          })()}
                        </span>
                        {(() => {
                          const meta = ds.files.find((f) => f.path === e.path);
                          if (meta?.label && meta.label !== e.path) {
                            return (
                              <span className="font-mono text-[11px] text-ink-400 truncate">
                                {e.path}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </span>
                      {commitForFile ? (
                        <span className="ml-3 hidden md:inline text-xs text-ink-400 truncate max-w-[18rem]">
                          {commitForFile.message}
                        </span>
                      ) : null}
                      <span className="ml-auto flex items-center gap-3 text-xs text-ink-400 shrink-0">
                        {commitForFile ? <span>{commitForFile.date.slice(0, 10)}</span> : null}
                        <span className="tabular-nums">{formatBytes(e.size)}</span>
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-3 text-xs text-ink-400">
          點擊任一檔案進入內容檢視。本 demo 之 commit 訊息與日期為模擬。
        </div>
      </div>
    </>
  );
}

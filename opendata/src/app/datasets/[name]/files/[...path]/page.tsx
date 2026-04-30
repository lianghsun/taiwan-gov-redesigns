import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDataset,
  listDatasetTree,
  listDatasets,
  readDatasetFile,
} from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { name: string; path: string[] }[] = [];
  for (const d of listDatasets()) {
    for (const e of listDatasetTree(d.id)) {
      if (e.isDir) continue;
      if (e.path === "meta.json") continue;
      out.push({ name: d.id, path: e.path.split("/") });
    }
  }
  return out;
}

interface Params {
  params: Promise<{ name: string; path: string[] }>;
}

function inferFormat(p: string): string {
  return p.split(".").pop()?.toLowerCase() ?? "txt";
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DatasetFileViewerPage({ params }: Params) {
  const { name, path } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();
  const relPath = path.join("/");
  const tree = listDatasetTree(name);
  const node = tree.find((e) => e.path === relPath && !e.isDir);
  if (!node) notFound();

  const content = (() => {
    try {
      return readDatasetFile(name, relPath);
    } catch {
      return "(無法讀取檔案)";
    }
  })();
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  const ext = inferFormat(relPath);

  // 與該檔案相關的 commit
  const base = relPath.split("/").pop() ?? relPath;
  const commits = ds.history?.filter(
    (c) => c.files.includes(relPath) || c.files.includes(base),
  );

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-sm text-ink-500 mb-3 flex flex-wrap items-center gap-1.5">
          <Link href={`/datasets/${ds.id}/files`} className="hover:text-ink-700 font-mono">
            files
          </Link>
          <span className="text-ink-300">/</span>
          {path.map((seg, i) => {
            const isLast = i === path.length - 1;
            return (
              <span key={i} className="font-mono">
                {isLast ? (
                  <span className="text-ink-900">{seg}</span>
                ) : (
                  <span className="text-ink-500">{seg}</span>
                )}
                {!isLast ? <span className="text-ink-300 ml-1.5">/</span> : null}
              </span>
            );
          })}
        </div>

        <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ink-200 bg-ink-50 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-ink-900 truncate">{relPath}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-ink-200 bg-white text-ink-500">
                {ext}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-400 shrink-0 tabular-nums">
              <span>{totalLines.toLocaleString()} 行</span>
              <span>·</span>
              <span>{formatBytes(node.size)}</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[64vh] bg-ink-900 text-ink-50 font-mono text-xs leading-6">
            <table className="w-full">
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="text-ink-500 text-right pr-3 pl-4 w-14 select-none tabular-nums align-top">
                      {i + 1}
                    </td>
                    <td className="pr-4 whitespace-pre">{l || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {commits && commits.length > 0 ? (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">影響此檔案的 commit</div>
            <ol className="border border-ink-200 rounded-lg bg-white divide-y divide-ink-100 text-sm overflow-hidden">
              {commits.map((c) => (
                <li key={c.sha} className="px-4 py-2.5 flex flex-wrap gap-x-3 gap-y-1 items-baseline">
                  <code className="font-mono text-xs text-ink-400">{c.sha}</code>
                  <span className="text-ink-900 font-medium">{c.message}</span>
                  <span className="text-ink-500 text-xs ml-auto">
                    {c.author} · {c.date.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </>
  );
}

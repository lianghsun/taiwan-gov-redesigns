import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDataset, listDatasets, readDatasetFile } from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";
import { SchemaPanel } from "@/components/SchemaPanel";
import { LatestCommitCard } from "@/components/CommitList";
import { QuickStart } from "@/components/QuickStart";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ name: d.id }));
}

interface Params {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  return ds ? { title: ds.title, description: ds.summary } : {};
}

export default async function DatasetOverviewPage({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();
  const readme = (() => {
    try {
      return readDatasetFile(ds.id, "README.md");
    } catch {
      return "";
    }
  })();

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_20rem] gap-8">
        <article className="prose-tw bg-white border border-ink-200 rounded-lg p-6 sm:p-8">
          {readme ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
          ) : (
            <p className="text-ink-400">本資料集尚未提供 README。</p>
          )}
        </article>
        <aside className="space-y-4">
          <QuickStart org={ds.org} id={ds.id} primaryFile={ds.files.find((f) => ["csv", "json", "jsonl"].includes(f.format)) ?? ds.files[0]} />
          {ds.history && ds.history.length > 0 ? (
            <LatestCommitCard commit={ds.history[0]} />
          ) : null}
          {ds.schema && ds.schema.length > 0 ? <SchemaPanel schema={ds.schema} /> : null}
          <div className="border border-ink-200 rounded-lg bg-white p-4 text-sm">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">檔案</div>
            <ul className="space-y-1.5">
              {ds.files.map((f) => (
                <li key={f.path} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-ink-700 truncate">{f.label ?? f.path}</span>
                  <span className="text-[10px] uppercase font-mono text-ink-400">{f.format}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-ink-200 rounded-lg bg-white p-4 text-sm">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">應用範例</div>
            {ds.examples.length === 0 ? (
              <div className="text-ink-400">尚無範例</div>
            ) : (
              <ul className="space-y-1.5">
                {ds.examples.map((e) => (
                  <li key={e.path} className="text-ink-700">
                    {e.title}
                    <span className="ml-2 text-[10px] uppercase font-mono text-ink-400">
                      {e.language}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

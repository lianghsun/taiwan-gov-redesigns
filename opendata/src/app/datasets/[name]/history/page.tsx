import { notFound } from "next/navigation";
import { getDataset, listDatasets } from "@/lib/datasets";
import { DatasetHeader } from "@/components/DatasetHeader";
import { CommitList } from "@/components/CommitList";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ name: d.id }));
}

interface Params {
  params: Promise<{ name: string }>;
}

export default async function DatasetHistoryPage({ params }: Params) {
  const { name } = await params;
  const ds = getDataset(name);
  if (!ds) notFound();

  const history = ds.history ?? [];

  return (
    <>
      <DatasetHeader ds={ds} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">提交歷史</h2>
            <p className="text-sm text-ink-500 mt-0.5">
              共 {history.length} 個 commit。本 demo 之 SHA 與作者均為模擬。
            </p>
          </div>
          <code className="text-xs font-mono text-ink-400">main</code>
        </div>
        <CommitList commits={history} />
      </div>
    </>
  );
}

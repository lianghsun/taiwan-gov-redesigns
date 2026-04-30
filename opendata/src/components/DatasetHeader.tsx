import Link from "next/link";
import type { DatasetMeta } from "@/lib/types";
import { FabricatedBadge, FabricatedBanner, KindBadge } from "./KindBadge";
import { DatasetTabs } from "./DatasetTabs";
import { DownloadMenu } from "./DownloadMenu";

export function DatasetHeader({ ds }: { ds: DatasetMeta }) {
  return (
    <>
      {ds.fabricated ? <FabricatedBanner /> : null}
      <div className="border-b border-ink-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-0">
          <div className="text-sm text-ink-400 mb-2">
            <Link href="/datasets" className="hover:text-ink-700">資料集</Link>
            <span className="mx-1.5">/</span>
            <Link
              href={`/datasets?kind=${ds.kind}`}
              className="hover:text-ink-700"
            >
              {ds.kind === "unstructured" ? "非結構化資料" : "結構化資料"}
            </Link>
          </div>
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">{ds.title}</h1>
            <div className="pt-1 flex items-center gap-1.5">
              <KindBadge kind={ds.kind} />
              {ds.fabricated ? <FabricatedBadge /> : null}
            </div>
            <div className="ml-auto pt-0.5">
              <DownloadMenu org={ds.org} id={ds.id} files={ds.files} />
            </div>
          </div>
          <p className="text-ink-500 leading-7 max-w-3xl mb-4">{ds.summary}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-500 mb-4">
            <span>
              發布單位：<span className="text-ink-700">{ds.publisher}</span>
            </span>
            <span>授權：<span className="text-ink-700">{ds.license}</span></span>
            <span>更新：<span className="text-ink-700">{ds.updatedAt}</span></span>
            {ds.upstreamUrl ? (
              <a
                className="text-sovereign-500 hover:underline"
                href={ds.upstreamUrl}
                target="_blank"
                rel="noreferrer"
              >
                upstream ↗
              </a>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ds.tags.map((t) => (
              <Link
                key={t}
                href={`/datasets?q=${encodeURIComponent(t)}`}
                className="text-xs px-2 py-0.5 rounded-full bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900"
              >
                #{t}
              </Link>
            ))}
          </div>
          <DatasetTabs id={ds.id} />
        </div>
      </div>
    </>
  );
}

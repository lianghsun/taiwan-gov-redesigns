import Link from "next/link";
import type { DatasetMeta } from "@/lib/types";
import { FabricatedBadge, KindBadge } from "./KindBadge";

export function DatasetCard({ ds }: { ds: DatasetMeta }) {
  const primaryFile = ds.files[0];
  const formats = Array.from(new Set(ds.files.map((f) => f.format)));
  return (
    <Link
      href={`/datasets/${ds.id}`}
      className="block bg-white border border-ink-200 rounded-lg p-5 hover:border-ink-400 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-ink-900 leading-snug">{ds.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <KindBadge kind={ds.kind} />
          {ds.fabricated ? <FabricatedBadge /> : null}
        </div>
      </div>
      <p className="text-sm text-ink-500 leading-6 line-clamp-2 mb-4">{ds.summary}</p>
      <div className="flex items-center justify-between text-xs text-ink-400">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-ink-500 truncate">{ds.publisher}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {formats.slice(0, 3).map((f) => (
            <span
              key={f}
              className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600 font-mono uppercase text-[10px]"
            >
              {f}
            </span>
          ))}
          {primaryFile?.size ? (
            <span className="text-ink-400">· {formatBytes(primaryFile.size)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

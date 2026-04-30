import type { Commit } from "@/lib/types";

function shortDate(iso: string): string {
  return iso.slice(0, 10);
}

function authorInitial(name: string): string {
  return name.replace(/[（(].*?[)）]/g, "").trim().charAt(0);
}

export function CommitList({ commits }: { commits: Commit[] }) {
  if (commits.length === 0) {
    return <div className="text-ink-400 py-8 text-center">尚無提交歷史。</div>;
  }
  return (
    <ol className="border border-ink-200 rounded-lg bg-white divide-y divide-ink-100 overflow-hidden">
      {commits.map((c, idx) => (
        <li key={c.sha} className="px-5 py-4 flex gap-4">
          <div
            className="w-8 h-8 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-sm font-semibold shrink-0"
            aria-hidden
          >
            {authorInitial(c.author)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-semibold text-ink-900 truncate">{c.message}</span>
              {idx === 0 ? (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                  最新
                </span>
              ) : null}
              {c.stats?.schemaChanged ? (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-50 text-accent-600 font-semibold">
                  schema
                </span>
              ) : null}
            </div>
            {c.body ? (
              <p className="text-sm text-ink-500 leading-6 mt-1">{c.body}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="text-ink-700">{c.author}</span>
              <span>·</span>
              <span>{shortDate(c.date)}</span>
              <span>·</span>
              <code className="font-mono text-ink-400">{c.sha}</code>
              {c.files.length > 0 ? (
                <>
                  <span>·</span>
                  <span className="font-mono text-ink-500 truncate">
                    {c.files.join("、")}
                  </span>
                </>
              ) : null}
              {c.stats?.added != null || c.stats?.removed != null ? (
                <>
                  <span>·</span>
                  {c.stats.added ? (
                    <span className="text-emerald-600 font-mono">+{c.stats.added}</span>
                  ) : null}
                  {c.stats.removed ? (
                    <span className="text-rose-500 font-mono">−{c.stats.removed}</span>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function LatestCommitCard({ commit }: { commit: Commit }) {
  return (
    <div className="border border-ink-200 rounded-lg bg-white p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-ink-400">最近一次更新</div>
        <code className="font-mono text-[11px] text-ink-400">{commit.sha}</code>
      </div>
      <div className="font-semibold text-ink-900 leading-6">{commit.message}</div>
      <div className="mt-1.5 text-xs text-ink-500">
        <span className="text-ink-700">{commit.author}</span>
        <span className="mx-1.5">·</span>
        <span>{shortDate(commit.date)}</span>
        {commit.stats?.schemaChanged ? (
          <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-50 text-accent-600 font-semibold">
            schema
          </span>
        ) : null}
      </div>
    </div>
  );
}

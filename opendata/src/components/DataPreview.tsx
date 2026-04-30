import type { PreviewTable } from "@/lib/parsers";

export function DataPreview({ table }: { table: PreviewTable }) {
  if (table.headers.length === 0 || table.rows.length === 0) {
    return <div className="text-ink-400 py-12 text-center">資料為空。</div>;
  }
  return (
    <div className="border border-ink-200 rounded-lg overflow-hidden">
      <div className="bg-ink-50 px-4 py-2 text-xs text-ink-500 flex items-center justify-between">
        <div>
          顯示 {table.rows.length.toLocaleString()} / 共 {table.totalRows.toLocaleString()} 列
        </div>
        <div className="font-mono text-[11px] text-ink-400">{table.headers.length} 欄</div>
      </div>
      <div className="overflow-x-auto max-h-[28rem]">
        <table className="text-sm w-full border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-[inset_0_-1px_0_0_rgb(214_218_227)]">
            <tr>
              <th className="text-left px-3 py-2 text-ink-400 font-mono text-[11px] w-10">#</th>
              {table.headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2 text-ink-700 font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-ink-50"}>
                <td className="px-3 py-1.5 text-ink-300 font-mono text-[11px] tabular-nums">
                  {ri + 1}
                </td>
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-ink-700 align-top whitespace-nowrap max-w-[28rem] truncate"
                    title={c == null ? "" : String(c)}
                  >
                    {c == null ? (
                      <span className="text-ink-300 italic">null</span>
                    ) : typeof c === "boolean" ? (
                      <span className="font-mono text-sovereign-500">{String(c)}</span>
                    ) : typeof c === "number" ? (
                      <span className="font-mono tabular-nums">{c}</span>
                    ) : (
                      String(c)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  filename: string;
  format: string;
  content: string;
  /** 顯示前幾行（不傳即全部） */
  limit?: number;
}

export function TextPreview({ filename, format, content, limit }: Props) {
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  const shownLines = limit && totalLines > limit ? lines.slice(0, limit) : lines;
  const truncated = limit ? totalLines > limit : false;

  return (
    <div className="border border-ink-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-200 bg-ink-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm text-ink-900 truncate">{filename}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-ink-200 bg-white text-ink-500">
            {format}
          </span>
        </div>
        <div className="text-xs text-ink-400 tabular-nums shrink-0">
          {totalLines.toLocaleString()} 行{truncated ? `（顯示前 ${limit}）` : ""}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[28rem] bg-ink-900 text-ink-50 font-mono text-xs leading-6">
        <table className="w-full">
          <tbody>
            {shownLines.map((l, i) => (
              <tr key={i}>
                <td className="text-ink-500 text-right pr-3 pl-4 w-12 select-none tabular-nums align-top">
                  {i + 1}
                </td>
                <td className="pr-4 whitespace-pre">{l || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

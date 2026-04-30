import type { SchemaField } from "@/lib/types";

const TYPE_COLOR: Record<SchemaField["type"], string> = {
  string: "bg-ink-100 text-ink-600",
  integer: "bg-sovereign-100 text-sovereign-600",
  number: "bg-sovereign-100 text-sovereign-600",
  boolean: "bg-accent-50 text-accent-600",
  datetime: "bg-emerald-100 text-emerald-700",
  date: "bg-emerald-100 text-emerald-700",
};

export function SchemaPanel({ schema }: { schema: SchemaField[] }) {
  return (
    <div className="border border-ink-200 rounded-lg overflow-hidden">
      <div className="bg-ink-50 px-4 py-2 text-xs text-ink-500">Schema · {schema.length} 欄位</div>
      <table className="text-sm w-full border-collapse">
        <tbody>
          {schema.map((f) => (
            <tr key={f.name} className="border-t border-ink-200 first:border-t-0">
              <td className="px-3 py-2 align-top w-1/3">
                <code className="font-mono text-ink-900">{f.name}</code>
              </td>
              <td className="px-3 py-2 align-top w-24">
                <span
                  className={`text-[11px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                    TYPE_COLOR[f.type] ?? "bg-ink-100 text-ink-500"
                  }`}
                >
                  {f.type}
                </span>
              </td>
              <td className="px-3 py-2 text-ink-500 leading-6">{f.description ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

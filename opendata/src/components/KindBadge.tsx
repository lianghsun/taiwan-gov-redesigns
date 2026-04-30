import type { Kind } from "@/lib/types";

const STYLE: Record<Kind, { label: string; className: string }> = {
  structured: {
    label: "結構化",
    className: "bg-sovereign-50 text-sovereign-600 border-sovereign-100",
  },
  unstructured: {
    label: "非結構化",
    className: "bg-violet-50 text-violet-600 border-violet-100",
  },
};

export function KindBadge({ kind }: { kind: Kind }) {
  const s = STYLE[kind];
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function FabricatedBadge() {
  return (
    <span
      className="inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 font-semibold whitespace-nowrap"
      title="此資料集內容為虛構示意，請勿用於真實研究或對獎"
    >
      ⚠ 示意
    </span>
  );
}

export function FabricatedBanner() {
  return (
    <div className="border-y border-rose-200 bg-rose-50 text-rose-700">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-3 text-sm">
        <span className="font-semibold shrink-0">⚠ 示意資料</span>
        <span className="text-rose-700/80">
          本資料集內容完全為虛構，僅作為「應該長什麼樣」之設計示範。請勿用於任何真實對獎、研究或政策決策。
        </span>
      </div>
    </div>
  );
}

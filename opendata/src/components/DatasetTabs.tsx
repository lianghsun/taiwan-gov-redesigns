"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "", label: "概覽" },
  { key: "files", label: "檔案" },
  { key: "preview", label: "資料預覽" },
  { key: "examples", label: "應用範例" },
  { key: "history", label: "版本歷史" },
] as const;

export function DatasetTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/datasets/${id}`;

  return (
    <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="dataset sections">
      {TABS.map((t) => {
        const href = t.key ? `${base}/${t.key}` : base;
        const isActive =
          t.key === ""
            ? pathname === base
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={t.key || "overview"}
            href={href}
            prefetch
            aria-current={isActive ? "page" : undefined}
            className={
              "px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap " +
              (isActive
                ? "border-ink-900 text-ink-900"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-300")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

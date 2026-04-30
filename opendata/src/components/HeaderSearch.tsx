"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  variant?: "header" | "hero";
  placeholder?: string;
}

export function HeaderSearch({ variant = "header", placeholder }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("q") ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/datasets?q=${encodeURIComponent(q)}` : "/datasets");
  }

  if (variant === "hero") {
    return (
      <form onSubmit={submit} className="relative max-w-xl">
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "搜尋資料集、發布單位、標籤…"}
          className="w-full bg-white border border-ink-300 rounded-xl pl-11 pr-24 py-3.5 text-base placeholder:text-ink-400 focus:border-ink-500 focus:outline-none focus:ring-2 focus:ring-ink-200"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden>
          ⌕
        </span>
        <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-ink-200 text-ink-400 bg-ink-50">
          ⌘ K
        </kbd>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="relative w-full sm:w-72">
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "搜尋資料集"}
        className="w-full bg-ink-50 border border-ink-200 rounded-lg pl-9 pr-12 py-1.5 text-sm placeholder:text-ink-400 focus:bg-white focus:border-ink-400 focus:outline-none"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm" aria-hidden>
        ⌕
      </span>
      <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-ink-200 text-ink-400 bg-white">
        ⌘ K
      </kbd>
    </form>
  );
}

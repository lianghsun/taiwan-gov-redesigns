import Link from "next/link";
import { Suspense } from "react";
import { HeaderSearch } from "./HeaderSearch";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-white/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-tight text-ink-900">
            if<span className="text-accent-500">·</span>opendata
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-ink-400 border border-ink-300 rounded px-1.5 py-0.5">
            parallel-universe
          </span>
        </Link>

        <div className="hidden md:block flex-1 max-w-lg">
          <Suspense fallback={null}>
            <HeaderSearch />
          </Suspense>
        </div>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/datasets" className="text-ink-700 hover:text-ink-900 hidden sm:inline">
            資料集
          </Link>
          <Link
            href="/api"
            className="text-ink-700 hover:text-ink-900 hidden sm:inline-flex items-center gap-1"
          >
            API
            <span className="text-[9px] uppercase tracking-wider px-1 py-px rounded bg-accent-50 text-accent-600 font-semibold">
              REST
            </span>
          </Link>
          <Link
            href="/mcp"
            className="text-ink-700 hover:text-ink-900 hidden sm:inline-flex items-center gap-1"
          >
            MCP
            <span className="text-[9px] uppercase tracking-wider px-1 py-px rounded bg-sovereign-50 text-sovereign-600 font-semibold">
              LLM
            </span>
          </Link>
          <Link href="/about" className="text-ink-700 hover:text-ink-900">
            關於
          </Link>
          <a
            href="https://github.com/lianghsun/taiwan-gov-redesigns"
            target="_blank"
            rel="noreferrer"
            className="text-ink-500 hover:text-ink-900 inline-flex items-center"
            aria-label="GitHub repo"
            title="GitHub: lianghsun/taiwan-gov-redesigns"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

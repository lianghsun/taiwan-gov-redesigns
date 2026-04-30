import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white text-sm text-ink-500">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center">
        <div>
          <span className="font-semibold text-ink-700">if·opendata</span> · if-series 的第一個平行時空站台
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-ink-700">關於本站</Link>
          <Link href="/datasets" className="hover:text-ink-700">瀏覽資料集</Link>
          <Link href="/api" className="hover:text-ink-700">API</Link>
          <Link href="/mcp" className="hover:text-ink-700">MCP</Link>
        </div>
        <div className="sm:ml-auto text-xs text-ink-400">
          這不是政府網站，是個想像中應該長這樣的版本。
        </div>
      </div>
    </footer>
  );
}

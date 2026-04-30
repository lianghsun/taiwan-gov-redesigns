import Link from "next/link";

export const metadata = { title: "API 文件" };

interface Endpoint {
  method: string;
  path: string;
  description: string;
  example: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/datasets",
    description: "列出所有資料集的 metadata（不含原始資料）。",
    example: "/api/datasets",
  },
  {
    method: "GET",
    path: "/api/datasets/{id}",
    description: "取得單一資料集的完整 metadata，含 schema、files、history。",
    example: "/api/datasets/public-toilets",
  },
  {
    method: "GET",
    path: "/api/datasets/{id}/schema",
    description: "只取 schema（欄位、型別、說明）。",
    example: "/api/datasets/public-toilets/schema",
  },
  {
    method: "GET",
    path: "/api/datasets/{id}/data",
    description:
      "取結構化資料。支援 ?limit=N&offset=N&fields=a,b,c&format=json|csv|jsonl 。預設 limit=100、上限 1000。",
    example: "/api/datasets/public-toilets/data?limit=10&fields=name,city,grade",
  },
  {
    method: "GET",
    path: "/data/{org}/{id}/{path}",
    description: "原始檔案直連（不經 API envelope）。",
    example: "/data/opendata/public-toilets/data.csv",
  },
];

export default function ApiPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-ink-900 mb-2">API</h1>
      <p className="text-ink-500 leading-7 mb-8 max-w-2xl">
        所有資料集都可透過 REST API 取得。回傳格式為標準 JSON envelope（{`{ data, meta, links }`}），
        錯誤回 4xx/5xx + {`{ error, message }`}。配合右側 <Link href="/mcp" className="text-sovereign-500 hover:underline">MCP server</Link>{" "}
        即可在 Claude Desktop 用自然語言查資料。
      </p>

      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden mb-8">
        <ul className="divide-y divide-ink-100">
          {ENDPOINTS.map((e) => (
            <li key={e.path} className="px-5 py-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-[11px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                  {e.method}
                </span>
                <code className="font-mono text-sm text-ink-900">{e.path}</code>
              </div>
              <p className="text-sm text-ink-600 leading-6 mb-2">{e.description}</p>
              <a
                href={e.example}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-mono text-sovereign-500 hover:underline"
              >
                試一下：{e.example} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-xl font-semibold text-ink-900 mb-3">Envelope 範例</h2>
      <pre className="bg-ink-900 text-ink-50 p-4 rounded-lg text-xs leading-6 overflow-x-auto mb-8">
        <code>{`{
  "data": [ ... 結果陣列或物件 ... ],
  "meta": {
    "id": "public-toilets",
    "total": 60,
    "offset": 0,
    "limit": 10,
    "returned": 10,
    "fields": null,
    "sourceFile": "data.csv",
    "sourceFormat": "csv"
  },
  "links": {
    "self":   "/api/datasets/public-toilets/data?offset=0&limit=10",
    "next":   "/api/datasets/public-toilets/data?offset=10&limit=10",
    "prev":   null,
    "schema": "/api/datasets/public-toilets/schema",
    "raw":    "/data/opendata/public-toilets/data.csv"
  }
}`}</code>
      </pre>

      <h2 className="text-xl font-semibold text-ink-900 mb-3">OpenAPI Spec</h2>
      <p className="text-sm text-ink-600 leading-7 mb-3">
        提供 OpenAPI 3.1 規格檔，可直接餵給 Postman / Insomnia / Stoplight 或自動生成 SDK。
      </p>
      <a
        href="/openapi.json"
        download
        className="inline-flex items-center gap-2 border border-ink-300 px-4 py-2 rounded-lg text-sm font-semibold text-ink-700 hover:bg-white"
      >
        ⬇ openapi.json
      </a>

      <div className="mt-12 border-t border-ink-200 pt-8 text-sm text-ink-500">
        <h3 className="font-semibold text-ink-700 mb-2">設計原則</h3>
        <ul className="list-disc pl-5 space-y-1 leading-7">
          <li>所有 endpoint 不需 API key；CORS 允許所有來源（demo 性質）。</li>
          <li>結構化資料的 metadata、schema 由 build 時靜態產生，毫秒級回應。</li>
          <li>原始檔可走 <code>/data/...</code> 直連，與 <code>/api/...</code> 等價但跳過 envelope。</li>
          <li>非結構化資料（純文字）不提供 <code>/data</code> endpoint，請改用直連下載。</li>
        </ul>
      </div>
    </div>
  );
}

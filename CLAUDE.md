# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

`if-series` is a "parallel-universe" series of imagined Taiwan `.gov` websites — speculative redesigns of how official sites *should* look and behave. Each subdirectory is one site.

The first (and currently only) site lives in `opendata/`. It is a merged reimagining of:

- **data.gov.tw** — Taiwan's general open-data portal
- **數發部主權資料集** (MoDA sovereign datasets) — currently gated behind an application process

The design north star is **"HuggingFace × GitHub"**: dataset-as-repo, with rich previews, versioning vibes, and first-class application examples — not the PDF-dump experience the real portal is criticized for.

## Non-negotiable design principles

These came directly from the project owner and should constrain every implementation decision:

1. **No PDFs as primary source.** Datasets must be served as JSON / JSONL / CSV. PDFs are the single biggest complaint about the real portal; do not reproduce that failure mode.
2. **Every dataset ships with an official application example.** Treat the example as part of the dataset, not an afterthought. Think "model card" but for data.
3. **In-browser data preview is required.** Users should never have to download a file to know what's inside — emulate HuggingFace's dataset viewer (paginated tabular preview, schema, sample rows).
4. **Demo scope, not production scope.** Pull ~5 small real datasets from data.gov.tw for the opendata side. Don't pick anything large — this is a demo.
5. **MoDA datasets are faked.** The real MoDA sovereign datasets require an application to access, so use plausible **fake/placeholder content** for those. Make it obvious to a future maintainer which datasets are real-sourced vs. fabricated (e.g., a flag in the dataset metadata).

## Working directory

All website code goes under `opendata/`. The repo root is reserved for cross-site concerns (this file, future shared tooling). Don't scatter site code outside `opendata/`.

## Stack & layout (opendata/)

- **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 3** — chosen because the folder-as-route model maps cleanly onto `/datasets/[org]/[name]/{files,preview,examples}` (the HuggingFace-style tabs).
- **No database.** Datasets live as files under `opendata/data/<org>/<id>/` and are read at build time. The registry (`src/lib/datasets.ts`) walks the `data/` tree, parsing each `meta.json` into a `DatasetMeta` object (`src/lib/types.ts`). All dataset routes use `generateStaticParams` so the entire site is SSG.
- **Parsers:** `papaparse` for CSV; native `JSON.parse` per-line for JSONL; native `JSON.parse` (with array-extraction heuristic) for JSON. Preview tables are capped at 100 rows in `src/lib/parsers.ts`.
- **Markdown:** `react-markdown` + `remark-gfm` renders each dataset's `README.md`. Styles live in `.prose-tw` in `globals.css` (we do not use `@tailwindcss/typography`).
- **Kind taxonomy (primary UI classification):** `structured` (CSV/JSON/JSONL — tabular preview, schema) vs `unstructured` (TXT/MD — full-text, article chunking). The `org` field (`opendata`|`moda`) is directory grouping only; MoDA datasets always have `fabricated: true`. Fabricated datasets get a red banner via `src/components/KindBadge.tsx` (`FabricatedBanner`).
- **Static file serving:** `opendata/public/data` is a symlink to `../data/`, so all dataset files are served at `/data/<org>/<id>/<file>` without copying. The `walk()` function in datasets.ts uses `lstatSync` and skips symlinks to avoid infinite recursion.
- **JSON REST API:** `/api/datasets` (static list) and `/api/datasets/[id]/data` (dynamic, supports `?limit&offset&fields&format=json|csv|jsonl`). Full OpenAPI 3.1 spec at `/public/openapi.json`.
- **MCP server:** standalone ESM package at `opendata/mcp-server/`. Entry: `mcp-server/src/server.ts`. Reads from the shared `data/` directory. Run with `node mcp-server/dist/server.js`. Build: `npm run build` inside `mcp-server/`. The registry uses `import.meta.url` to resolve paths from `dist/`.

### Live demos

Each dataset can have an interactive in-browser demo. The pattern:
1. **`src/demos/meta.ts`** — server-safe map of `id → { title, blurb }`. Import this from server components.
2. **`src/demos/registry.tsx`** — `"use client"` module. Maps `id → { Component }` using `next/dynamic(loader, {ssr: false})`. Never import directly from server components.
3. **`src/components/DemoClient.tsx`** — client boundary that receives `id, rows, texts` and looks up the Component from the registry. This is what `examples/page.tsx` renders.
4. Demo data (rows/texts) is loaded at SSG time in `src/app/datasets/[name]/examples/page.tsx` and passed as serializable props.

Demos live in `src/demos/<Name>Demo.tsx`. All have `"use client"` and accept `{ rows, texts }` via `DemoProps`.

### Dataset shape

Each dataset directory **must** contain:

```
data/<org>/<id>/
  meta.json           # DatasetMeta (id, org, title, summary, files[], schema?, examples[])
  README.md           # renders into the Overview tab
  data.json|jsonl|csv # the primary file (CSV/JSONL preferred for tabular)
  examples/<name>.<py|mjs|ts|R|sql>
```

When adding a new dataset, also: list the example file in `meta.examples[]`, add the data file to `meta.files[]`, and (for tabular formats) populate `meta.schema`. The registry picks it up automatically — no central index to update.

## Commands (run from `opendata/`)

| 指令 | 用途 |
| --- | --- |
| `npm install` | 安裝套件 |
| `npm run dev` | 開啟開發伺服器（預設 :3000，被佔用會自動跳 :3001） |
| `npm run build` | 產生靜態 production build（每個 dataset 路由都會 SSG） |
| `npm run start` | 服務已 build 的內容 |
| `npm run typecheck` | 執行 `tsc --noEmit` |
| `npm run lint` | Next.js 內建 lint |

Smoke test after a structural change: run `npm run build` — if any dataset's `meta.json` is malformed, `generateStaticParams` will fail loudly during static page generation.

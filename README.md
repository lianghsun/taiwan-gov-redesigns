# if-series

> 「**如果**台灣的 .gov 網站長這樣，會不會比較好用？」

`if-series` 是一個「平行時空」系列，把幾個被詬病已久的台灣官方網站重新想像、重新設計、重新實作。每個子目錄就是一個獨立的站台。

目前已上線的站台：

| 子目錄 | 模仿／重做的對象 | 設計靈感 |
| --- | --- | --- |
| [`opendata/`](./opendata) | [data.gov.tw](https://data.gov.tw) + [數位部主權資料集](https://moda.gov.tw) | HuggingFace × GitHub |

> 這不是要取代任何官方網站，只是一個設計提案 — 一份「我們覺得它應該長什麼樣」的可運行 mock-up。

---

## 為什麼做這個

台灣的開放資料平台被詬病很久了：

- 「資料」常常只是一個 PDF，要再 OCR 才能用
- 想知道資料長怎樣，得先下載一個 200 MB 的 zip
- 沒有 schema、沒有版本、沒有應用範例
- 數位部「主權資料集」更慘 — 看一眼都要先寫申請

而與此同時，[HuggingFace](https://huggingface.co/datasets) 已經把資料集做成「網路上最舒服的 dataset 體驗」：每個 repo 都有 README、線上預覽、版本歷史、官方 demo。

這個 repo 就是在問：**如果我們的政府資料平台長那樣，會不會比較好？**

---

## 第一個站：`opendata/`

[**進入專案 →**](./opendata)

把 `data.gov.tw`（一般開放資料）和「數位部主權資料集」合併重做的平行時空版本。

### 不可動搖的設計原則

1. **PDF 絕不是主要格式。** 一律 JSON / JSONL / CSV。
2. **每個資料集都附「官方應用範例」**，當作 dataset card 的一部分。
3. **線上即時預覽**：不下載也看得到欄位、看得到 sample row。
4. **每個資料集都有 live demo**：不是貼一段 code，是實際能在瀏覽器裡點的互動界面。
5. **API + MCP 雙軌服務**：pipeline 可以零修改接，AI 助理可以直接讀。

### 目前包含 10 個 demo 資料集

| 結構化（real-sourced from data.gov.tw） | 非結構化（fabricated for demo） |
| --- | --- |
| 全國公廁分布、空品逐時、ETC 門架車流、觀光景點、戶籍人口、統一發票、政府行事曆 | 法規條文、行政院院會紀錄 |

並包含 2 個示範用的「主權資料集」（DP 樣本、健保就醫樣本），明確標示為 fabricated。

---

## 技術棧

- **Next.js 15 (App Router)** + React 19 + TypeScript + Tailwind 3
- 全站 SSG（每個 dataset 路由都用 `generateStaticParams` 預先靜態化）
- 沒有資料庫；所有 dataset 是 `data/<org>/<id>/` 下的檔案，build 時讀取
- **MCP server**（`opendata/mcp-server/`）— 8 個 tools，Claude Desktop / Cursor 一行設定接入
- **JSON REST API** + OpenAPI 3.1 spec

---

## 在本機跑起來

```bash
git clone https://github.com/lianghsun/taiwan-gov-redesigns.git
cd if-series/opendata
npm install
npm run dev          # http://localhost:3000
```

其他指令（一律在 `opendata/` 下執行）：

| 指令 | 用途 |
| --- | --- |
| `npm run build` | Production build（每個 dataset 路由都 SSG） |
| `npm run start` | 服務已 build 的內容 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js 內建 lint |

跑 MCP server：

```bash
cd opendata/mcp-server
npm install
npm run build
node dist/server.js
```

Claude Desktop 設定可在站上 `/mcp` 頁面看完整教學。

---

## 加新資料集

1. 在 `opendata/data/<org>/<id>/` 建目錄（`<org>` 通常是 `opendata` 或 `moda`）
2. 放 `meta.json`、`README.md`、資料檔（CSV / JSONL / JSON / TXT / MD）
3. 把資料檔列在 `meta.files[]`、把範例列在 `meta.examples[]`
4. 結構化資料填 `meta.schema`、非結構化資料設 `kind: "unstructured"`
5. （選用）在 `src/demos/` 加 live demo component，並註冊到 `src/demos/registry.tsx` 與 `src/demos/meta.ts`

Build 自動掃描，不用改任何中央 index。

---

## License

MIT — 用法請隨意，但請註明這是 demo / 設計提案，不是任何官方網站的真實版本。

---

## 不負責任的免責聲明

- `opendata/` 內所有 `data/opendata/*` 的資料來源是 [data.gov.tw](https://data.gov.tw)，但本站內的版本可能經過裁切、清洗、格式轉換，僅供 demo
- `data/moda/*` 的所有資料完全是**虛構**，只是為了「示範如果主權資料集對外開放會長什麼樣」而存在的設計用 placeholder
- 站上任何「政府單位」、「決議」、「中獎號碼」一律不可作為任何真實用途

export type Org = "opendata" | "moda";

export type Kind = "structured" | "unstructured";

export type FileFormat = "json" | "jsonl" | "csv" | "md" | "txt";

export interface DatasetFile {
  /** 相對於 dataset 目錄 */
  path: string;
  /** 顯示用名稱，預設取 path 最後一段 */
  label?: string;
  format: FileFormat;
  /** 檔案大小（bytes，build 時填入） */
  size?: number;
  /** 概略列數（CSV / JSONL 才有意義） */
  rows?: number;
}

export interface ApplicationExample {
  /** 顯示名稱 */
  title: string;
  /** 程式語言（fenced code block 用） */
  language: "python" | "javascript" | "typescript" | "r" | "bash" | "sql";
  /** 程式範例檔（相對於 dataset 目錄） */
  path: string;
  /** 短說明 */
  description: string;
}

export interface SchemaField {
  name: string;
  type: "string" | "integer" | "number" | "boolean" | "datetime" | "date";
  description?: string;
}

export interface Commit {
  /** 7 碼 short SHA（demo 為靜態擬造） */
  sha: string;
  /** ISO 8601 日期 */
  date: string;
  /** 提交者顯示名稱 */
  author: string;
  /** 一行摘要 */
  message: string;
  /** 補充說明（可選） */
  body?: string;
  /** 受影響的檔案路徑（相對於 dataset 目錄） */
  files: string[];
  /** 統計：新增 / 移除 列數，schema 變動 */
  stats?: {
    added?: number;
    removed?: number;
    schemaChanged?: boolean;
  };
}

export interface DatasetMeta {
  /** URL slug，需獨一無二（全站範圍） */
  id: string;
  /**
   * 內部分組：實體目錄位置 data/<org>/<id>/。
   * 與 UI 分類無關，UI 用 kind。
   */
  org: Org;
  /** UI 主分類：結構化 / 非結構化 */
  kind: Kind;
  /** 主標題（中文） */
  title: string;
  /** 一句話摘要 */
  summary: string;
  /** 發布單位（中文） */
  publisher: string;
  /** 授權，預設政府資料開放授權條款 1.0 */
  license: string;
  /** 主要標籤 */
  tags: string[];
  /** 真實對應的 data.gov.tw 連結；MoDA 假資料則沒有 */
  upstreamUrl?: string;
  /** true 代表內容為虛構的示意資料（適用所有 MoDA 主權資料示意） */
  fabricated?: boolean;
  /** 主要資料檔（preview 預設使用第一個） */
  files: DatasetFile[];
  /** 資料 schema 描述 */
  schema?: SchemaField[];
  /** 應用範例 */
  examples: ApplicationExample[];
  /** 最後更新（ISO 8601） */
  updatedAt: string;
  /** 模擬之 git 提交歷史（demo 用，最新在前） */
  history?: Commit[];
}

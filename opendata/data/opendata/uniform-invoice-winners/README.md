# 統一發票中獎號碼

> **示範資料**：本 demo 為虛構號碼，僅作為資料 schema 與工具示範。請勿用於實際對獎。

## 為什麼要重做這份資料集

原 data.gov.tw 的版本有幾個工程上的痛點：

- 結構不穩定：早期以 PDF / 圖片公告，近年才改 CSV
- 雙月期欄位以全形字串混合表示（`109年 09-10月`）
- 每期一份檔案，整合困難

本平台的版本：以 **JSONL** 提供，每行一期、欄位固定型別，方便管線處理。

## 範例查詢思路

```ts
const winners = readJsonl("data.jsonl");
const target = winners.find(w => w.year === 115 && w.period === "01-02");
const last8 = "12345678";
const last3 = last8.slice(-3);
const tier = matchTier(target, last8, last3);
```

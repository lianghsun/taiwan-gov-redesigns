export interface DemoMeta {
  title: string;
  blurb: string;
}

export const DEMO_META: Record<string, DemoMeta> = {
  "public-toilets": {
    title: "互動 Demo：找最近的公廁",
    blurb: "點地圖選位置、調整半徑與評等，立即看到符合條件的公廁。",
  },
  "nhi-encounter-dp-sample": {
    title: "互動 Demo：差分隱私 ε 的影響",
    blurb: "拉動隱私預算 ε，比較原始計數與 Laplace 雜訊計數。",
  },
  "gov-calendar-2026": {
    title: "互動 Demo：2026 年月曆與連假",
    blurb: "選月份檢視假日；連假以區塊著色。",
  },
  "uniform-invoice-winners": {
    title: "互動 Demo：對統一發票",
    blurb: "輸入年期與發票號碼，立即比對中獎結果。",
  },
  "air-quality-hourly": {
    title: "互動 Demo：測站 24 小時走勢",
    blurb: "選測站，觀看當日 24 小時 PM2.5 / AQI 折線。",
  },
  "tourism-spots": {
    title: "互動 Demo：篩選觀光景點",
    blurb: "依縣市、類別、票價、無障礙過濾景點。",
  },
  "freeway-etc-sample": {
    title: "互動 Demo：尖峰車流時段",
    blurb: "選門架，看 5 分鐘窗口的車流量與平均車速。",
  },
  "household-population-stats": {
    title: "互動 Demo：高齡人口比例",
    blurb: "選年度，比較各縣市 65+ 占比。",
  },
  "legal-texts-sample": {
    title: "互動 Demo：法規條文搜尋",
    blurb: "輸入關鍵字，回傳所有命中的條文。",
  },
  "cabinet-meeting-minutes-sample": {
    title: "互動 Demo：擷取院會決議",
    blurb: "選一次院會，列出所有決議事項。",
  },
};

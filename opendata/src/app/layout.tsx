import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "if·opendata — 平行時空的台灣資料平台",
    template: "%s · if·opendata",
  },
  description:
    "if·opendata 是一個想像中的台灣開放資料 + 數發部主權資料合併平台，靈感來自 HuggingFace × GitHub。屬於 if-series 的第一個站台。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

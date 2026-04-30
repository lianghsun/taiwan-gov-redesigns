import { NextResponse } from "next/server";
import { listDatasets } from "@/lib/datasets";

export const dynamic = "force-static";

export async function GET() {
  const items = listDatasets();
  return NextResponse.json({
    data: items.map((d) => ({
      id: d.id,
      kind: d.kind,
      title: d.title,
      summary: d.summary,
      publisher: d.publisher,
      license: d.license,
      tags: d.tags,
      fabricated: d.fabricated ?? false,
      updatedAt: d.updatedAt,
      formats: Array.from(new Set(d.files.map((f) => f.format))),
      links: {
        self: `/api/datasets/${d.id}`,
        schema: `/api/datasets/${d.id}/schema`,
        data: `/api/datasets/${d.id}/data`,
        web: `/datasets/${d.id}`,
      },
    })),
    meta: {
      total: items.length,
      generatedAt: new Date().toISOString(),
    },
  });
}

import { NextResponse } from "next/server";
import { getDataset, listDatasets } from "@/lib/datasets";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return listDatasets().map((d) => ({ id: d.id }));
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ds = getDataset(id);
  if (!ds) {
    return NextResponse.json(
      { error: "not_found", message: `dataset '${id}' not found` },
      { status: 404 },
    );
  }
  return NextResponse.json({
    data: {
      id: ds.id,
      kind: ds.kind,
      schema: ds.schema ?? null,
      hint:
        ds.kind === "unstructured"
          ? "本資料集為非結構化（純文字 / markdown），無欄位 schema。"
          : undefined,
    },
  });
}

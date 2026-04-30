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
      ...ds,
      links: {
        self: `/api/datasets/${ds.id}`,
        schema: `/api/datasets/${ds.id}/schema`,
        data: `/api/datasets/${ds.id}/data`,
        web: `/datasets/${ds.id}`,
        files: ds.files.map((f) => `/data/${ds.org}/${ds.id}/${f.path}`),
      },
    },
  });
}

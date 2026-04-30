import { Suspense } from "react";
import { listDatasets } from "@/lib/datasets";
import { DatasetsListClient } from "./DatasetsListClient";

export const dynamic = "force-static";

export default function DatasetsListPage() {
  const items = listDatasets();
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Suspense fallback={null}>
        <DatasetsListClient items={items} />
      </Suspense>
    </div>
  );
}

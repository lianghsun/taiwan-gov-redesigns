"""輸入經緯度，回傳半徑 1km 內依評等排序的公廁。

執行：
    python nearest_toilet.py 25.0526 121.5202
"""
from __future__ import annotations

import csv
import math
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.csv"
GRADE_RANK = {"特優": 0, "優等": 1, "良好": 2, "普通": 3, "改善": 4}


def haversine(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    """兩點之間的公里距離。"""
    R = 6371.0088
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = math.radians(b_lat - a_lat)
    dl = math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def main(lat: float, lng: float, radius_km: float = 1.0) -> None:
    with DATA.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    nearby = []
    for r in rows:
        d = haversine(lat, lng, float(r["lat"]), float(r["lng"]))
        if d <= radius_km:
            nearby.append((d, r))

    nearby.sort(key=lambda x: (GRADE_RANK.get(x[1]["grade"], 9), x[0]))
    print(f"半徑 {radius_km} km 內共 {len(nearby)} 座公廁，依評等優先排序：")
    for d, r in nearby[:20]:
        a11y = "♿" if r["accessible"] == "true" else "  "
        diaper = "👶" if r["diaperStation"] == "true" else "  "
        print(f"  [{r['grade']}] {a11y}{diaper} {r['name']} ({d*1000:.0f} m) — {r['address']}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    main(float(sys.argv[1]), float(sys.argv[2]))

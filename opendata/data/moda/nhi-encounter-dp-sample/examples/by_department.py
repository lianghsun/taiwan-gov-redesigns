"""依科別計算就醫人次與年齡層分布。

執行：
    python by_department.py
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.jsonl"


def main() -> None:
    rows = [json.loads(l) for l in DATA.read_text(encoding="utf-8").splitlines() if l.strip()]
    by_dept: dict[str, Counter[str]] = defaultdict(Counter)
    for r in rows:
        by_dept[r["department"]][r["ageBucket"]] += 1

    age_order = ["0-5", "6-12", "13-17", "18-39", "40-64", "65+"]
    print(f"總計 {len(rows)} 筆樣本，依科別／年齡層分布：")
    for dept in sorted(by_dept, key=lambda d: -sum(by_dept[d].values())):
        c = by_dept[dept]
        total = sum(c.values())
        bars = " ".join(f"{a}:{c[a]}" for a in age_order if c[a])
        print(f"  {dept:<8} 共 {total:3d} 人次  | {bars}")


if __name__ == "__main__":
    main()

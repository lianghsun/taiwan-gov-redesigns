"""找出 2026 年所有 3 天以上的連假。

執行：
    python find_long_weekends.py
"""
from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.json"


def main() -> None:
    rows = json.loads(DATA.read_text(encoding="utf-8"))
    by_date = {date.fromisoformat(r["date"]): r for r in rows}

    runs: list[tuple[date, date, list[str]]] = []
    cur_start: date | None = None
    cur_notes: list[str] = []
    cursor = min(by_date)
    last = max(by_date)

    while cursor <= last:
        row = by_date.get(cursor)
        is_holiday = bool(row and row["isHoliday"])
        if is_holiday:
            if cur_start is None:
                cur_start = cursor
                cur_notes = []
            if row and row.get("description"):
                cur_notes.append(row["description"])
        else:
            if cur_start is not None:
                end = cursor - timedelta(days=1)
                length = (end - cur_start).days + 1
                if length >= 3:
                    runs.append((cur_start, end, cur_notes))
                cur_start = None
        cursor += timedelta(days=1)

    print(f"2026 年共 {len(runs)} 個連假：")
    for s, e, notes in runs:
        days = (e - s).days + 1
        tag = "、".join(sorted(set(n for n in notes if n)))
        print(f"  {s} → {e} ({days} 天) {tag}")


if __name__ == "__main__":
    main()

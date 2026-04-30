"""列出指定縣市的免門票觀光景點。

執行：
    python free_spots_in_city.py 花蓮縣
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.jsonl"


def main(city: str) -> None:
    spots = [json.loads(l) for l in DATA.read_text(encoding="utf-8").splitlines() if l.strip()]
    free = [s for s in spots if s["city"] == city and s["ticketTwd"] == 0]
    free.sort(key=lambda s: (not s["accessible"], s["name"]))

    print(f"{city} 免門票景點 ({len(free)} 處)：")
    for s in free:
        a11y = "♿" if s["accessible"] else "  "
        print(f"  {a11y} [{s['category']}] {s['name']} — {s['summary']}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])

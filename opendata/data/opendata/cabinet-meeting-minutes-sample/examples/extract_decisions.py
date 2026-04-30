"""抓出每次院會所有「決議」段落，輸出純文字。

執行：
    python extract_decisions.py
"""
from __future__ import annotations

from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent


def extract(md: str) -> list[str]:
    """從 markdown 找出「決議：」之後的列表項，回傳文字 list。"""
    out: list[str] = []
    lines = md.splitlines()
    capturing = False
    for line in lines:
        s = line.strip()
        if s.startswith("決議"):
            capturing = True
            continue
        if not capturing:
            continue
        if s.startswith("- "):
            out.append(s[2:].strip())
        elif s == "":
            continue
        elif s.startswith("#") or s.startswith("##"):
            capturing = False
    return out


def main() -> None:
    for md_path in sorted(DATA_DIR.glob("*-第*次院會.md")):
        decisions = extract(md_path.read_text(encoding="utf-8"))
        print(f"## {md_path.stem}")
        if decisions:
            for d in decisions:
                print(f"  • {d}")
        else:
            print("  （無決議事項）")
        print()


if __name__ == "__main__":
    main()

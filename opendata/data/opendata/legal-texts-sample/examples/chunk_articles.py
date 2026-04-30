"""把法規 .txt 切成「條文 chunk」JSONL，方便進向量資料庫或 LLM 上下文。

執行：
    python chunk_articles.py > articles.jsonl
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent
ARTICLE_RE = re.compile(r"^第\s*(\d+)\s*條(?:[^\n]*)$", re.M)


def chunk(text: str, source: str) -> list[dict]:
    """以「第 X 條」為界切段，回傳 list of {law, article, text}。"""
    matches = list(ARTICLE_RE.finditer(text))
    if not matches:
        return []

    head = text[: matches[0].start()].strip()
    law_title = head.splitlines()[0] if head else source

    chunks = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        chunks.append(
            {
                "law": law_title,
                "article": int(m.group(1)),
                "source": source,
                "text": body,
            }
        )
    return chunks


def main() -> None:
    out: list[dict] = []
    for txt in sorted(DATA_DIR.glob("*.txt")):
        out.extend(chunk(txt.read_text(encoding="utf-8"), txt.name))

    for c in out:
        json.dump(c, sys.stdout, ensure_ascii=False)
        sys.stdout.write("\n")

    print(f"# 共輸出 {len(out)} 條文 chunk", file=sys.stderr)


if __name__ == "__main__":
    main()

"use client";

import { useEffect, useState } from "react";
import type { DatasetFile } from "@/lib/types";

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Props {
  org: string;
  id: string;
  primaryFile?: DatasetFile;
}

function buildSnippets(origin: string, dataUrl: string, apiUrl: string, format?: string): Snippet[] {
  const isCsv = format === "csv";
  const isJsonl = format === "jsonl";
  const isJson = format === "json";

  const snippets: Snippet[] = [];

  snippets.push({
    label: "curl",
    language: "bash",
    code: `curl -L "${dataUrl}" -o data.${format ?? "txt"}`,
  });

  if (isCsv) {
    snippets.push({
      label: "Python · pandas",
      language: "python",
      code: `import pandas as pd

df = pd.read_csv("${dataUrl}")
print(df.head())`,
    });
  } else if (isJsonl) {
    snippets.push({
      label: "Python · pandas",
      language: "python",
      code: `import pandas as pd

df = pd.read_json("${dataUrl}", lines=True)
print(df.head())`,
    });
  } else if (isJson) {
    snippets.push({
      label: "Python · pandas",
      language: "python",
      code: `import pandas as pd

df = pd.read_json("${dataUrl}")
print(df.head())`,
    });
  } else {
    snippets.push({
      label: "Python · requests",
      language: "python",
      code: `import requests

text = requests.get("${dataUrl}").text
print(text[:500])`,
    });
  }

  if (isJson || isJsonl) {
    snippets.push({
      label: "JavaScript · fetch",
      language: "javascript",
      code: `const res = await fetch("${dataUrl}");
const text = await res.text();
const rows = ${isJsonl ? 'text.trim().split("\\n").map((l) => JSON.parse(l))' : "JSON.parse(text)"};
console.log(rows);`,
    });
  } else if (isCsv) {
    snippets.push({
      label: "JavaScript · fetch + papaparse",
      language: "javascript",
      code: `import Papa from "papaparse";

const csv = await (await fetch("${dataUrl}")).text();
const { data } = Papa.parse(csv, { header: true });
console.log(data);`,
    });
  }

  snippets.push({
    label: "JSON API",
    language: "bash",
    code: `# 帶 schema 的 envelope 回傳，可加 ?limit=10&offset=0
curl "${apiUrl}"`,
  });

  return snippets;
}

export function QuickStart({ org, id, primaryFile }: Props) {
  const [origin, setOrigin] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!primaryFile) return null;

  const dataUrl = `${origin}/data/${org}/${id}/${primaryFile.path}`;
  const apiUrl = `${origin}/api/datasets/${id}/data`;
  const snippets = buildSnippets(origin, dataUrl, apiUrl, primaryFile.format);
  const active = snippets[activeIdx];

  async function copy() {
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-2 border-b border-ink-200 flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
          快速開始
        </div>
        <a
          href={dataUrl}
          download
          className="text-xs text-sovereign-500 hover:underline"
        >
          直接下載 →
        </a>
      </div>
      <div className="flex flex-wrap gap-1 px-3 pt-2 border-b border-ink-100">
        {snippets.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={
              "text-xs px-2.5 py-1.5 rounded-t border-b-2 -mb-px transition " +
              (i === activeIdx
                ? "border-ink-900 text-ink-900 font-semibold"
                : "border-transparent text-ink-500 hover:text-ink-700")
            }
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <pre className="bg-ink-900 text-ink-50 p-4 text-xs leading-6 overflow-x-auto max-h-72">
          <code>{active.code}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-ink-700 hover:bg-ink-600 text-white"
        >
          {copied ? "已複製" : "複製"}
        </button>
      </div>
    </div>
  );
}

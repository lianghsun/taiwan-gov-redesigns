"use client";

import { DEMOS, type DemoProps } from "@/demos/registry";

interface Props extends DemoProps {
  id: string;
}

export default function DemoClient({ id, rows, texts }: Props) {
  const entry = DEMOS[id];
  if (!entry) return null;
  const Demo = entry.Component;
  return <Demo rows={rows} texts={texts} />;
}

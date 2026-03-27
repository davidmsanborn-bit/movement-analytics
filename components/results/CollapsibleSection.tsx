"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] transition hover:text-[var(--accent)]"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "mt-4 max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}


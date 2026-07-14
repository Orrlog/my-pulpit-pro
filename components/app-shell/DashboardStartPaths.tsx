"use client";

import Link from "next/link";
import { useState } from "react";
import { startPaths, type StartPathId } from "./data";

export function DashboardStartPaths() {
  const [selectedPath, setSelectedPath] = useState<StartPathId>("explore");

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-3">
      {startPaths.map((path) => {
        const selected = selectedPath === path.id;

        return (
          <article
            key={path.id}
            className={`premium-card rounded-3xl border p-6 ${
              selected
                ? "selected-card premium-card-dark border-2 border-gold bg-teal text-cream-strong shadow-[0_22px_52px_rgba(0,47,49,0.24)]"
                : "border-line bg-cream-strong text-ink"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedPath(path.id)}
              className="block w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold/75"
              aria-pressed={selected}
            >
              <span
                className={`grid size-12 place-items-center rounded-2xl text-sm font-bold ${
                  selected ? "bg-cream-strong text-teal" : "bg-teal text-cream-strong"
                }`}
              >
                {path.icon}
              </span>
              <span className="mt-5 flex items-center justify-between gap-3">
                <span className={`text-xl font-bold ${selected ? "text-cream-strong" : "text-ink"}`}>
                  {path.label}
                </span>
                {selected ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/70 bg-gold/20 px-3 py-1 text-xs font-bold text-cream-strong">
                    <span aria-hidden="true" className="text-gold">
                      ✓
                    </span>
                    Selected
                  </span>
                ) : null}
              </span>
              <span
                className={`mt-3 block text-sm leading-7 ${
                  selected ? "text-cream-strong/85" : "text-muted"
                }`}
              >
                {path.description}
              </span>
            </button>
            <Link
              href={`/new-message?path=${path.id}`}
              className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-bold ${
                selected ? "bg-gold text-teal-dark" : "bg-teal text-cream-strong"
              }`}
            >
              Start
            </Link>
          </article>
        );
      })}
    </div>
  );
}

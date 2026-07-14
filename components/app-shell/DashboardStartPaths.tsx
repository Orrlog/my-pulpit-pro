"use client";

import Link from "next/link";
import { useState } from "react";
import { startPaths, type StartPathId } from "./data";

export function DashboardStartPaths() {
  const [selectedPath, setSelectedPath] = useState<StartPathId>("explore");
  const selected = startPaths.find((path) => path.id === selectedPath) ?? startPaths[0];

  return (
    <div className="mt-5 grid gap-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {startPaths.map((path) => {
          const isSelected = selectedPath === path.id;

          return (
            <button
              key={path.id}
              type="button"
              onClick={() => setSelectedPath(path.id)}
              className={`premium-card rounded-3xl border p-6 text-left ${
                isSelected
                  ? "selected-card premium-card-dark border-2 border-gold bg-teal text-cream-strong shadow-[0_22px_52px_rgba(0,47,49,0.24)]"
                  : "border-line bg-cream-strong text-ink"
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`grid size-12 place-items-center rounded-2xl text-sm font-bold ${
                  isSelected ? "bg-cream-strong text-teal" : "bg-teal text-cream-strong"
                }`}
              >
                {path.icon}
              </span>
              <span className="mt-5 flex items-center justify-between gap-3">
                <span className={`text-xl font-bold ${isSelected ? "text-cream-strong" : "text-ink"}`}>
                  {path.label}
                </span>
                {isSelected ? (
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
                  isSelected ? "text-cream-strong/85" : "text-muted"
                }`}
              >
                {path.description}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-cream-strong p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted">
          Continue to the {selected.label} details screen. You can still go back and change the
          starting path inside the wizard.
        </p>
        <Link
          href={`/new-message?path=${selected.id}&stage=details`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-2 text-sm font-bold text-cream-strong"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ensureProjectLibrary, getUsageSummary, type ProjectUsageSummary } from "./message-project-library";

export function UsageCard() {
  const [usage, setUsage] = useState<ProjectUsageSummary>(() => ({ used: 0, total: 10, remaining: 10, month: "" }));

  useEffect(() => {
    queueMicrotask(() => {
      ensureProjectLibrary();
      setUsage(getUsageSummary());
    });
  }, []);

  const percent = usage.total > 0 ? Math.min(100, Math.round((usage.used / usage.total) * 100)) : 0;

  return (
    <section className="rounded-3xl border border-teal-dark bg-teal p-6 text-cream-strong shadow-[0_22px_52px_rgba(0,47,49,0.24)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Plan preview</p>
          <h2 className="mt-2 text-2xl font-bold text-cream-strong">Solo Plan</h2>
          <p className="mt-2 text-sm leading-6 text-cream-strong/75">
            Exploring message ideas is free. A project is counted when you create the full message workspace.
          </p>
        </div>
        <div className="min-w-56">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-cream-strong">{usage.used} of {usage.total}</p>
            <p className="text-sm font-bold text-cream-strong/75">{usage.remaining} remaining</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-teal-dark">
            <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-cream-strong/75">
            Message projects used this calendar month.
          </p>
        </div>
      </div>
    </section>
  );
}

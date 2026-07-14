export function UsageCard() {
  const used = 0;
  const total = 8;
  const remaining = total - used;
  const percent = Math.round((used / total) * 100);

  return (
    <section className="rounded-3xl border border-teal-dark bg-teal p-6 text-cream-strong shadow-[0_22px_52px_rgba(0,47,49,0.24)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Plan preview</p>
          <h2 className="mt-2 text-2xl font-bold text-cream-strong">Solo Plan</h2>
          <p className="mt-2 text-sm leading-6 text-cream-strong/75">
            Preview data until backend tracking is connected. Exploring ideas is free.
          </p>
        </div>
        <div className="min-w-56">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-cream-strong">{used} of {total}</p>
            <p className="text-sm font-bold text-cream-strong/75">{remaining} remaining</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-teal-dark">
            <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-cream-strong/75">
            Message projects used this month. Only creating the full message workspace counts as a project once backend tracking is connected.
          </p>
        </div>
      </div>
    </section>
  );
}

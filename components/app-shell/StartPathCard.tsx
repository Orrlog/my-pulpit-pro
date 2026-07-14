import Link from "next/link";
import type { StartPath } from "./data";

export function StartPathCard({ path }: { path: StartPath }) {
  return (
    <Link
      href={`/new-message?path=${path.id}`}
      className="premium-card block rounded-3xl border border-line bg-cream-strong p-6 focus-visible:bg-cream-strong"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-teal text-sm font-bold text-cream-strong">
        {path.icon}
      </span>
      <h3 className="mt-5 text-xl font-bold text-ink">{path.label}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{path.description}</p>
      <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">
        Start
      </span>
    </Link>
  );
}

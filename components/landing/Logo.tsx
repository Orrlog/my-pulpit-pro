import Link from "next/link";

type LogoProps = {
  light?: boolean;
};

export function Logo({ light = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 font-bold ${
        light ? "text-cream-strong" : "text-teal"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative grid size-10 place-items-center rounded-2xl border shadow-sm ${
          light
            ? "border-cream-strong/25 bg-cream-strong/10"
            : "border-teal/15 bg-teal text-cream-strong"
        }`}
      >
        <span className="absolute bottom-2 h-1.5 w-6 rounded-sm bg-gold" />
        <span
          className={`relative h-6 w-7 rounded-t-xl border ${
            light ? "border-cream-strong bg-cream-strong" : "border-cream-strong bg-cream-strong"
          }`}
        >
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-teal/20" />
          <span className="absolute left-1.5 top-2 h-px w-2 bg-teal" />
          <span className="absolute right-1.5 top-2 h-px w-2 bg-teal" />
          <span className="absolute left-1.5 top-3.5 h-px w-2 bg-teal/70" />
          <span className="absolute right-1.5 top-3.5 h-px w-2 bg-teal/70" />
        </span>
      </span>
      <span className="text-lg tracking-normal">My Pulpit Pro</span>
    </Link>
  );
}

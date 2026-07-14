import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/new-message", label: "Start a New Message", icon: "N" },
  { href: "/projects", label: "My Messages", icon: "M" },
  { href: "/settings", label: "Settings", icon: "S" },
  { href: "/", label: "Back to Website", icon: "W" },
];

function AppWordmark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 text-teal">
      <span className="grid size-10 place-items-center rounded-2xl bg-teal text-sm font-bold text-cream-strong">
        MP
      </span>
      <span className="font-bold">My Pulpit Pro</span>
    </Link>
  );
}

function NavLinks() {
  return (
    <div className="grid gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-ink transition hover:bg-cream focus-visible:bg-cream"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal/10 text-xs font-bold text-teal">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export function AppShell({
  title,
  eyebrow = "Preview app",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="lg:grid lg:grid-cols-[18rem_1fr]">
        <aside className="hidden min-h-screen border-r border-line bg-cream-strong px-5 py-6 lg:block">
          <AppWordmark />
          <div className="mt-6 rounded-2xl border border-line bg-background/70 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Preview mode</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              Secure accounts, billing, saved projects, and message generation will be connected in
              later phases.
            </p>
          </div>
          <nav aria-label="Application navigation" className="mt-7">
            <NavLinks />
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-line bg-background/95 px-5 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  {eyebrow}
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight text-teal sm:text-4xl">
                  {title}
                </h1>
              </div>
              <details className="relative lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-line bg-cream-strong px-4 py-2 text-sm font-bold text-teal marker:hidden">
                  Menu
                </summary>
                <div className="absolute right-0 mt-3 w-72 rounded-3xl border border-line bg-cream-strong p-3 shadow-xl">
                  <AppWordmark />
                  <nav aria-label="Mobile application navigation" className="mt-4">
                    <NavLinks />
                  </nav>
                </div>
              </details>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

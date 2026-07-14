import Link from "next/link";
import { ButtonLink } from "./ButtonLink";
import { Logo } from "./Logo";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-strong/10 bg-teal shadow-[0_10px_30px_rgba(0,47,49,0.18)]">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-6 lg:px-8"
      >
        <Logo light />

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-cream-strong/88 transition hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/signup"
            className="text-sm font-bold text-cream-strong/88 transition hover:text-gold"
          >
            Sign In
          </Link>
          <ButtonLink href="/signup" variant="gold" className="min-h-10 px-5 py-2">
            Start Free Trial
          </ButtonLink>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-cream-strong/25 bg-cream-strong/10 px-4 py-2 text-sm font-bold text-cream-strong marker:hidden">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-line bg-cream-strong p-3 shadow-xl">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-background"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/signup"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-background"
              >
                Sign In
              </Link>
              <ButtonLink href="/signup" variant="gold" className="mt-2 w-full">
                Start Free Trial
              </ButtonLink>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}

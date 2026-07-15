import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Logo />
        <Link href="/" className="text-sm font-bold text-teal hover:text-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Back to Home</Link>
      </div>
      <section className="premium-card mx-auto mt-14 max-w-xl rounded-[2rem] border border-line bg-cream-strong p-6 shadow-[var(--shadow)] sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Secure account</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-teal">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

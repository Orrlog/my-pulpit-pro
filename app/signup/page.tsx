import Link from "next/link";
import { ButtonLink } from "@/components/landing/ButtonLink";
import { Logo } from "@/components/landing/Logo";

export const metadata = {
  title: "Signup Coming Soon | My Pulpit Pro",
  description:
    "Account creation, billing, saved projects, and message generation will be connected in the next build phase.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Logo />
        <Link href="/" className="text-sm font-bold text-teal hover:text-teal-dark">
          Back to Home
        </Link>
      </div>

      <section className="premium-card mx-auto mt-20 max-w-3xl rounded-[2rem] border border-line bg-cream-strong p-8 text-center shadow-[var(--shadow)] sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Coming next</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Account creation is coming in the next build phase.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          The public experience is taking shape. Secure signup, billing, saved projects, and
          message generation are being connected next.
        </p>
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-line bg-background p-5 text-sm leading-7 text-muted">
          <p>
            Signup is not active yet, so this page does not collect payment details, create an
            account, or generate sermon content.
          </p>
        </div>
        {/* TODO: Connect secure signup and billing after the public visual foundation is approved. */}
        <ButtonLink href="/" variant="secondary" className="mt-8">
          Return to Landing Page
        </ButtonLink>
      </section>
    </main>
  );
}

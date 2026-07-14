import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "light" | "gold";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const variants = {
    primary:
      "bg-teal text-cream-strong shadow-[0_16px_34px_rgba(0,61,63,0.22)] hover:-translate-y-0.5 hover:bg-teal-dark hover:shadow-[0_20px_42px_rgba(0,61,63,0.26)] active:translate-y-0",
    secondary:
      "border border-teal/25 bg-cream-strong text-teal hover:-translate-y-0.5 hover:border-teal hover:bg-cream hover:shadow-[0_14px_30px_rgba(30,41,38,0.1)] active:translate-y-0",
    light:
      "bg-cream-strong text-teal shadow-[0_16px_34px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_42px_rgba(0,0,0,0.2)] active:translate-y-0",
    gold:
      "bg-gold text-teal-dark shadow-[0_12px_24px_rgba(201,149,50,0.22)] hover:-translate-y-0.5 hover:bg-[#d8a642] hover:shadow-[0_16px_32px_rgba(201,149,50,0.28)] active:translate-y-0",
  };

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

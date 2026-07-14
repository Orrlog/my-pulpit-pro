type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p
          className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${
            light ? "text-gold" : "text-teal"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-serif text-4xl font-semibold leading-tight sm:text-5xl ${
          light ? "text-cream-strong" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {children ? (
        <div className={`mt-5 text-lg leading-8 ${light ? "text-cream/82" : "text-muted"}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

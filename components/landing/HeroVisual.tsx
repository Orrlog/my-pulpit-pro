const sermonPoints = [
  {
    title: "Waiting for certainty can become an excuse for standing still.",
    reference: "Ecclesiastes 11:1-2",
  },
  {
    title: "Faith moves forward even when every outcome cannot be seen.",
    reference: "Ecclesiastes 11:4-5",
  },
  {
    title: "The work entrusted to us still matters when conditions feel uncertain.",
    reference: "Ecclesiastes 11:6",
  },
];

const noteLines = ["", "", "", ""];

export function HeroVisual() {
  return (
    <div className="mx-auto w-full max-w-[29rem] lg:max-w-[30rem]">
      <article
        aria-label="Printable pulpit notes preview"
        className="aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-teal/25 bg-cream shadow-[0_30px_76px_rgba(0,47,49,0.26)]"
      >
        <header className="bg-teal px-6 py-5 text-cream-strong sm:px-7">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-gold">
            Printable Pulpit Notes
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-semibold leading-tight text-cream-strong sm:text-2xl">
            When the Wind Keeps You Waiting
          </h2>
          <div className="mt-2 h-px w-24 bg-gold" />
          <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-cream/80">
            Main passage: Ecclesiastes 11:1-6
          </p>
        </header>

        <div className="px-6 py-5 sm:px-7">
        <section>
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
            Featured Scripture
          </p>
          <div className="mt-2 rounded-md border border-gold/60 bg-[#fff6df] px-3 py-2.5">
            <p className="text-xs font-bold text-teal">Ecclesiastes 11:4</p>
            <blockquote className="mt-1.5 border-l-2 border-teal pl-3 font-serif text-sm leading-6 text-ink sm:text-base">
              &quot;Whoever watches the wind will not plant; whoever looks at the clouds will not
              reap.&quot;
            </blockquote>
          </div>
        </section>

        <section className="mt-3.5 rounded-md border border-teal/18 bg-cream-strong px-3 py-2.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
            Big Idea
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-ink sm:text-sm">
            Faithful people do not wait for perfect conditions before they obey God.
          </p>
        </section>

        <section className="mt-3.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
            Sermon Points
          </p>
          <ol className="mt-2.5 space-y-2">
            {sermonPoints.map((point, index) => (
              <li
                key={point.title}
                className="grid grid-cols-[1.35rem_1fr] gap-2.5 border-l-2 border-teal/20 pl-2"
              >
                <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-teal text-[0.58rem] font-bold text-cream-strong">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-bold leading-5 text-ink sm:text-sm">{point.title}</p>
                  <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-[0.11em] text-muted">
                    Supporting Scripture: {point.reference}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-3.5 grid gap-3 border-t border-gold/50 pt-3 sm:grid-cols-2">
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
              Application
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              What faithful step have you delayed while waiting for better conditions?
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
              Closing
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Move with wisdom. Act with faith. Trust God with what you cannot control.
            </p>
          </div>
        </section>

        <section className="mt-3.5 border-t border-gold/40 pt-3">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
            Closing Prayer
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Lord, give us courage to obey before every condition feels certain.
          </p>
        </section>

        <section className="mt-3.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-teal">
            Handwritten Notes
          </p>
          <div className="mt-2.5 space-y-2.5">
            {noteLines.map((_, index) => (
              <div key={index} className="h-px bg-line" />
            ))}
          </div>
        </section>
        </div>
      </article>
    </div>
  );
}

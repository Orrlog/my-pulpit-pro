import { ButtonLink } from "@/components/landing/ButtonLink";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { Navigation } from "@/components/landing/Navigation";
import { SectionHeading } from "@/components/landing/SectionHeading";

const benefits = [
  {
    title: "Built around your message length",
    body: "Choose 30, 45, or 60 minutes, and receive the depth, number of points, supporting Scriptures, and applications the message needs.",
  },
  {
    title: "Start wherever you are",
    body: "Begin with no idea, an idea already forming, or the questions and burdens your congregation is carrying.",
  },
  {
    title: "Walk in with polished notes",
    body: "Turn the finished outline into structured, printable pulpit notes with room for your own thoughts.",
  },
];

const features = [
  {
    title: "Explore Message Ideas",
    body: "Find fresh themes, directions, passages, and angles when the week starts with a blank page.",
  },
  {
    title: "Develop My Message",
    body: "Start with the topic, passage, burden, or idea already forming and shape it into a stronger outline.",
  },
  {
    title: "Speak to This Week",
    body: "Build around concerns people carry: grief, anxiety, family strain, doubt, hope, forgiveness, and faithfulness.",
  },
  {
    title: "Message Length Builder",
    body: "Choose 30, 45, or 60 minutes so the outline has the right number of points, verses, applications, and depth.",
  },
  {
    title: "Editable Sermon Points",
    body: "Keep, rewrite, remove, reorder, or add points until the outline sounds like you.",
  },
  {
    title: "Bible Translation Preference",
    body: "Preview planned preferences for KJV, NKJV, NIV, and NLT before exact text is connected from approved sources.",
  },
  {
    title: "Scripture and Theology Review",
    body: "Review Scripture context, unsupported claims, tradition-dependent language, and statements that may need a source before you print.",
    note: "Designed to support pastoral judgment, not replace it.",
  },
  {
    title: "Printable Pulpit Notes",
    body: "Create structured notes with sermon points, verses, applications, closing thoughts, and handwritten space.",
  },
  {
    title: "Saved Sermon History",
    body: "Revisit older messages and avoid repeating the same direction when a passage or topic returns.",
  },
];

const steps = [
  [
    "Choose where to begin",
    "Explore fresh directions, develop an idea already tugging at you, or build around the questions and burdens your congregation is carrying.",
  ],
  [
    "Choose your message length",
    "Select 30, 45, or 60 minutes. Your choice determines the number of sermon points, supporting Scriptures, applications, subpoints, and depth of the finished outline.",
  ],
  [
    "Shape it into your message",
    "Keep what fits. Rewrite what does not. Remove, reorder, or add points until the outline sounds like you and serves your congregation.",
  ],
  [
    "Print and preach",
    "Turn the completed message into polished pulpit notes with Scripture, applications, closing thoughts, and room for your handwritten additions.",
  ],
];

const genericChat = [
  "Repeated prompting",
  "Copy-and-paste answers",
  "Scattered notes and documents",
  "Rebuilding the same structure every week",
  "No pastor-specific project flow",
  "No polished pulpit-note format",
];

const pulpitPro = [
  "Three guided starting paths",
  "Message-length structure",
  "Editable sermon point cards",
  "Preferred Bible translation",
  "Saved sermon projects",
  "Polished printable pulpit notes",
];

const soloFeatures = [
  "One named user",
  "Eight created message projects per billing month",
  "Unlimited message-idea browsing",
  "Three sermon starting paths",
  "30, 45, and 60-minute options",
  "Editable sermon point cards",
  "Scripture-centered outlines",
  "Preferred Bible translation",
  "Printable pulpit notes",
  "Saved sermon history",
  "Unlimited editing inside created projects",
  "Seven-day free trial",
  "Credit card required",
];

const ministryFeatures = [
  "Everything in Solo",
  "Two named ministry seats",
  "Sixteen shared message projects",
  "Separate login for each user",
  "Private saved history for each user",
  "Youth message mode",
  "Bible study mode",
  "Lesson-based Bible word searches",
  "Hidden-message Bible word scrambles",
  "Printable youth activity sheets",
  "Shared monthly project allowance",
];

const faqs = [
  {
    question: "Does My Pulpit Pro write sermons for pastors?",
    answer:
      "No. My Pulpit Pro is built to support sermon preparation, not replace the pastor. You bring the calling, conviction, study, pastoral judgment, personality, and voice.",
  },
  {
    question: "When does a message count toward the monthly limit?",
    answer:
      "Browsing ideas does not use a message project. A project only counts after you deliberately choose an idea and create the full message.",
  },
  {
    question: "Can I edit a created message without using another project?",
    answer:
      "Yes. The current product direction keeps editing inside an already-created project from using another monthly project.",
  },
  {
    question: "What happens if I delete a sermon?",
    answer:
      "Deletion behavior has not been built yet. It should be defined carefully in a later phase before saved projects are connected.",
  },
  {
    question: "Which Bible translations are planned?",
    answer:
      "KJV, NKJV, NIV, and NLT are planned preference options. Exact Scripture text will later come from a properly licensed or public-domain source.",
  },
  {
    question: "Can two people share the Solo plan?",
    answer:
      "No. Solo is designed for one named user. Ministry Plus is planned for a pastor and one additional ministry leader.",
  },
  {
    question: "What is included in Ministry Plus?",
    answer:
      "Ministry Plus is planned to include two named seats, sixteen shared message projects, youth message mode, Bible study mode, lesson-based word searches, hidden-message word scrambles, activity sheets, and everything in Solo.",
  },
  {
    question: "Does Scripture and Theology Review replace pastoral judgment?",
    answer:
      "No. It is planned as a review aid that can surface items worth checking. It will not universally determine correct theology or replace Scripture study, prayer, or pastoral discernment.",
  },
  {
    question: "What happens after the seven-day trial?",
    answer:
      "The Solo plan is currently priced at $39/month. Signup, card collection, and billing will be connected in a later build phase.",
  },
];

function CheckList({
  items,
  light = false,
  highlightFirst = false,
}: {
  items: string[];
  light?: boolean;
  highlightFirst?: boolean;
}) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, index) => (
        <li
          key={item}
          className={`flex gap-3 text-sm leading-6 ${
            light ? "text-cream-strong" : "text-ink"
          } ${
            highlightFirst && index === 0
              ? "rounded-2xl border border-gold/40 bg-gold/10 p-3 font-bold text-teal"
              : ""
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-1 size-5 shrink-0 rounded-full border ${
              light ? "border-gold bg-gold" : "border-teal bg-teal"
            }`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <>
      <Navigation />
      <main>
        <section className="mx-auto grid max-w-7xl items-start gap-10 px-5 pb-16 pt-8 sm:px-6 sm:pt-9 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-18 lg:pt-10">
          <div className="flex flex-col justify-center">
            <p className="mb-5 inline-flex w-fit rounded-full border border-line bg-cream-strong px-4 py-2 text-sm font-bold text-teal shadow-sm">
              Built to support sermon preparation, not replace the pastor.
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.03] text-ink sm:text-6xl lg:text-7xl">
              Save hours on sermon prep.
              <span className="block text-teal">
                Preach a message that stirs the soul and lights the way.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Start with a blank page, an idea tugging at your heart, or the questions and
              burdens your congregation is carrying this week. My Pulpit Pro helps you uncover
              fresh angles and shape a Scripture-centered message that moves people and stays
              with them long after Sunday.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup">Start My 7-Day Free Trial</ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary">
                See How It Works
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Credit card required. Cancel before the trial ends and you will not be charged.
            </p>
          </div>
          <HeroVisual />
        </section>

        <section aria-label="Product benefits" className="border-y border-line bg-cream">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="premium-card rounded-2xl border border-line bg-cream-strong p-5">
                <span className="mb-4 block h-1.5 w-12 rounded-full bg-gold" />
                <h2 className="text-lg font-bold text-teal">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="The weekly weight"
            title="Sunday keeps coming, whether the sermon feels ready or not."
          />
          <div className="space-y-6 text-lg leading-8 text-muted">
            <p>
              Every week, people walk through the church doors carrying grief, fear, family
              strain, guilt, doubt, and questions they may never say aloud. The pastor carries a
              weight too: finding something faithful and meaningful to bring to them again.
            </p>
            <p className="rounded-3xl border border-line bg-cream-strong p-6 font-semibold text-ink shadow-sm">
              My Pulpit Pro helps take some of that weekly preparation weight off your shoulders,
              so more of your time can go into shaping the message only you can preach.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Focused workflow"
              title="Pastors, stop fumbling around with ChatGPT to build your sermons."
            >
              <p>
                A blank chat box can give you text. My Pulpit Pro gives you a guided
                sermon-preparation workflow from first direction to final pulpit notes.
              </p>
            </SectionHeading>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <div className="premium-card rounded-3xl border border-line bg-cream-strong p-6">
                <h3 className="text-lg font-bold text-ink">Generic ChatGPT</h3>
                <CheckList items={genericChat} />
              </div>
              <div className="premium-card premium-card-dark rounded-3xl border border-teal/20 bg-teal p-6 text-cream-strong">
                <h3 className="text-lg font-bold">My Pulpit Pro</h3>
                <CheckList items={pulpitPro} light />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading title="A dedicated sermon assistant, not another blank chat box." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="premium-card rounded-3xl border border-line bg-cream-strong p-6 shadow-sm"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-teal text-sm font-bold text-cream-strong">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.body}</p>
                {feature.note ? (
                  <p className="mt-4 rounded-2xl bg-background p-3 text-sm font-bold leading-6 text-teal">
                    {feature.note}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-teal py-20 text-cream-strong">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="How it works"
              title="From message idea to pulpit-ready notes."
              light
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(([title, body], index) => (
                <article
                  key={title}
                  className="premium-card premium-card-dark rounded-3xl border border-cream-strong/15 bg-cream-strong/8 p-6"
                >
                  <p className="text-sm font-bold text-gold">Step {index + 1}</p>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-cream/78">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 border-y border-line bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Pricing" title="Simple plans for real ministry rhythms." />
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="premium-card rounded-3xl border-2 border-teal bg-cream-strong p-7 shadow-[var(--shadow)]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Solo</p>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-serif text-5xl font-semibold text-teal">$39</p>
                  <p className="pb-2 font-bold text-muted">/month</p>
                </div>
                <p className="mt-5 text-base leading-7 text-muted">
                  For one pastor or ministry leader who wants a focused, repeatable way to
                  prepare stronger weekly messages.
                </p>
                <CheckList items={soloFeatures} />
                <ButtonLink href="/signup" className="mt-8 w-full">
                  Start My 7-Day Free Trial
                </ButtonLink>
                <p className="mt-5 rounded-2xl bg-background p-4 text-sm leading-6 text-muted">
                  Browsing ideas does not use a message project. A project only counts after the
                  user deliberately chooses an idea and creates the full message.
                </p>
              </article>

              <article className="premium-card rounded-3xl border border-line bg-cream-strong p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal">
                    Ministry Plus
                  </p>
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-teal-dark">
                    Coming Soon
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-serif text-5xl font-semibold text-ink">$49</p>
                  <p className="pb-2 font-bold text-muted">/month</p>
                </div>
                <p className="mt-5 text-base leading-7 text-muted">
                  For a pastor and one additional ministry leader who need separate accounts and
                  broader ministry tools.
                </p>
                <CheckList items={ministryFeatures} highlightFirst />
                <button
                  disabled
                  className="mt-8 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-line px-6 py-3 text-sm font-bold text-muted"
                >
                  Coming Soon
                </button>
                <p className="mt-5 rounded-2xl bg-background p-4 text-sm leading-6 text-muted">
                  Future hidden-message word scrambles will use 8 to 12 lesson-related words,
                  highlighted letters that reveal an 8-to-12-letter message, optional final phrase
                  scrambles, and a leader answer key.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Questions pastors ask before getting started." />
          <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-cream-strong">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-6">
                <summary className="cursor-pointer list-none text-lg font-bold text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-5">
                    {faq.question}
                    <span className="text-2xl text-teal transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 text-base leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-teal px-5 py-20 text-cream-strong sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Spend less of your week wrestling with the sermon.
              <span className="block text-gold">Bring more to the pulpit.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-cream/82">
              Shape fresh message directions into Scripture-centered sermon points and polished
              pulpit notes while keeping your own study, conviction, and voice at the center.
            </p>
            <ButtonLink href="/signup" variant="light" className="mt-8">
              Start My 7-Day Free Trial
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="bg-teal-dark px-5 py-10 text-cream sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-cream-strong">My Pulpit Pro</p>
            <p className="mt-2 text-sm text-cream/70">
              Copyright {year} My Pulpit Pro. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-cream/82">
            <a href="#features" className="hover:text-gold">
              Features
            </a>
            <a href="#pricing" className="hover:text-gold">
              Pricing
            </a>
            <a href="#faq" className="hover:text-gold">
              FAQ
            </a>
            <a href="/privacy" className="hover:text-gold">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gold">
              Terms
            </a>
            <a href="/signup" className="hover:text-gold">
              Sign In
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

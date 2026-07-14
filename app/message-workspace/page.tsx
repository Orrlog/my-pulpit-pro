"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import {
  LEGACY_MESSAGE_DRAFT_STORAGE_KEY,
  MESSAGE_DRAFT_STORAGE_KEY,
  buildInitialPoints,
  normalizeMessageDraft,
  type MessageDraft,
  type MessageDraftClosing,
  type MessageDraftIntroduction,
  type MessageDraftPoint,
} from "@/components/app-shell/message-draft-storage";

function updatePoint(points: MessageDraftPoint[], id: string, patch: Partial<MessageDraftPoint>) {
  return points.map((point) => (point.id === id ? { ...point, ...patch } : point));
}

function updateArrayItem(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export default function MessageWorkspacePage() {
  const [draft, setDraft] = useState<MessageDraft | null | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      const raw =
        window.localStorage.getItem(MESSAGE_DRAFT_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_MESSAGE_DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        return;
      }

      try {
        const upgraded = normalizeMessageDraft(JSON.parse(raw));
        setDraft(upgraded);
        if (upgraded) {
          window.localStorage.setItem(MESSAGE_DRAFT_STORAGE_KEY, JSON.stringify(upgraded));
        }
      } catch {
        setDraft(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!draft) return;
    window.localStorage.setItem(
      MESSAGE_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
    );
  }, [draft]);

  function patchDraft(patch: Partial<MessageDraft>) {
    setDraft((current) =>
      current ? { ...current, ...patch, updatedAt: new Date().toISOString() } : current,
    );
  }

  function patchIntroduction(patch: Partial<MessageDraftIntroduction>) {
    if (!draft) return;
    patchDraft({ introduction: { ...draft.introduction, ...patch } });
  }

  function patchClosing(patch: Partial<MessageDraftClosing>) {
    if (!draft) return;
    patchDraft({ closing: { ...draft.closing, ...patch } });
  }

  if (draft === undefined) {
    return (
      <AppShell title="Loading message workspace">
        <p className="text-muted">Loading local preview draft...</p>
      </AppShell>
    );
  }

  if (!draft) {
    return (
      <AppShell title="No local draft found">
        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <p className="text-muted">
            Create a message from the direction wizard to open a local draft in this browser.
          </p>
          <Link
            href="/new-message"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong"
          >
            Back to Directions
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="Message workspace" eyebrow="Local draft">
      <PrintPulpitNotes draft={draft} />
      <div className="grid gap-6 print:hidden">
        <section className="rounded-3xl border border-gold/40 bg-gold/10 p-5 text-sm font-semibold leading-6 text-teal">
          This is a local draft saved in this browser until AI generation, accounts, and permanent
          saving are connected.
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid gap-4">
              <TextField
                label="Message title"
                value={draft.title}
                prominent
                onChange={(value) => patchDraft({ title: value })}
              />
              <TextField
                label="Main Scripture"
                value={draft.mainScripture}
                onChange={(value) => patchDraft({ mainScripture: value })}
              />
              <TextArea
                label="Big idea"
                rows={3}
                value={draft.bigIdea}
                onChange={(value) => patchDraft({ bigIdea: value })}
              />
            </div>
            <aside className="rounded-3xl border border-line bg-background p-5">
              <h2 className="font-serif text-2xl font-semibold text-teal">Draft summary</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <SummaryItem label="Length" value={draft.lengthLabel} />
                <SummaryItem label="Translation" value={draft.translation} />
                <SummaryItem label="Mode" value={draft.messageModeLabel} />
                <SummaryItem label="Starting path" value={draft.startingPathLabel} />
                {draft.developIdea ? <SummaryItem label="Develop idea" value={draft.developIdea} /> : null}
                {draft.developPassage ? <SummaryItem label="Optional passage" value={draft.developPassage} /> : null}
                {draft.desiredResponse ? <SummaryItem label="Desired response" value={draft.desiredResponse} /> : null}
                {draft.weeklyConcern ? <SummaryItem label="Weekly concern" value={draft.weeklyConcern} /> : null}
              </dl>
            </aside>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-teal">Scripture Bank</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                References only. Exact Bible text will be connected later from licensed or
                public-domain sources.
              </p>
            </div>
            <button
              type="button"
              onClick={() => patchDraft({ scriptureBank: [...draft.scriptureBank, ""] })}
              className="min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
            >
              Add Scripture
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {draft.scriptureBank.map((reference, index) => (
              <div key={`${reference}-${index}`} className="flex gap-2">
                <input
                  aria-label={`Supporting Scripture ${index + 1}`}
                  value={reference}
                  onChange={(event) =>
                    patchDraft({ scriptureBank: updateArrayItem(draft.scriptureBank, index, event.target.value) })
                  }
                  className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-background px-4 text-ink"
                />
                <button
                  type="button"
                  onClick={() =>
                    patchDraft({ scriptureBank: draft.scriptureBank.filter((_, itemIndex) => itemIndex !== index) })
                  }
                  className="rounded-full border border-line px-4 py-2 text-sm font-bold text-teal"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="font-serif text-3xl font-semibold text-teal">Introduction</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextArea label="Opening hook" value={draft.introduction.hook} onChange={(value) => patchIntroduction({ hook: value })} />
            <TextArea label="Pastoral tension or real-life problem" value={draft.introduction.pastoralTension} onChange={(value) => patchIntroduction({ pastoralTension: value })} />
            <TextArea label="Connection to the main passage" value={draft.introduction.passageConnection} onChange={(value) => patchIntroduction({ passageConnection: value })} />
            <TextArea label="Central big idea" value={draft.introduction.bigIdeaBridge} onChange={(value) => patchIntroduction({ bigIdeaBridge: value })} />
            <TextArea label="Transition into the first movement" value={draft.introduction.firstMovementTransition} onChange={(value) => patchIntroduction({ firstMovementTransition: value })} />
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-teal">Message movements</h2>
              <p className="mt-2 text-sm text-muted">
                Keep, rewrite, trash, or add connected movements for the pastor to edit and trim.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                patchDraft({
                  points: [
                    ...draft.points,
                    buildInitialPoints({
                      length: "30",
                      directionTitle: draft.directionTitle,
                      mainScripture: draft.mainScripture,
                      bigIdea: draft.bigIdea,
                      angle: draft.angle,
                      pastoralFocus: draft.pastoralFocus,
                      scriptureBank: draft.scriptureBank,
                    })[0],
                  ],
                })
              }
              className="min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
            >
              Add Another Point
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            {draft.points.map((point, index) => (
              <article key={point.id} className="rounded-3xl border border-line bg-background p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-teal">
                    Movement {index + 1}
                    {point.status ? ` · ${point.status}` : ""}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton onClick={() => patchDraft({ points: updatePoint(draft.points, point.id, { status: "kept" }) })}>Keep</ActionButton>
                    <ActionButton
                      filled
                      onClick={() =>
                        patchDraft({
                          points: updatePoint(draft.points, point.id, {
                            status: "rewritten",
                            title: `A clearer faithful step for ${draft.directionTitle}`,
                            bullets: [
                              `Return to ${draft.mainScripture} as the anchor for this movement.`,
                              `Clarify how ${draft.bigIdea} addresses the congregation's lived tension.`,
                              `Name one concrete response shaped by ${draft.pastoralFocus}.`,
                            ],
                            explanation: `This local rewrite keeps the same sermon thread while sharpening the movement around ${draft.bigIdea} and the pastoral focus of ${draft.pastoralFocus}.`,
                            application: `Invite listeners to identify one place where this truth should change a conversation, decision, prayer, or act of obedience this week.`,
                          }),
                        })
                      }
                    >
                      Rewrite
                    </ActionButton>
                    <ActionButton onClick={() => patchDraft({ points: draft.points.filter((item) => item.id !== point.id) })}>Trash</ActionButton>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TextField label="Movement title" value={point.title} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { title: value }) })} />
                  <TextField label="Supporting Scripture reference" value={point.scripture} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { scripture: value }) })} />
                  <BulletEditor
                    bullets={point.bullets}
                    onChange={(bullets) => patchDraft({ points: updatePoint(draft.points, point.id, { bullets }) })}
                  />
                  <TextArea label="Fuller explanation" value={point.explanation} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { explanation: value }) })} />
                  <TextArea label="Practical application" value={point.application} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { application: value }) })} />
                  <TextArea label="Illustration, story, or pastoral connection prompt" value={point.illustration} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { illustration: value }) })} />
                  <TextArea label="Transition thought" value={point.transition} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { transition: value }) })} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="font-serif text-3xl font-semibold text-teal">Ending</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextArea label="Concise message recap" value={draft.closing.recap} onChange={(value) => patchClosing({ recap: value })} />
            <TextArea label="Call to response" value={draft.closing.callToResponse} onChange={(value) => patchClosing({ callToResponse: value })} />
            <TextArea label="Closing application" value={draft.closing.closingApplication} onChange={(value) => patchClosing({ closingApplication: value })} />
            <TextArea label="Prayer direction or closing prayer" value={draft.closing.prayer} onChange={(value) => patchClosing({ prayer: value })} />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/new-message"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-2 text-sm font-bold text-teal"
          >
            Back to Directions
          </Link>
          <div className="grid gap-2 sm:justify-items-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong"
            >
              Print Preview
            </button>
            <p className="max-w-md text-xs leading-5 text-muted">
              To remove the browser date, page URL, and page title, turn off “Headers and footers”
              in your browser’s print settings.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-ink">{label}</dt>
      <dd className="break-words text-muted">{value}</dd>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  prominent = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prominent?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-12 rounded-2xl border border-line bg-background px-4 text-ink ${prominent ? "text-lg font-bold" : ""}`}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-line bg-background p-4 text-ink"
      />
    </label>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (bullets: string[]) => void }) {
  return (
    <div className="grid gap-2 text-sm font-bold text-ink">
      Talking-point bullets
      <div className="grid gap-2">
        {bullets.map((bullet, index) => (
          <div key={`${index}-${bullet}`} className="flex gap-2">
            <input
              aria-label={`Talking point ${index + 1}`}
              value={bullet}
              onChange={(event) => onChange(updateArrayItem(bullets, index, event.target.value))}
              className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-background px-4 text-ink"
            />
            <button
              type="button"
              onClick={() => onChange(bullets.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-full border border-line px-4 py-2 text-sm font-bold text-teal"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...bullets, ""])}
        className="min-h-10 w-fit rounded-full bg-cream px-4 py-2 text-sm font-bold text-teal"
      >
        Add Bullet
      </button>
    </div>
  );
}

function ActionButton({ children, onClick, filled = false }: { children: ReactNode; onClick: () => void; filled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-bold ${
        filled ? "bg-teal text-cream-strong" : "border border-line text-teal"
      }`}
    >
      {children}
    </button>
  );
}

function PrintPulpitNotes({ draft }: { draft: MessageDraft }) {
  return (
    <article className="hidden print:block print:p-0 print:text-[11pt] print:leading-snug print:text-black">
      <header className="border-b border-black/30 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">My Pulpit Pro</p>
        <h1 className="mt-2 text-2xl font-bold">{draft.title}</h1>
        <p className="mt-1 font-semibold">Main passage: {draft.mainScripture}</p>
        <p className="mt-1">Big idea: {draft.bigIdea}</p>
        <p className="mt-1 text-sm">{draft.lengthLabel} · {draft.translation}</p>
      </header>

      <section className="mt-4 break-inside-avoid">
        <h2 className="text-base font-bold">Scripture Bank</h2>
        <ul className="mt-1 grid list-disc grid-cols-2 gap-x-8 gap-y-1 pl-5">
          {draft.scriptureBank.map((reference, index) => (
            <li key={`${reference}-${index}`}>{reference}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4 break-inside-avoid">
        <h2 className="text-base font-bold">Introduction</h2>
        <PrintLine label="Hook" value={draft.introduction.hook} />
        <PrintLine label="Pastoral tension" value={draft.introduction.pastoralTension} />
        <PrintLine label="Passage connection" value={draft.introduction.passageConnection} />
        <PrintLine label="Big idea" value={draft.introduction.bigIdeaBridge} />
        <PrintLine label="Transition" value={draft.introduction.firstMovementTransition} />
      </section>

      <section className="mt-4">
        <h2 className="text-base font-bold">Message Movements</h2>
        <div className="mt-2 grid gap-3">
          {draft.points.map((point, index) => (
            <section key={point.id} className="break-inside-avoid border-t border-black/20 pt-2">
              <h3 className="font-bold">{index + 1}. {point.title}</h3>
              <p className="text-sm font-semibold">Supporting Scripture: {point.scripture}</p>
              <ul className="mt-1 list-disc pl-5">
                {point.bullets.map((bullet, bulletIndex) => (
                  <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
              <PrintLine label="Explanation" value={point.explanation} />
              <PrintLine label="Application" value={point.application} />
              <PrintLine label="Illustration / example" value={point.illustration} />
              {point.transition ? <PrintLine label="Transition" value={point.transition} /> : null}
              <div className="mt-2 h-8 border-t border-dotted border-black/30" aria-hidden="true" />
            </section>
          ))}
        </div>
      </section>

      <section className="mt-4 break-inside-avoid border-t border-black/30 pt-3">
        <h2 className="text-base font-bold">Ending</h2>
        <PrintLine label="Recap" value={draft.closing.recap} />
        <PrintLine label="Call to response" value={draft.closing.callToResponse} />
        <PrintLine label="Closing application" value={draft.closing.closingApplication} />
        <PrintLine label="Closing prayer" value={draft.closing.prayer} />
        <div className="mt-3 h-10 border-t border-dotted border-black/30" aria-hidden="true" />
      </section>
    </article>
  );
}

function PrintLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-1">
      <strong>{label}:</strong> {value}
    </p>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import {
  LEGACY_MESSAGE_DRAFT_STORAGE_KEY,
  MESSAGE_DRAFT_STORAGE_KEY,
  MISSING_VERSE_TEXT,
  PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY,
  buildInitialPoints,
  getVerseText,
  normalizeMessageDraft,
  type MessageDraft,
  type MessageDraftClosing,
  type MessageDraftIntroduction,
  type MessageDraftPoint,
  type ScriptureBankItem,
} from "@/components/app-shell/message-draft-storage";

type PrintMode = "pulpit" | "full" | null;

function updatePoint(points: MessageDraftPoint[], id: string, patch: Partial<MessageDraftPoint>) {
  return points.map((point) => (point.id === id ? { ...point, ...patch } : point));
}

function updateArrayItem(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function updateScriptureItem(
  items: ScriptureBankItem[],
  id: string,
  patch: Partial<ScriptureBankItem>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export default function MessageWorkspacePage() {
  const [draft, setDraft] = useState<MessageDraft | null | undefined>(undefined);
  const [expandedMovementId, setExpandedMovementId] = useState<string | null>(null);
  const [expandedScriptureIds, setExpandedScriptureIds] = useState<string[]>([]);
  const [mainPassageOpen, setMainPassageOpen] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw =
        window.localStorage.getItem(MESSAGE_DRAFT_STORAGE_KEY) ??
        window.localStorage.getItem(PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_MESSAGE_DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        return;
      }

      try {
        const upgraded = normalizeMessageDraft(JSON.parse(raw));
        setDraft(upgraded);
        setExpandedMovementId(upgraded?.points[0]?.id ?? null);
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

  function print(mode: Exclude<PrintMode, null>) {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 50);
  }

  if (draft === undefined) {
    return (
      <AppShell title="Loading message workspace">
        <p className="text-muted">Loading local draft...</p>
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
      <PrintPulpitNotes draft={draft} active={printMode === "pulpit"} />
      <PrintFullPreparationNotes draft={draft} active={printMode === "full"} />

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
                onChange={(value) =>
                  patchDraft({ mainScripture: value, mainScriptureText: getVerseText(value) })
                }
              />
              <div className="rounded-2xl border border-line bg-background p-4">
                <button
                  type="button"
                  onClick={() => setMainPassageOpen((current) => !current)}
                  className="text-sm font-bold text-teal"
                >
                  {mainPassageOpen ? "Hide main passage text" : "Show main passage text"}
                </button>
                {mainPassageOpen ? (
                  <TextArea
                    label="Main passage KJV text"
                    value={draft.mainScriptureText}
                    onChange={(value) => patchDraft({ mainScriptureText: value })}
                  />
                ) : null}
              </div>
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
                KJV text is included locally when available. Missing text is labeled honestly.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                patchDraft({
                  scriptureBank: [
                    ...draft.scriptureBank,
                    {
                      id: `scripture-${Date.now()}`,
                      reference: "",
                      text: MISSING_VERSE_TEXT,
                    },
                  ],
                })
              }
              className="min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
            >
              Add Scripture
            </button>
          </div>
          <div className="mt-5 grid gap-3">
            {draft.scriptureBank.map((item) => {
              const open = expandedScriptureIds.includes(item.id);
              return (
                <article key={item.id} className="rounded-2xl border border-line bg-background p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      aria-label="Supporting Scripture reference"
                      value={item.reference}
                      onChange={(event) => {
                        const reference = event.target.value;
                        patchDraft({
                          scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, {
                            reference,
                            text: getVerseText(reference),
                          }),
                        });
                      }}
                      className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-cream-strong px-4 font-bold text-teal"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedScriptureIds((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                        className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-cream-strong"
                      >
                        {open ? "Hide Verse" : "Show Verse"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchDraft({
                            scriptureBank: draft.scriptureBank.filter((scripture) => scripture.id !== item.id),
                          })
                        }
                        className="rounded-full border border-line px-4 py-2 text-sm font-bold text-teal"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {open ? (
                    <TextArea
                      label="KJV verse text"
                      value={item.text}
                      onChange={(value) =>
                        patchDraft({
                          scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { text: value }),
                        })
                      }
                    />
                  ) : null}
                </article>
              );
            })}
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
          <div>
            <h2 className="font-serif text-3xl font-semibold text-teal">Message movements</h2>
            <p className="mt-2 text-sm text-muted">
              Expand one movement at a time to edit substantial notes without turning the workspace
              into a wall of forms.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {draft.points.map((point, index) => {
              const expanded = expandedMovementId === point.id;
              return (
                <article
                  key={point.id}
                  className={`rounded-3xl border p-5 ${
                    expanded ? "border-gold bg-background" : "border-line bg-background/80"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        Movement {index + 1}{point.status ? ` · ${point.status}` : ""}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-semibold text-teal">{point.title}</h3>
                      <p className="mt-1 text-sm font-bold text-ink">{point.scripture}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{point.summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedMovementId(expanded ? null : point.id)}
                      className="min-h-11 shrink-0 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong"
                    >
                      {expanded ? "Collapse" : "Expand/Edit"}
                    </button>
                  </div>

                  {expanded ? (
                    <div className="mt-5 border-t border-line pt-5">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <ActionButton onClick={() => patchDraft({ points: updatePoint(draft.points, point.id, { status: "kept" }) })}>Keep</ActionButton>
                        <ActionButton
                          filled
                          onClick={() =>
                            patchDraft({
                              points: updatePoint(draft.points, point.id, {
                                status: "rewritten",
                                title: `Faithful response: ${draft.directionTitle}`,
                                summary: "A focused local rewrite that keeps the sermon moving toward a concrete response.",
                                bullets: [
                                  `Hold ${draft.mainScripture} beside ${point.scripture} so the anchor passage stays central.`,
                                  `Clarify the heart issue that makes this response difficult for ordinary listeners.`,
                                  `Name one practice the church can begin before the week is over.`,
                                ],
                                explanation: `This local rewrite sharpens the movement around ${draft.bigIdea} and asks how the selected Scripture steadies the congregation at this point in the message.`,
                                application: `Invite listeners to choose one visible response: a prayer to pray, a conversation to repair, a burden to release, or an act of service to begin.`,
                                illustration: `Use a brief pastoral example of someone obeying quietly when no one applauds, forgiving when resentment would be easier, or praying before reacting.`,
                              }),
                            })
                          }
                        >
                          Rewrite
                        </ActionButton>
                        <ActionButton onClick={() => patchDraft({ points: draft.points.filter((item) => item.id !== point.id) })}>Trash</ActionButton>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField label="Movement title" value={point.title} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { title: value }) })} />
                        <TextField label="One-line summary" value={point.summary} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { summary: value }) })} />
                        <TextField
                          label="Supporting Scripture reference"
                          value={point.scripture}
                          onChange={(value) =>
                            patchDraft({
                              points: updatePoint(draft.points, point.id, {
                                scripture: value,
                                scriptureText: getVerseText(value),
                              }),
                            })
                          }
                        />
                        <TextArea label="KJV verse text" value={point.scriptureText} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { scriptureText: value }) })} />
                        <BulletEditor bullets={point.bullets} onChange={(bullets) => patchDraft({ points: updatePoint(draft.points, point.id, { bullets }) })} />
                        <TextArea label="Fuller explanation" value={point.explanation} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { explanation: value }) })} />
                        <TextArea label="Practical application" value={point.application} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { application: value }) })} />
                        <TextArea label="Illustration, story, or pastoral connection prompt" value={point.illustration} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { illustration: value }) })} />
                        <TextArea label="Transition thought" value={point.transition} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { transition: value }) })} />
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = buildInitialPoints({
                length: "30",
                directionTitle: draft.directionTitle,
                mainScripture: draft.mainScripture,
                bigIdea: draft.bigIdea,
                angle: draft.angle,
                pastoralFocus: draft.pastoralFocus,
                scriptureBank: draft.scriptureBank,
              })[0];
              patchDraft({ points: [...draft.points, { ...next, id: `movement-${Date.now()}` }] });
            }}
            className="mt-5 min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
          >
            Add Another Point
          </button>
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => print("pulpit")}
                className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong"
              >
                Print Pulpit Notes
              </button>
              <button
                type="button"
                onClick={() => print("full")}
                className="min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
              >
                Print Full Preparation Notes
              </button>
            </div>
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
    <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
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

function PrintPulpitNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} />
      <section className="mt-3 break-inside-avoid">
        <h2 className="text-sm font-bold">Introduction</h2>
        <p>{draft.introduction.hook}</p>
      </section>
      <section className="mt-3">
        <h2 className="text-sm font-bold">Pulpit Outline</h2>
        <div className="mt-1 grid gap-2">
          {draft.points.map((point, index) => (
            <section key={point.id} className="break-inside-avoid border-t border-black/20 pt-2">
              <h3 className="font-bold">{index + 1}. {point.title}</h3>
              <p className="text-xs font-semibold">{point.scripture}</p>
              <p className="text-xs">{point.scriptureText}</p>
              <ul className="mt-1 list-disc pl-5">
                {point.bullets.slice(0, 2).map((bullet, bulletIndex) => (
                  <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
              <PrintLine label="Application" value={point.application} />
              <PrintLine label="Transition" value={point.transition} />
              <div className="mt-1 h-5 border-t border-dotted border-black/30" aria-hidden="true" />
            </section>
          ))}
        </div>
      </section>
      <section className="mt-3 break-inside-avoid border-t border-black/30 pt-2">
        <PrintLine label="Recap" value={draft.closing.recap} />
        <PrintLine label="Response" value={draft.closing.callToResponse} />
        <PrintLine label="Closing prayer" value={draft.closing.prayer} />
        <div className="mt-2 h-8 border-t border-dotted border-black/30" aria-hidden="true" />
      </section>
    </article>
  );
}

function PrintFullPreparationNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} />
      <section className="mt-4 break-inside-avoid">
        <h2 className="text-base font-bold">Scripture Bank</h2>
        <div className="mt-1 grid gap-2">
          {draft.scriptureBank.map((item) => (
            <p key={item.id}><strong>{item.reference}:</strong> {item.text}</p>
          ))}
        </div>
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
              <p className="text-sm font-semibold">{point.scripture}</p>
              <p className="text-sm">{point.scriptureText}</p>
              <ul className="mt-1 list-disc pl-5">
                {point.bullets.map((bullet, bulletIndex) => (
                  <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
              <PrintLine label="Explanation" value={point.explanation} />
              <PrintLine label="Application" value={point.application} />
              <PrintLine label="Illustration / example" value={point.illustration} />
              <PrintLine label="Transition" value={point.transition} />
              <div className="mt-2 h-7 border-t border-dotted border-black/30" aria-hidden="true" />
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
        <div className="mt-3 h-8 border-t border-dotted border-black/30" aria-hidden="true" />
      </section>
    </article>
  );
}

function PrintHeader({ draft }: { draft: MessageDraft }) {
  return (
    <header className="border-b border-black/30 pb-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em]">My Pulpit Pro</p>
      <h1 className="mt-2 text-2xl font-bold">{draft.title}</h1>
      <p className="mt-1 font-semibold">Main passage: {draft.mainScripture}</p>
      <p className="text-sm">{draft.mainScriptureText}</p>
      <p className="mt-1">Big idea: {draft.bigIdea}</p>
      <p className="mt-1 text-sm">{draft.lengthLabel} · {draft.translation}</p>
    </header>
  );
}

function PrintLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-1">
      <strong>{label}:</strong> {value}
    </p>
  );
}

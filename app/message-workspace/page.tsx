"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
                      supportNote: "Explain how this reference supports the main passage.",
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
                    <textarea
                      aria-label="Supporting Scripture reference"
                      rows={1}
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
                      className="min-h-11 min-w-0 flex-1 resize-none overflow-hidden rounded-2xl border border-line bg-cream-strong px-4 py-3 font-bold text-teal"
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
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <TextArea
                        label="KJV verse text"
                        value={item.text}
                        onChange={(value) =>
                          patchDraft({
                            scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { text: value }),
                          })
                        }
                      />
                      <TextArea
                        label="Why this supports the message"
                        value={item.supportNote}
                        onChange={(value) =>
                          patchDraft({
                            scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { supportNote: value }),
                          })
                        }
                      />
                      {item.fullContext ? (
                        <RemovableTextArea
                          label="See full context"
                          value={item.fullContext}
                          onChange={(value) =>
                            patchDraft({
                              scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { fullContext: value }),
                            })
                          }
                          onRemove={() =>
                            patchDraft({
                              scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { fullContext: undefined }),
                            })
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            patchDraft({
                              scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, {
                                fullContext: `See the full context: ${draft.mainScripture}.`,
                              }),
                            })
                          }
                          className="min-h-10 w-fit rounded-full bg-cream px-4 py-2 text-sm font-bold text-teal"
                        >
                          Add full-context note
                        </button>
                      )}
                    </div>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-teal">Passage context</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Concise notes that help keep the sermon anchored to the main passage.</p>
            </div>
            <button
              type="button"
              onClick={() => patchDraft({ contextNotes: [...draft.contextNotes, ""] })}
              className="min-h-10 rounded-full bg-gold px-4 py-2 text-sm font-bold text-teal-dark"
            >
              Add Context Note
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {draft.contextNotes.map((note, index) => (
              <RemovableTextArea
                key={`${index}-${note}`}
                label={`Context note ${index + 1}`}
                value={note}
                onChange={(value) => patchDraft({ contextNotes: updateArrayItem(draft.contextNotes, index, value) })}
                onRemove={() => patchDraft({ contextNotes: draft.contextNotes.filter((_, itemIndex) => itemIndex !== index) })}
              />
            ))}
          </div>
        </section>

        {draft.pastoralCareNote ? (
          <section className="rounded-3xl border border-line bg-cream-strong p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-teal">Pastoral care note</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Optional ministry-aware caution for sensitive subjects.</p>
              </div>
              <button
                type="button"
                onClick={() => patchDraft({ pastoralCareNote: undefined })}
                className="min-h-10 rounded-full border border-line px-4 py-2 text-sm font-bold text-teal"
              >
                Remove
              </button>
            </div>
            <TextArea
              label="Care note"
              value={draft.pastoralCareNote.text}
              onChange={(value) => patchDraft({ pastoralCareNote: { ...draft.pastoralCareNote!, text: value } })}
            />
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted">
              <input
                type="checkbox"
                checked={draft.pastoralCareNote.includeInPulpit}
                onChange={(event) => patchDraft({ pastoralCareNote: { ...draft.pastoralCareNote!, includeInPulpit: event.target.checked } })}
              />
              Include this note in Pulpit Notes
            </label>
          </section>
        ) : null}

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
                                explanation: `The passage brings ${draft.bigIdea} into a real moment where worry, weariness, fear, or delay needs a faithful response.`,
                                application: `Choose one visible response: a prayer to pray, a conversation to repair, a burden to release, or an act of service to begin.`,
                                illustrationOptions: [
                                  "Someone obeys quietly when no one applauds.",
                                  "A person forgives when resentment would be easier.",
                                  "A believer pauses to pray before reacting.",
                                ],
                              }),
                            })
                          }
                        >
                          Rewrite
                        </ActionButton>
                        <ActionButton onClick={() => draft.points.length > 1 ? patchDraft({ points: draft.points.filter((item) => item.id !== point.id) }) : undefined}>Remove</ActionButton>
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
                        <IllustrationOptionsEditor options={point.illustrationOptions} onChange={(illustrationOptions) => patchDraft({ points: updatePoint(draft.points, point.id, { illustrationOptions }) })} />
                        {point.transition ? (
                          <RemovableTextArea label="Transition thought" value={point.transition} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { transition: value }) })} onRemove={() => patchDraft({ points: updatePoint(draft.points, point.id, { transition: "" }) })} />
                        ) : (
                          <button type="button" onClick={() => patchDraft({ points: updatePoint(draft.points, point.id, { transition: "Transition clearly into the next truth from the passage." }) })} className="min-h-10 w-fit rounded-full bg-cream px-4 py-2 text-sm font-bold text-teal">Add transition</button>
                        )}
                        {point.optionalResponseMoment ? (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                              <input type="checkbox" checked={Boolean(point.includeOptionalResponse)} onChange={(event) => patchDraft({ points: updatePoint(draft.points, point.id, { includeOptionalResponse: event.target.checked }) })} />
                              Keep optional response moment
                            </label>
                            <RemovableTextArea label="Optional response moment" value={point.optionalResponseMoment} onChange={(value) => patchDraft({ points: updatePoint(draft.points, point.id, { optionalResponseMoment: value }) })} onRemove={() => patchDraft({ points: updatePoint(draft.points, point.id, { optionalResponseMoment: undefined, includeOptionalResponse: false }) })} />
                          </div>
                        ) : (
                          <button type="button" onClick={() => patchDraft({ points: updatePoint(draft.points, point.id, { optionalResponseMoment: "Optional response moment: leave a short silence for prayer before moving on.", includeOptionalResponse: false }) })} className="min-h-10 w-fit rounded-full bg-cream px-4 py-2 text-sm font-bold text-teal">Add optional response moment</button>
                        )}
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
    <AutoTextArea
      label={label}
      rows={prominent ? 2 : 1}
      value={value}
      onChange={onChange}
      className={prominent ? "text-lg font-bold" : ""}
    />
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
  return <AutoTextArea label={label} rows={rows} value={value} onChange={onChange} />;
}

function AutoTextArea({
  label,
  value,
  onChange,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
      {label}
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-w-0 resize-none overflow-hidden rounded-2xl border border-line bg-background p-4 text-ink ${className}`}
      />
    </label>
  );
}

function RemovableTextArea({
  label,
  value,
  onChange,
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">{label}</p>
        <button type="button" onClick={onRemove} className="rounded-full border border-line px-3 py-1 text-xs font-bold text-teal">
          Remove
        </button>
      </div>
      <AutoTextArea label="" value={value} onChange={onChange} rows={3} />
    </div>
  );
}

function IllustrationOptionsEditor({ options, onChange }: { options: string[]; onChange: (options: string[]) => void }) {
  return (
    <div className="grid gap-2 text-sm font-bold text-ink">
      Illustration or real-life connection options
      <div className="grid gap-2">
        {options.map((option, index) => (
          <RemovableTextArea
            key={`${index}-${option}`}
            label={`Option ${index + 1}`}
            value={option}
            onChange={(value) => onChange(updateArrayItem(options, index, value))}
            onRemove={() => onChange(options.filter((_, itemIndex) => itemIndex !== index))}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...options, "Add a concrete, respectful example that fits this movement."])}
        className="min-h-10 w-fit rounded-full bg-cream px-4 py-2 text-sm font-bold text-teal"
      >
        Add Illustration Option
      </button>
    </div>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (bullets: string[]) => void }) {
  return (
    <div className="grid gap-2 text-sm font-bold text-ink">
      Talking-point bullets
      <div className="grid gap-2">
        {bullets.map((bullet, index) => (
          <RemovableTextArea
            key={`${index}-${bullet}`}
            label={`Talking point ${index + 1}`}
            value={bullet}
            onChange={(value) => onChange(updateArrayItem(bullets, index, value))}
            onRemove={() => onChange(bullets.filter((_, itemIndex) => itemIndex !== index))}
          />
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
      {draft.contextNotes.length ? (
        <section className="mt-3 break-inside-avoid">
          <h2 className="text-sm font-bold">Passage Context</h2>
          {draft.contextNotes.filter(Boolean).slice(0, 2).map((note, index) => <p key={index}>{note}</p>)}
        </section>
      ) : null}
      {draft.pastoralCareNote?.includeInPulpit ? <PrintLine label="Pastoral care note" value={draft.pastoralCareNote.text} /> : null}
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
              {point.includeOptionalResponse && point.optionalResponseMoment ? <PrintLine label="Optional response moment" value={point.optionalResponseMoment} /> : null}
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
      {draft.contextNotes.length ? (
        <section className="mt-4 break-inside-avoid">
          <h2 className="text-base font-bold">Passage Context</h2>
          {draft.contextNotes.filter(Boolean).map((note, index) => <p key={index}>{note}</p>)}
        </section>
      ) : null}
      {draft.pastoralCareNote ? <PrintLine label="Pastoral care note" value={draft.pastoralCareNote.text} /> : null}
      <section className="mt-4 break-inside-avoid">
        <h2 className="text-base font-bold">Scripture Bank</h2>
        <div className="mt-1 grid gap-2">
          {draft.scriptureBank.map((item) => (
            <div key={item.id} className="break-inside-avoid"><p><strong>{item.reference}:</strong> {item.text}</p>{item.supportNote ? <p><strong>Supports:</strong> {item.supportNote}</p> : null}{item.fullContext ? <p><strong>Context:</strong> {item.fullContext}</p> : null}</div>
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
              {point.illustrationOptions.length ? <PrintLine label="Illustration options" value={point.illustrationOptions.join(" | ")} /> : null}
              {point.includeOptionalResponse && point.optionalResponseMoment ? <PrintLine label="Optional response moment" value={point.optionalResponseMoment} /> : null}
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

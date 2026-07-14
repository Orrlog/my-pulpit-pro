"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import {
  MESSAGE_DRAFT_STORAGE_KEY,
  type MessageDraft,
  type MessageDraftPoint,
} from "@/components/app-shell/message-draft-storage";

function updatePoint(points: MessageDraftPoint[], id: string, patch: Partial<MessageDraftPoint>) {
  return points.map((point) => (point.id === id ? { ...point, ...patch } : point));
}

export default function MessageWorkspacePage() {
  const [draft, setDraft] = useState<MessageDraft | null | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = window.localStorage.getItem(MESSAGE_DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        return;
      }

      try {
        setDraft(JSON.parse(raw) as MessageDraft);
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
            Create a message from the direction wizard to open a local preview draft.
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
    <AppShell title="Message workspace" eyebrow="Local preview draft">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-gold/40 bg-gold/10 p-5 text-sm font-semibold leading-6 text-teal">
          This is a local preview draft saved in this browser until AI generation, accounts, and
          permanent saving are connected.
        </section>

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Message title
                <input
                  value={draft.title}
                  onChange={(event) => patchDraft({ title: event.target.value })}
                  className="min-h-12 rounded-2xl border border-line bg-background px-4 text-lg font-bold text-ink"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Main Scripture
                <input
                  value={draft.mainScripture}
                  onChange={(event) => patchDraft({ mainScripture: event.target.value })}
                  className="min-h-12 rounded-2xl border border-line bg-background px-4 text-ink"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Big idea
                <textarea
                  rows={3}
                  value={draft.bigIdea}
                  onChange={(event) => patchDraft({ bigIdea: event.target.value })}
                  className="rounded-2xl border border-line bg-background p-4 text-ink"
                />
              </label>
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

        <EditableSection
          label="Introduction"
          value={draft.introduction}
          onChange={(value) => patchDraft({ introduction: value })}
        />

        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-teal">Sermon-point cards</h2>
              <p className="mt-2 text-sm text-muted">
                Keep, rewrite, trash, or add local preview points. Rewrite only reshapes placeholder
                text locally.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                patchDraft({
                  points: [
                    ...draft.points,
                    {
                      id: `${Date.now()}`,
                      title: `Additional point for ${draft.directionTitle}`,
                      mainVerse: draft.mainScripture,
                      explanation: `Develop another angle from ${draft.bigIdea}`,
                      application: `Add a practical response connected to ${draft.pastoralFocus}.`,
                    },
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
                    Point {index + 1}
                    {point.status ? ` · ${point.status}` : ""}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        patchDraft({ points: updatePoint(draft.points, point.id, { status: "kept" }) })
                      }
                      className="rounded-full border border-line px-4 py-2 text-sm font-bold text-teal"
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        patchDraft({
                          points: updatePoint(draft.points, point.id, {
                            status: "rewritten",
                            explanation: `Local rewrite preview: ${draft.bigIdea} This point can be reshaped around ${draft.pastoralFocus.toLowerCase()} without calling AI yet.`,
                            application: `Local rewrite preview: invite one faithful step from ${draft.mainScripture}.`,
                          }),
                        })
                      }
                      className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-cream-strong"
                    >
                      Rewrite
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        patchDraft({ points: draft.points.filter((item) => item.id !== point.id) })
                      }
                      className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink"
                    >
                      Trash
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Point title"
                    value={point.title}
                    onChange={(value) =>
                      patchDraft({ points: updatePoint(draft.points, point.id, { title: value }) })
                    }
                  />
                  <TextField
                    label="Main verse"
                    value={point.mainVerse}
                    onChange={(value) =>
                      patchDraft({ points: updatePoint(draft.points, point.id, { mainVerse: value }) })
                    }
                  />
                  <TextArea
                    label="Short explanation"
                    value={point.explanation}
                    onChange={(value) =>
                      patchDraft({ points: updatePoint(draft.points, point.id, { explanation: value }) })
                    }
                  />
                  <TextArea
                    label="Application idea"
                    value={point.application}
                    onChange={(value) =>
                      patchDraft({ points: updatePoint(draft.points, point.id, { application: value }) })
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <EditableSection
          label="Application section"
          value={draft.application}
          onChange={(value) => patchDraft({ application: value })}
        />
        <EditableSection
          label="Closing prayer"
          value={draft.closingPrayer}
          onChange={(value) => patchDraft({ closingPrayer: value })}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between print:hidden">
          <Link
            href="/new-message"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-2 text-sm font-bold text-teal"
          >
            Back to Directions
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong"
          >
            Print Preview
          </button>
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

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-2xl border border-line bg-cream-strong px-4 text-ink"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-line bg-cream-strong p-4 text-ink"
      />
    </label>
  );
}

function EditableSection({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-3xl border border-line bg-cream-strong p-6">
      <h2 className="font-serif text-3xl font-semibold text-teal">{label}</h2>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-line bg-background p-4 text-ink"
      />
    </section>
  );
}

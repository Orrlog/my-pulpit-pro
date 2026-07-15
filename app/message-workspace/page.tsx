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
import {
  ensureProjectLibrary,
  getActiveProjectId,
  getProject,
  markProjectSaved,
  persistCompatibilityDraft,
  setActiveProjectId,
  updateProjectDraft,
  type MessageProjectStatus,
} from "@/components/app-shell/message-project-library";

type PrintMode = "pulpit" | "full" | null;
type DetailPanel = { kind: "message" } | { kind: "introduction" } | { kind: "point"; id: string } | { kind: "closing" } | null;

function updatePoint(points: MessageDraftPoint[], id: string, patch: Partial<MessageDraftPoint>) {
  return points.map((point) => (point.id === id ? { ...point, ...patch } : point));
}

function updateArrayItem(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function updateScriptureItem(items: ScriptureBankItem[], id: string, patch: Partial<ScriptureBankItem>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export default function MessageWorkspacePage() {
  const [draft, setDraft] = useState<MessageDraft | null | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<MessageProjectStatus>("Draft");
  const [saveMessage, setSaveMessage] = useState("");
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const draftRef = useRef<MessageDraft | null>(null);
  const projectIdRef = useRef<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const projects = ensureProjectLibrary();
      const requestedProjectId = new URLSearchParams(window.location.search).get("project");
      const fallbackProjectId = requestedProjectId ?? getActiveProjectId() ?? projects[0]?.id ?? null;
      const project = fallbackProjectId ? getProject(fallbackProjectId) : null;

      if (project) {
        setDraft(project.draft);
        setProjectId(project.id);
        setProjectStatus(project.status);
        setActiveProjectId(project.id);
        persistCompatibilityDraft(project.draft);
        return;
      }

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
        if (upgraded) persistCompatibilityDraft(upgraded);
      } catch {
        setDraft(null);
      }
    });
  }, []);

  useEffect(() => {
    draftRef.current = draft ?? null;
  }, [draft]);

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  function persistDraft(next: MessageDraft) {
    const activeProjectId = projectIdRef.current;
    const persisted = { ...next, id: activeProjectId ?? next.id, updatedAt: new Date().toISOString() };
    draftRef.current = persisted;
    persistCompatibilityDraft(persisted);
    if (activeProjectId) {
      updateProjectDraft(activeProjectId, persisted);
      setActiveProjectId(activeProjectId);
    }
    return persisted;
  }

  function updateDraft(updater: (current: MessageDraft) => MessageDraft) {
    setDraft((current) => {
      if (!current) return current;
      return persistDraft(updater(current));
    });
  }

  function patchDraft(patch: Partial<MessageDraft>) {
    updateDraft((current) => ({ ...current, ...patch }));
  }

  function patchIntroduction(patch: Partial<MessageDraftIntroduction>) {
    updateDraft((current) => ({
      ...current,
      introduction: { ...current.introduction, ...patch },
    }));
  }

  function patchClosing(patch: Partial<MessageDraftClosing>) {
    updateDraft((current) => ({
      ...current,
      closing: { ...current.closing, ...patch },
    }));
  }

  function patchPoint(id: string, patch: Partial<MessageDraftPoint>) {
    updateDraft((current) => ({
      ...current,
      points: updatePoint(current.points, id, patch),
    }));
  }

  function print(mode: Exclude<PrintMode, null>) {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();

    setDraft((current) => (current ? persistDraft(current) : current));
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 120);
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
          <p className="text-muted">Create a message from the direction wizard to open a local draft in this browser.</p>
          <Link href="/new-message" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">
            Back to Directions
          </Link>
        </section>
      </AppShell>
    );
  }

  const introductionBullets = draft.introduction.bullets?.length
    ? draft.introduction.bullets
    : [draft.introduction.hook, draft.introduction.pastoralTension, draft.introduction.passageConnection].filter(Boolean);
  const closingBullets = draft.closing.bullets?.length
    ? draft.closing.bullets
    : [draft.closing.recap, draft.closing.callToResponse, draft.closing.closingApplication].filter(Boolean);

  return (
    <AppShell title="Message Map" eyebrow="Local draft">
      <PrintPulpitNotes draft={draft} active={printMode === "pulpit"} />
      <PrintFullPreparationNotes draft={draft} active={printMode === "full"} />

      <main className="mx-auto grid max-w-5xl gap-6 print:hidden">
        <section className="rounded-3xl border border-gold/40 bg-gold/10 p-4 text-sm font-semibold leading-6 text-teal">
          This local draft is saved in this browser. You bring the calling, conviction, and voice; My Pulpit Pro helps shape the message.
        </section>

        <section className="rounded-[2rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Message Map · {projectStatus}</p>
            <h1 className="mt-2 break-words font-serif text-4xl font-semibold leading-tight text-teal sm:text-5xl">{draft.title}</h1>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">Main passage</p>
            <p className="mt-1 break-words text-lg font-bold text-ink">{draft.mainScripture}</p>
            <ScriptureText text={draft.mainScriptureText} />
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">Big idea</p>
            <p className="mt-1 max-w-3xl text-lg leading-8 text-ink">{draft.bigIdea}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton onClick={() => setDetailPanel({ kind: "message" })}>Edit Message Details</ActionButton>
            </div>
          </div>
        </section>

        <IntroductionCard
          bullets={introductionBullets.slice(0, 4)}
          scripture={draft.introduction.scripture}
          scriptureText={draft.introduction.scriptureText}
          transition={draft.introduction.firstMovementTransition}
          notes={draft.introduction.notes}
          onNotesChange={(notes) => patchIntroduction({ notes })}
          onEdit={() => setDetailPanel({ kind: "introduction" })}
        />

        <section aria-labelledby="points-heading" className="grid gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Main sermon points</p>
            <h2 id="points-heading" className="font-serif text-3xl font-semibold text-teal">The shape of the message</h2>
          </div>
          {draft.points.map((point, index) => (
            <PointCard
              key={point.id}
              point={point}
              number={index + 1}
              onNotesChange={(notes) => patchPoint(point.id, { notes })}
              onEdit={() => setDetailPanel({ kind: "point", id: point.id })}
              onKeep={() => patchPoint(point.id, { status: "kept" })}
              onRewrite={() =>
                patchPoint(point.id, {
                  status: "rewritten",
                  summary: `This point keeps the message close to ${draft.mainScripture} and says it in a plainer way.`,
                  bullets: point.bullets.map((bullet, bulletIndex) => (bulletIndex === 0 ? `${point.title} is not just an idea to admire; it is a truth to carry into ordinary life.` : bullet)),
                  application: `${point.application} Let this truth shape one real decision before the day is over.`,
                })
              }
              onRemove={() => {
                updateDraft((current) => {
                  if (current.points.length === 1) return current;
                  return { ...current, points: current.points.filter((item) => item.id !== point.id) };
                });
              }}
            />
          ))}
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
              updateDraft((current) => ({ ...current, points: [...current.points, { ...next, id: `movement-${Date.now()}` }] }));
            }}
            className="min-h-12 rounded-full bg-gold px-5 py-3 text-sm font-bold text-teal-dark transition hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
          >
            Add Another Point
          </button>
        </section>

        <ClosingCard
          bullets={closingBullets.slice(0, 4)}
          application={draft.closing.closingApplication}
          scripture={draft.closing.scripture}
          scriptureText={draft.closing.scriptureText}
          prayer={draft.closing.prayer}
          notes={draft.closing.notes}
          onNotesChange={(notes) => patchClosing({ notes })}
          onEdit={() => setDetailPanel({ kind: "closing" })}
        />

        <section className="rounded-[1.75rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Save</p>
              <h2 className="font-serif text-3xl font-semibold text-teal">Save message</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Autosave keeps this local draft protected. Use Save Message when you want to mark the project as Saved.</p>
              {saveMessage ? <p className="mt-2 text-sm font-bold text-teal">{saveMessage}</p> : null}
            </div>
            <ActionButton filled onClick={() => {
              if (!draft || !projectId) return;
              const savedProject = markProjectSaved(projectId, draft);
              setProjectStatus(savedProject?.status ?? "Saved");
              setSaveMessage("Message saved");
            }}>Save Message</ActionButton>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Print</p>
              <h2 className="font-serif text-3xl font-semibold text-teal">Prepare printed notes</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">To remove the browser date, page URL, and page title, turn off “Headers and footers” in your browser’s print settings.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <ActionButton filled onClick={() => print("pulpit")}>Print Pulpit Notes</ActionButton>
              <ActionButton gold onClick={() => print("full")}>Print Full Preparation Notes</ActionButton>
            </div>
          </div>
        </section>
      </main>

      {detailPanel ? (
        <DetailDrawer
          draft={draft}
          panel={detailPanel}
          onClose={() => setDetailPanel(null)}
          patchDraft={patchDraft}
          patchIntroduction={patchIntroduction}
          patchClosing={patchClosing}
          patchPoint={patchPoint}
        />
      ) : null}
    </AppShell>
  );
}

function IntroductionCard({ bullets, scripture, scriptureText, transition, notes, onNotesChange, onEdit }: { bullets: string[]; scripture?: string; scriptureText?: string; transition: string; notes: string; onNotesChange: (value: string) => void; onEdit: () => void }) {
  return (
    <OutlineCard label="Introduction" title="Start here" onEdit={onEdit}>
      <BulletList bullets={bullets} />
      {scripture ? <ScriptureBlock reference={scripture} text={scriptureText} /> : null}
      <SectionLine label="Transition" value={transition} />
      <NotesArea value={notes} onChange={onNotesChange} />
    </OutlineCard>
  );
}

function PointCard({ point, number, onNotesChange, onEdit, onKeep, onRewrite, onRemove }: { point: MessageDraftPoint; number: number; onNotesChange: (value: string) => void; onEdit: () => void; onKeep: () => void; onRewrite: () => void; onRemove: () => void }) {
  return (
    <article className="rounded-[1.75rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Point {number}{point.status ? ` · ${point.status}` : ""}</p>
          <h3 className="mt-1 break-words font-serif text-3xl font-semibold leading-tight text-teal">{point.title}</h3>
          <ScriptureBlock reference={point.scripture} text={point.scriptureText} />
          <BulletList bullets={point.bullets.slice(0, 4)} />
          <SectionLine label="Application" value={point.application} />
          <SectionLine label="Transition" value={point.transition} />
          <NotesArea value={point.notes} onChange={onNotesChange} />
        </div>
        <div className="flex flex-wrap content-start gap-2 lg:w-44 lg:flex-col">
          <ActionButton onClick={onEdit}>Edit Details</ActionButton>
          <ActionButton onClick={onKeep}>Keep</ActionButton>
          <ActionButton filled onClick={onRewrite}>Rewrite</ActionButton>
          <ActionButton onClick={onRemove}>Remove</ActionButton>
        </div>
      </div>
    </article>
  );
}

function ClosingCard({ bullets, application, scripture, scriptureText, prayer, notes, onNotesChange, onEdit }: { bullets: string[]; application: string; scripture?: string; scriptureText?: string; prayer: string; notes: string; onNotesChange: (value: string) => void; onEdit: () => void }) {
  return (
    <OutlineCard label="Closing" title="Send the message home" onEdit={onEdit}>
      <BulletList bullets={bullets} />
      <SectionLine label="Closing application" value={application} />
      {scripture ? <ScriptureBlock reference={scripture} text={scriptureText} /> : null}
      <SectionLine label="Prayer cue" value={prayer} />
      <NotesArea value={notes} onChange={onNotesChange} />
    </OutlineCard>
  );
}

function OutlineCard({ label, title, onEdit, children }: { label: string; title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{label}</p>
          <h2 className="font-serif text-3xl font-semibold text-teal">{title}</h2>
        </div>
        <ActionButton onClick={onEdit}>Edit Details</ActionButton>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function ScriptureBlock({ reference, text }: { reference: string; text?: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-background p-4">
      <p className="break-words text-sm font-bold text-teal">{reference}</p>
      <ScriptureText text={text || MISSING_VERSE_TEXT} />
    </div>
  );
}

function ScriptureText({ text }: { text: string }) {
  return (
    <div className="mt-2">
      {text !== MISSING_VERSE_TEXT ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">KJV local text</p> : null}
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink">“{text}”</p>
    </div>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mt-4 grid list-disc gap-2 pl-5 text-base leading-7 text-ink">
      {bullets.filter(Boolean).map((bullet, index) => (
        <li key={`${bullet}-${index}`} className="break-words">{bullet}</li>
      ))}
    </ul>
  );
}

function SectionLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="grid gap-1">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="break-words text-base leading-7 text-ink">{value}</p>
    </div>
  );
}

function NotesArea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <TextArea label="My Notes" value={value} onChange={onChange} rows={3} placeholder="Add your notes here..." />;
}

function DetailDrawer({ draft, panel, onClose, patchDraft, patchIntroduction, patchClosing, patchPoint }: { draft: MessageDraft; panel: Exclude<DetailPanel, null>; onClose: () => void; patchDraft: (patch: Partial<MessageDraft>) => void; patchIntroduction: (patch: Partial<MessageDraftIntroduction>) => void; patchClosing: (patch: Partial<MessageDraftClosing>) => void; patchPoint: (id: string, patch: Partial<MessageDraftPoint>) => void }) {
  const point = panel.kind === "point" ? draft.points.find((item) => item.id === panel.id) : undefined;
  return (
    <div className="fixed inset-0 z-50 bg-ink/30 p-3 print:hidden" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-line bg-cream-strong shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Edit Details</p>
            <h2 className="font-serif text-3xl font-semibold text-teal">{panel.kind === "message" ? "Message details" : panel.kind === "introduction" ? "Introduction" : panel.kind === "closing" ? "Closing" : point?.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-4 py-2 text-sm font-bold text-teal focus:outline-none focus:ring-2 focus:ring-gold">Close</button>
        </div>
        <div className="grid gap-5 overflow-y-auto p-5">
          {panel.kind === "message" ? <MessageDetails draft={draft} patchDraft={patchDraft} /> : null}
          {panel.kind === "introduction" ? <IntroductionDetails draft={draft} patchIntroduction={patchIntroduction} /> : null}
          {panel.kind === "closing" ? <ClosingDetails draft={draft} patchClosing={patchClosing} /> : null}
          {point ? <PointDetails point={point} patchPoint={patchPoint} /> : null}
        </div>
      </div>
    </div>
  );
}

function MessageDetails({ draft, patchDraft }: { draft: MessageDraft; patchDraft: (patch: Partial<MessageDraft>) => void }) {
  return (
    <>
      <TextArea label="Sermon title" value={draft.title} onChange={(title) => patchDraft({ title })} rows={2} />
      <TextArea label="Main passage" value={draft.mainScripture} onChange={(mainScripture) => patchDraft({ mainScripture, mainScriptureText: getVerseText(mainScripture) })} rows={1} />
      <TextArea label="Main passage text" value={draft.mainScriptureText} onChange={(mainScriptureText) => patchDraft({ mainScriptureText })} rows={3} />
      <TextArea label="Big idea" value={draft.bigIdea} onChange={(bigIdea) => patchDraft({ bigIdea })} />
      <RemovableList label="Passage context" items={draft.contextNotes} onChange={(contextNotes) => patchDraft({ contextNotes })} addLabel="Add Context Note" />
      {draft.pastoralCareNote ? (
        <section className="rounded-2xl border border-line bg-background p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-teal">Pastoral care note</h3><SmallButton onClick={() => patchDraft({ pastoralCareNote: undefined })}>Remove</SmallButton></div>
          <TextArea label="Note" value={draft.pastoralCareNote.text} onChange={(text) => patchDraft({ pastoralCareNote: { ...draft.pastoralCareNote!, text } })} />
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted"><input type="checkbox" checked={draft.pastoralCareNote.includeInPulpit} onChange={(event) => patchDraft({ pastoralCareNote: { ...draft.pastoralCareNote!, includeInPulpit: event.target.checked } })} /> Include in Pulpit Notes</label>
        </section>
      ) : null}
      <ScriptureBankEditor draft={draft} patchDraft={patchDraft} />
    </>
  );
}

function IntroductionDetails({ draft, patchIntroduction }: { draft: MessageDraft; patchIntroduction: (patch: Partial<MessageDraftIntroduction>) => void }) {
  const intro = draft.introduction;
  return (
    <>
      <BulletEditor label="Opening bullets" bullets={intro.bullets} onChange={(bullets) => patchIntroduction({ bullets })} />
      <TextArea label="Opening hook" value={intro.hook} onChange={(hook) => patchIntroduction({ hook })} />
      <TextArea label="Pastoral tension" value={intro.pastoralTension} onChange={(pastoralTension) => patchIntroduction({ pastoralTension })} />
      <TextArea label="Passage connection" value={intro.passageConnection} onChange={(passageConnection) => patchIntroduction({ passageConnection })} />
      <TextArea label="Central big idea" value={intro.bigIdeaBridge} onChange={(bigIdeaBridge) => patchIntroduction({ bigIdeaBridge })} />
      <TextArea label="Primary Scripture reference" value={intro.scripture ?? ""} onChange={(scripture) => patchIntroduction({ scripture, scriptureText: scripture ? getVerseText(scripture) : "" })} rows={1} />
      <TextArea label="Primary Scripture text" value={intro.scriptureText ?? ""} onChange={(scriptureText) => patchIntroduction({ scriptureText })} />
      <TextArea label="Transition into first point" value={intro.firstMovementTransition} onChange={(firstMovementTransition) => patchIntroduction({ firstMovementTransition })} />
      <TextArea label="Additional notes" value={intro.notes} onChange={(notes) => patchIntroduction({ notes })} />
    </>
  );
}

function ClosingDetails({ draft, patchClosing }: { draft: MessageDraft; patchClosing: (patch: Partial<MessageDraftClosing>) => void }) {
  const closing = draft.closing;
  return (
    <>
      <BulletEditor label="Recap bullets" bullets={closing.bullets} onChange={(bullets) => patchClosing({ bullets })} />
      <TextArea label="Message recap" value={closing.recap} onChange={(recap) => patchClosing({ recap })} />
      <TextArea label="Call to response" value={closing.callToResponse} onChange={(callToResponse) => patchClosing({ callToResponse })} />
      <TextArea label="Closing application" value={closing.closingApplication} onChange={(closingApplication) => patchClosing({ closingApplication })} />
      <TextArea label="Primary Scripture reference" value={closing.scripture ?? ""} onChange={(scripture) => patchClosing({ scripture, scriptureText: scripture ? getVerseText(scripture) : "" })} rows={1} />
      <TextArea label="Primary Scripture text" value={closing.scriptureText ?? ""} onChange={(scriptureText) => patchClosing({ scriptureText })} />
      <TextArea label="Prayer cue" value={closing.prayer} onChange={(prayer) => patchClosing({ prayer })} />
      <TextArea label="Additional notes" value={closing.notes} onChange={(notes) => patchClosing({ notes })} />
    </>
  );
}

function PointDetails({ point, patchPoint }: { point: MessageDraftPoint; patchPoint: (id: string, patch: Partial<MessageDraftPoint>) => void }) {
  const patchCurrentPoint = (patch: Partial<MessageDraftPoint>) => patchPoint(point.id, patch);
  return (
    <>
      <TextArea label="Point title" value={point.title} onChange={(title) => patchCurrentPoint({ title })} rows={2} />
      <TextArea label="One-line summary" value={point.summary} onChange={(summary) => patchCurrentPoint({ summary })} rows={2} />
      <TextArea label="Primary Scripture reference" value={point.scripture} onChange={(scripture) => patchCurrentPoint({ scripture, scriptureText: getVerseText(scripture) })} rows={1} />
      <TextArea label="Primary Scripture text" value={point.scriptureText} onChange={(scriptureText) => patchCurrentPoint({ scriptureText })} />
      <BulletEditor label="Sermon bullets" bullets={point.bullets} onChange={(bullets) => patchCurrentPoint({ bullets })} />
      <TextArea label="Longer explanation" value={point.explanation} onChange={(explanation) => patchCurrentPoint({ explanation })} />
      <TextArea label="Short application" value={point.application} onChange={(application) => patchCurrentPoint({ application })} />
      <BulletEditor label="Illustration ideas" bullets={point.illustrationOptions} onChange={(illustrationOptions) => patchCurrentPoint({ illustrationOptions })} addLabel="Add Illustration" />
      <TextArea label="Transition" value={point.transition} onChange={(transition) => patchCurrentPoint({ transition })} />
      <TextArea label="Optional response moment" value={point.optionalResponseMoment ?? ""} onChange={(optionalResponseMoment) => patchCurrentPoint({ optionalResponseMoment, includeOptionalResponse: Boolean(optionalResponseMoment) })} />
      <TextArea label="Additional notes" value={point.notes} onChange={(notes) => patchCurrentPoint({ notes })} />
    </>
  );
}

function ScriptureBankEditor({ draft, patchDraft }: { draft: MessageDraft; patchDraft: (patch: Partial<MessageDraft>) => void }) {
  return (
    <section className="rounded-2xl border border-line bg-background p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-teal">Scripture Bank</h3><SmallButton onClick={() => patchDraft({ scriptureBank: [...draft.scriptureBank, { id: `scripture-${Date.now()}`, reference: "", text: MISSING_VERSE_TEXT, supportNote: "", fullContext: "" }] })}>Add Scripture</SmallButton></div>
      <div className="mt-3 grid gap-3">
        {draft.scriptureBank.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-cream-strong p-3">
            <div className="flex items-center justify-between gap-3"><p className="font-bold text-teal">Supporting Scripture</p><SmallButton onClick={() => patchDraft({ scriptureBank: draft.scriptureBank.filter((scripture) => scripture.id !== item.id) })}>Remove</SmallButton></div>
            <TextArea label="Reference" value={item.reference} onChange={(reference) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { reference, text: getVerseText(reference) }) })} rows={1} />
            <TextArea label="KJV verse text" value={item.text} onChange={(text) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { text }) })} />
            <TextArea label="Why this supports the message" value={item.supportNote} onChange={(supportNote) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { supportNote }) })} />
            <TextArea label="See full context" value={item.fullContext ?? ""} onChange={(fullContext) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { fullContext }) })} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BulletEditor({ label, bullets, onChange, addLabel = "Add Bullet" }: { label: string; bullets: string[]; onChange: (bullets: string[]) => void; addLabel?: string }) {
  return (
    <section className="rounded-2xl border border-line bg-background p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-teal">{label}</h3><SmallButton onClick={() => onChange([...bullets, ""])}>{addLabel}</SmallButton></div>
      <div className="mt-3 grid gap-2">
        {bullets.map((bullet, index) => (
          <div key={`${index}-${bullet}`} className="grid gap-2 rounded-2xl border border-line bg-cream-strong p-3">
            <SmallButton onClick={() => onChange(bullets.filter((_, itemIndex) => itemIndex !== index))}>Remove</SmallButton>
            <TextArea label={`Item ${index + 1}`} value={bullet} onChange={(value) => onChange(updateArrayItem(bullets, index, value))} rows={2} />
          </div>
        ))}
      </div>
    </section>
  );
}

function RemovableList({ label, items, onChange, addLabel }: { label: string; items: string[]; onChange: (items: string[]) => void; addLabel: string }) {
  return (
    <section className="rounded-2xl border border-line bg-background p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-teal">{label}</h3><SmallButton onClick={() => onChange([...items, ""])}>{addLabel}</SmallButton></div>
      <div className="mt-3 grid gap-2">
        {items.map((item, index) => (
          <div key={`${index}-${item}`} className="rounded-2xl border border-line bg-cream-strong p-3">
            <SmallButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</SmallButton>
            <TextArea label={`Note ${index + 1}`} value={item} onChange={(value) => onChange(updateArrayItem(items, index, value))} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 resize-none overflow-hidden rounded-2xl border border-line bg-background p-4 text-base leading-7 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

function ActionButton({ children, onClick, filled = false, gold = false }: { children: ReactNode; onClick: () => void; filled?: boolean; gold?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${filled ? "bg-teal text-cream-strong" : gold ? "bg-gold text-teal-dark" : "border border-line bg-background text-teal"}`}>
      {children}
    </button>
  );
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-fit rounded-full border border-line bg-background px-3 py-1 text-xs font-bold text-teal focus:outline-none focus:ring-2 focus:ring-gold">{children}</button>;
}

function PrintPulpitNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} />
      <section className="mt-3 break-inside-avoid"><h2 className="text-sm font-bold">Introduction</h2><ul className="list-disc pl-5">{draft.introduction.bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}</ul><PrintNotesBlock notes={draft.introduction.notes} /></section>
      <section className="mt-3"><h2 className="text-sm font-bold">Pulpit Outline</h2>{draft.points.map((point, index) => <section key={point.id} className="break-inside-avoid border-t border-black/20 pt-2"><h3 className="font-bold">{index + 1}. {point.title}</h3><p className="text-xs font-semibold">{point.scripture}</p><p className="text-xs">{point.scriptureText}</p><ul className="mt-1 list-disc pl-5">{point.bullets.slice(0, 3).map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul><PrintLine label="Application" value={point.application} /><PrintLine label="Transition" value={point.transition} /><PrintNotesBlock notes={point.notes} /></section>)}</section>
      <section className="mt-3 break-inside-avoid border-t border-black/30 pt-2"><ul className="list-disc pl-5">{draft.closing.bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}</ul><PrintLine label="Prayer cue" value={draft.closing.prayer} /><PrintNotesBlock notes={draft.closing.notes} /></section>
    </article>
  );
}

function PrintFullPreparationNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} />
      {draft.contextNotes.length ? <section className="mt-4 break-inside-avoid"><h2 className="text-base font-bold">Passage Context</h2>{draft.contextNotes.filter(Boolean).map((note, index) => <p key={index}>{note}</p>)}</section> : null}
      {draft.pastoralCareNote ? <PrintLine label="Pastoral care note" value={draft.pastoralCareNote.text} /> : null}
      <section className="mt-4 break-inside-avoid"><h2 className="text-base font-bold">Scripture Bank</h2>{draft.scriptureBank.map((item) => <div key={item.id} className="break-inside-avoid"><p><strong>{item.reference}:</strong> {item.text}</p>{item.supportNote ? <p><strong>Supports:</strong> {item.supportNote}</p> : null}{item.fullContext ? <p><strong>Context:</strong> {item.fullContext}</p> : null}</div>)}</section>
      <section className="mt-4 break-inside-avoid"><h2 className="text-base font-bold">Introduction</h2><ul className="list-disc pl-5">{draft.introduction.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul><PrintLine label="Hook" value={draft.introduction.hook} /><PrintLine label="Transition" value={draft.introduction.firstMovementTransition} /><PrintNotesBlock notes={draft.introduction.notes} /></section>
      <section className="mt-4"><h2 className="text-base font-bold">Message Points</h2>{draft.points.map((point, index) => <section key={point.id} className="break-inside-avoid border-t border-black/20 pt-2"><h3 className="font-bold">{index + 1}. {point.title}</h3><p className="text-sm font-semibold">{point.scripture}</p><p className="text-sm">{point.scriptureText}</p><ul className="mt-1 list-disc pl-5">{point.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul><PrintLine label="Explanation" value={point.explanation} /><PrintLine label="Application" value={point.application} />{point.illustrationOptions.length ? <PrintLine label="Illustration options" value={point.illustrationOptions.join(" | ")} /> : null}<PrintLine label="Transition" value={point.transition} /><PrintNotesBlock notes={point.notes} /></section>)}</section>
      <section className="mt-4 break-inside-avoid border-t border-black/30 pt-3"><h2 className="text-base font-bold">Closing</h2><ul className="list-disc pl-5">{draft.closing.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul><PrintLine label="Application" value={draft.closing.closingApplication} /><PrintLine label="Prayer cue" value={draft.closing.prayer} /><PrintNotesBlock notes={draft.closing.notes} /></section>
    </article>
  );
}

function PrintNotesBlock({ notes }: { notes?: string }) {
  return (
    <div className="mt-2 break-inside-avoid">
      <p className="text-xs font-bold uppercase tracking-[0.12em]">My Notes</p>
      {notes ? <p className="mt-1 whitespace-pre-wrap">{notes}</p> : null}
      <div className="mt-2 grid gap-3" aria-hidden="true">
        <div className="h-4 border-b border-black/40" />
        <div className="h-4 border-b border-black/40" />
        <div className="h-4 border-b border-black/40" />
      </div>
    </div>
  );
}

function PrintHeader({ draft }: { draft: MessageDraft }) {
  return <header className="border-b border-black/30 pb-3"><p className="text-xs font-bold uppercase tracking-[0.16em]">My Pulpit Pro</p><h1 className="mt-2 text-2xl font-bold">{draft.title}</h1><p className="mt-1 font-semibold">Main passage: {draft.mainScripture}</p><p className="text-sm">{draft.mainScriptureText}</p><p className="mt-1">Big idea: {draft.bigIdea}</p><p className="mt-1 text-sm">{draft.lengthLabel} · Preferred translation: {draft.translation} · Local verse text shown in KJV where available</p></header>;
}

function PrintLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <p className="mt-1"><strong>{label}:</strong> {value}</p>;
}

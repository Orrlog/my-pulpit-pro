"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type DragEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import {
  MISSING_VERSE_TEXT,
  buildAdditionalPoint,
  getVerseText,
  rewriteMessagePoint,
  type MessageDraft,
  type MessageDraftClosing,
  type MessageDraftIntroduction,
  type MessageDraftPoint,
  type ScriptureBankItem,
} from "@/components/app-shell/message-draft-storage";
import type { MessageProject, MessageProjectStatus } from "@/lib/message-projects/types";

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

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function scriptureLines(text?: string) {
  if (!text || text === MISSING_VERSE_TEXT) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)(?::|\s+)\s*(.+)$/);
      return match ? { verse: match[1], text: match[2].trim() } : { verse: "", text: line };
    });
}

function uniqueScriptureItems(items: ScriptureBankItem[]) {
  return Array.from(new Map(items.filter((item) => item.reference.trim()).map((item) => [item.reference.trim(), item])).values());
}

export default function MessageWorkspacePage() {
  const [draft, setDraft] = useState<MessageDraft | null | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<MessageProjectStatus>("Draft");
  const [saveMessage, setSaveMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "dirty" | "saving" | "failed">("saved");
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [pointPendingDelete, setPointPendingDelete] = useState<MessageDraftPoint | null>(null);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [dragScrollDirection, setDragScrollDirection] = useState<-1 | 0 | 1>(0);
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const draftRef = useRef<MessageDraft | null>(null);
  const projectIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const pendingDraftRef = useRef<MessageDraft | null>(null);
  const pendingVersionRef = useRef(0);
  const editVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const deleteModalCancelRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const dragScrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProject() {
      const requestedProjectId = new URLSearchParams(window.location.search).get("project");
      try {
        const response = await fetch(requestedProjectId ? `/api/message-projects/${requestedProjectId}` : "/api/message-projects?limit=1", { cache: "no-store" });
        const payload = (await response.json()) as { project?: MessageProject; projects?: MessageProject[]; error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setLoadError(payload.error ?? "No message found.");
          setDraft(null);
          return;
        }
        const project = payload.project ?? payload.projects?.[0] ?? null;
        if (!project) {
          setDraft(null);
          return;
        }
        setDraft(project.draft);
        setProjectId(project.id);
        setProjectStatus(project.status);
        draftRef.current = project.draft;
        projectIdRef.current = project.id;
        savedVersionRef.current = editVersionRef.current;
      } catch {
        if (!cancelled) {
          setLoadError("Message projects are unavailable right now.");
          setDraft(null);
        }
      }
    }
    void loadProject();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    draftRef.current = draft ?? null;
  }, [draft]);

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    if (!pointPendingDelete) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : deleteTriggerRef.current;
    deleteModalCancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setPointPendingDelete(null);
        previousFocus?.focus();
      }
      if (event.key !== "Tab") return;
      const modal = document.getElementById("delete-point-modal");
      const focusable = Array.from(modal?.querySelectorAll<HTMLElement>("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])") ?? []).filter((item) => !item.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [pointPendingDelete]);

  useEffect(() => {
    async function finalSave() {
      const activeProjectId = projectIdRef.current;
      const pending = pendingDraftRef.current;
      const requestVersion = pendingVersionRef.current;
      if (!activeProjectId || !pending || !requestVersion || inFlightRef.current) return;

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      inFlightRef.current = true;
      let requestSucceeded = false;

      try {
        const project = await sendDraft(pending, undefined, true);
        requestSucceeded = true;
        if (project && requestVersion === pendingVersionRef.current) {
          pendingDraftRef.current = null;
          pendingVersionRef.current = 0;
        }
        if (project && requestVersion === editVersionRef.current) {
          savedVersionRef.current = requestVersion;
          setProjectStatus(project.status);
          setAutosaveStatus("saved");
        }
      } catch {
        if (document.visibilityState === "visible") setAutosaveStatus("failed");
      } finally {
        inFlightRef.current = false;
        if (requestSucceeded && pendingDraftRef.current && pendingVersionRef.current > requestVersion) {
          void flushAutosave();
        }
      }
    }
    function handleVisibilityChange() { if (document.visibilityState === "hidden") void finalSave(); }
    function handlePageHide() { void finalSave(); }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
    // The page-hide handler intentionally reads mutable refs so it can run with the latest draft without resubscribing on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    if (!dragScrollDirection) {
      if (dragScrollFrameRef.current) window.cancelAnimationFrame(dragScrollFrameRef.current);
      dragScrollFrameRef.current = null;
      return;
    }

    function scrollStep() {
      window.scrollBy({ top: dragScrollDirection * 18, behavior: "auto" });
      dragScrollFrameRef.current = window.requestAnimationFrame(scrollStep);
    }

    dragScrollFrameRef.current = window.requestAnimationFrame(scrollStep);
    return () => {
      if (dragScrollFrameRef.current) window.cancelAnimationFrame(dragScrollFrameRef.current);
      dragScrollFrameRef.current = null;
    };
  }, [dragScrollDirection]);

  function handlePointDrag(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const edge = 96;
    if (event.clientY < edge) setDragScrollDirection(-1);
    else if (window.innerHeight - event.clientY < edge) setDragScrollDirection(1);
    else setDragScrollDirection(0);
  }

  async function sendDraft(nextDraft: MessageDraft, action?: "save", keepalive = false) {
    const activeProjectId = projectIdRef.current;
    if (!activeProjectId) return null;
    const response = await fetch(`/api/message-projects/${activeProjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: nextDraft, action }),
      keepalive,
    });
    const payload = (await response.json()) as { project?: MessageProject; error?: string };
    if (!response.ok || !payload.project) throw new Error(payload.error ?? "Save failed");
    return payload.project;
  }

  async function waitForInFlight() {
    while (inFlightRef.current) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
  }

  async function savePendingDraft(action?: "save") {
    if (inFlightRef.current) return false;
    const nextDraft = pendingDraftRef.current;
    const requestVersion = pendingVersionRef.current;
    if (!nextDraft || !requestVersion) return true;

    inFlightRef.current = true;
    setAutosaveStatus("saving");
    let savedCurrentVersion = false;
    let requestSucceeded = false;

    try {
      const project = await sendDraft(nextDraft, action);
      requestSucceeded = true;
      if (project && requestVersion === pendingVersionRef.current) {
        pendingDraftRef.current = null;
        pendingVersionRef.current = 0;
      }
      if (project && requestVersion === editVersionRef.current) {
        savedVersionRef.current = requestVersion;
        setProjectStatus(project.status);
        setAutosaveStatus("saved");
        savedCurrentVersion = true;
      }
      return true;
    } catch {
      setAutosaveStatus("failed");
      return false;
    } finally {
      inFlightRef.current = false;
      if (!savedCurrentVersion && requestSucceeded && pendingDraftRef.current && pendingVersionRef.current > requestVersion) {
        void flushAutosave(action);
      }
    }
  }

  async function flushAutosave(action?: "save") {
    await savePendingDraft(action);
  }

  async function saveLatestAndMarkSaved() {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setSaveMessage("");
    setAutosaveStatus("saving");

    while (true) {
      await waitForInFlight();
      const latest = draftRef.current;
      if (!latest || !projectIdRef.current) return false;

      const requestVersion = editVersionRef.current;
      pendingDraftRef.current = latest;
      pendingVersionRef.current = requestVersion;

      inFlightRef.current = true;
      try {
        const project = await sendDraft(latest, "save");
        if (project && requestVersion === pendingVersionRef.current) {
          pendingDraftRef.current = null;
          pendingVersionRef.current = 0;
        }
        if (project) setProjectStatus(project.status);
        if (requestVersion === editVersionRef.current) {
          savedVersionRef.current = requestVersion;
          setAutosaveStatus("saved");
          setSaveMessage("Message marked as saved.");
          return true;
        }
      } catch {
        setAutosaveStatus("failed");
        setSaveMessage("Save failed");
        return false;
      } finally {
        inFlightRef.current = false;
      }
    }
  }

  function scheduleAutosave(nextDraft: MessageDraft) {
    pendingDraftRef.current = nextDraft;
    pendingVersionRef.current = editVersionRef.current;
    setAutosaveStatus("dirty");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      void flushAutosave();
    }, 800);
  }

  function persistDraft(next: MessageDraft) {
    const activeProjectId = projectIdRef.current;
    const persisted = { ...next, id: activeProjectId ?? next.id, updatedAt: new Date().toISOString() };
    editVersionRef.current += 1;
    draftRef.current = persisted;
    scheduleAutosave(persisted);
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
        <p className="text-muted">Loading message...</p>
      </AppShell>
    );
  }

  if (!draft) {
    return (
      <AppShell title="No message found">
        <section className="rounded-3xl border border-line bg-cream-strong p-6">
          {loadError ? <p className="text-muted">{loadError}</p> : null}
          <p className="mt-2 text-muted">Create a message from the direction wizard to open a message in your account.</p>
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
    <AppShell title="Message Map" eyebrow="Message workspace">
      <PrintPulpitNotes draft={draft} active={printMode === "pulpit"} />
      <PrintFullPreparationNotes draft={draft} active={printMode === "full"} />

      <main className="mx-auto grid max-w-5xl gap-6 print:hidden">
        <section className="rounded-3xl border border-gold/40 bg-gold/10 p-4 text-sm font-semibold leading-6 text-teal">
          Your changes are saved securely to your My Pulpit Pro account. You bring the calling, conviction, and voice; My Pulpit Pro helps shape the message.
        </section>

        <section className="rounded-[2rem] border border-line bg-cream-strong p-5 shadow-sm sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Message Map · {projectStatus}</p>
            <h1 className="mt-2 break-words font-serif text-4xl font-semibold leading-tight text-teal sm:text-5xl">{draft.title}</h1>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">Main passage</p>
            <p className="mt-1 break-words text-lg font-bold text-ink">{draft.mainScripture}</p>
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
          explanation={draft.introduction.explanation}
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
              total={draft.points.length}
              isDragging={draggedPointId === point.id}
              onDragStart={() => setDraggedPointId(point.id)}
              onDragOver={handlePointDrag}
              onDrop={() => {
                if (!draggedPointId || draggedPointId === point.id) return;
                updateDraft((current) => ({
                  ...current,
                  points: moveItem(
                    current.points,
                    current.points.findIndex((item) => item.id === draggedPointId),
                    current.points.findIndex((item) => item.id === point.id),
                  ),
                }));
                setDraggedPointId(null);
                setDragScrollDirection(0);
              }}
              onDragEnd={() => { setDraggedPointId(null); setDragScrollDirection(0); }}
              onMoveUp={() => updateDraft((current) => ({ ...current, points: moveItem(current.points, index, index - 1) }))}
              onMoveDown={() => updateDraft((current) => ({ ...current, points: moveItem(current.points, index, index + 1) }))}
              onMoveTo={(position) => updateDraft((current) => ({ ...current, points: moveItem(current.points, index, position - 1) }))}
              onNotesChange={(notes) => patchPoint(point.id, { notes })}
              onEdit={() => setDetailPanel({ kind: "point", id: point.id })}
              onKeep={() => patchPoint(point.id, { status: "kept" })}
              onRewrite={() =>
                updateDraft((current) => {
                  const result = rewriteMessagePoint(current, point);
                  return {
                    ...current,
                    scriptureBank: result.scriptureItem ? [...current.scriptureBank, result.scriptureItem] : current.scriptureBank,
                    points: current.points.map((item) => (item.id === point.id ? result.point : item)),
                  };
                })
              }
              onRemove={(trigger) => {
                deleteTriggerRef.current = trigger;
                setPointPendingDelete(point);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              updateDraft((current) => {
                const result = buildAdditionalPoint(current);
                return {
                  ...current,
                  scriptureBank: result.scriptureItem ? [...current.scriptureBank, result.scriptureItem] : current.scriptureBank,
                  points: [...current.points, result.point],
                };
              });
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
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Autosave protects every edit as a draft. Use Mark as Saved when this message is ready to file as Saved.</p>
              <p className="mt-2 text-sm font-bold text-teal">{autosaveStatus === "dirty" ? "Unsaved changes" : autosaveStatus === "saving" ? "Saving changes..." : autosaveStatus === "failed" ? "Save failed" : "All changes saved"}</p>
              {saveMessage ? <p className="mt-2 text-sm font-bold text-teal">{saveMessage}</p> : null}
              {autosaveStatus === "failed" ? (
                <button type="button" onClick={() => void flushAutosave()} className="mt-3 min-h-10 rounded-full border border-line bg-background px-4 py-2 text-sm font-bold text-teal focus:outline-none focus:ring-2 focus:ring-gold">
                  Retry Save
                </button>
              ) : null}
            </div>
            <ActionButton filled onClick={() => void saveLatestAndMarkSaved()}>Mark as Saved</ActionButton>
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
      {pointPendingDelete ? (
        <DeletePointModal
          cancelRef={deleteModalCancelRef}
          onCancel={() => setPointPendingDelete(null)}
          onConfirm={() => {
            updateDraft((current) => {
              if (current.points.length === 1) return current;
              return { ...current, points: current.points.filter((item) => item.id !== pointPendingDelete.id) };
            });
            setPointPendingDelete(null);
          }}
        />
      ) : null}
    </AppShell>
  );
}

function IntroductionCard({ bullets, scripture, scriptureText, explanation, transition, notes, onNotesChange, onEdit }: { bullets: string[]; scripture?: string; scriptureText?: string; explanation: string; transition: string; notes: string; onNotesChange: (value: string) => void; onEdit: () => void }) {
  return (
    <OutlineCard label="Introduction" title="Start here" onEdit={onEdit}>
      {scripture ? <ScriptureBlock reference={scripture} text={scriptureText} /> : null}
      <BulletList bullets={bullets} />
      <SectionLine label="Explanation" value={explanation} />
      <SectionLine label="Transition" value={transition} />
      <NotesArea value={notes} onChange={onNotesChange} />
    </OutlineCard>
  );
}

function PointCard({ point, number, total, isDragging, onNotesChange, onEdit, onKeep, onRewrite, onRemove, onMoveUp, onMoveDown, onMoveTo, onDragStart, onDragOver, onDrop, onDragEnd }: { point: MessageDraftPoint; number: number; total: number; isDragging: boolean; onNotesChange: (value: string) => void; onEdit: () => void; onKeep: () => void; onRewrite: () => void; onRemove: (trigger: HTMLElement) => void; onMoveUp: () => void; onMoveDown: () => void; onMoveTo: (position: number) => void; onDragStart: () => void; onDragOver: (event: DragEvent<HTMLElement>) => void; onDrop: () => void; onDragEnd: () => void }) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-[1.75rem] border border-line bg-cream-strong p-5 shadow-sm transition sm:p-6 ${isDragging ? "opacity-60 ring-2 ring-gold" : ""}`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <button type="button" aria-label={`Drag to reorder point ${number}`} className="mt-1 grid h-10 w-10 shrink-0 cursor-grab place-items-center rounded-2xl border border-line bg-background text-teal focus:outline-none focus:ring-2 focus:ring-gold">
              <span aria-hidden="true" className="grid grid-cols-2 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Point {number}{point.status ? ` · ${point.status}` : ""}</p>
              <h3 className="mt-1 break-words font-serif text-3xl font-semibold leading-tight text-teal">{point.title}</h3>
            </div>
          </div>
          <ScriptureBlock reference={point.scripture} text={point.scriptureText} />
          <BulletList bullets={point.bullets.slice(0, 4)} />
          <SectionLine label="Explanation" value={point.explanation} />
          <SectionLine label="Application" value={point.application} />
          {point.illustrationOptions.length ? <SectionLine label="Illustration options" value={point.illustrationOptions.join(" ")} /> : null}
          <SectionLine label="Transition" value={point.transition} />
          <NotesArea value={point.notes} onChange={onNotesChange} />
        </div>
        <div className="flex flex-wrap content-start gap-2 lg:w-44 lg:flex-col">
          <ActionButton onClick={onEdit}>Edit Details</ActionButton>
          <ActionButton onClick={onKeep}>Keep</ActionButton>
          <ActionButton filled onClick={onRewrite}>Rewrite</ActionButton>
          <ActionButton onClick={onMoveUp} disabled={number === 1}>Move Up</ActionButton>
          <ActionButton onClick={onMoveDown} disabled={number === total}>Move Down</ActionButton>
          <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Move to Point
            <select
              value={number}
              onChange={(event) => onMoveTo(Number(event.target.value))}
              className="min-h-10 rounded-full border border-line bg-background px-3 py-2 text-sm font-bold normal-case tracking-normal text-teal focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {Array.from({ length: total }, (_, index) => index + 1).map((position) => <option key={position} value={position}>{position}</option>)}
            </select>
          </label>
          <ActionButton destructive onClick={(event) => onRemove(event.currentTarget)}>Trash</ActionButton>
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
  const lines = scriptureLines(text);
  if (!lines.length) return <p className="mt-2 text-sm leading-6 text-muted">Verse text is not available.</p>;
  return (
    <div className="mt-2 grid gap-2 text-sm leading-6 text-ink">
      {lines.map((line, index) => (
        <p key={`${line.verse}-${index}`} className="break-words">
          {line.verse ? <strong className="font-extrabold text-teal">{line.verse}: </strong> : null}
          <span>{line.text}</span>
        </p>
      ))}
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
    <section className="mt-5 border-t border-line/80 pt-4">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-teal">{label}</p>
      <p className="mt-2 break-words text-base leading-7 text-ink">{value}</p>
    </section>
  );
}

function NotesArea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="mt-5 border-t border-line/80 pt-4">
      <TextArea
        label="My Notes"
        labelClassName="text-sm font-extrabold uppercase tracking-[0.16em] text-teal"
        value={value}
        onChange={onChange}
        rows={3}
        placeholder="Add your notes here..."
      />
    </section>
  );
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
      <TextArea label="Explanation" value={intro.explanation} onChange={(explanation) => patchIntroduction({ explanation })} />
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
  const supporting = uniqueScriptureItems(draft.scriptureBank).filter((item) => item.reference !== draft.mainScripture);
  return (
    <section className="rounded-2xl border border-line bg-background p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-teal">Scripture Bank</h3><SmallButton onClick={() => patchDraft({ scriptureBank: [...draft.scriptureBank, { id: `scripture-${Date.now()}`, reference: "", text: MISSING_VERSE_TEXT, supportNote: "", fullContext: "" }] })}>Add Scripture</SmallButton></div>
      <div className="mt-4 grid gap-4">
        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">Main passage</p>
          <p className="mt-1 font-bold text-ink">{draft.mainScripture}</p>
        </section>
        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">Supporting Scriptures</p>
          <div className="mt-3 grid gap-3">
            {supporting.map((item) => (
              <div key={item.id} className="rounded-2xl border border-line bg-cream-strong p-3">
                <div className="flex items-center justify-between gap-3"><p className="font-bold text-teal">Supporting Scripture</p><SmallButton onClick={() => patchDraft({ scriptureBank: draft.scriptureBank.filter((scripture) => scripture.id !== item.id) })}>Remove</SmallButton></div>
                <TextArea label="Reference" value={item.reference} onChange={(reference) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { reference, text: getVerseText(reference), supportNote: "", fullContext: "" }) })} rows={1} />
                <TextArea label="Verse text" value={item.text} onChange={(text) => patchDraft({ scriptureBank: updateScriptureItem(draft.scriptureBank, item.id, { text }) })} />
              </div>
            ))}
          </div>
        </section>
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

function TextArea({ label, value, onChange, rows = 4, placeholder, labelClassName = "text-sm font-bold text-ink" }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string; labelClassName?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);
  return (
    <label className="grid gap-2">
      <span className={labelClassName}>{label}</span>
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

function ActionButton({ children, onClick, filled = false, gold = false, destructive = false, disabled = false }: { children: ReactNode; onClick: (event: MouseEvent<HTMLButtonElement>) => void; filled?: boolean; gold?: boolean; destructive?: boolean; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${destructive ? "border border-red-300 bg-red-50 text-red-700" : filled ? "bg-teal text-cream-strong" : gold ? "bg-gold text-teal-dark" : "border border-line bg-background text-teal"}`}>
      {children}
    </button>
  );
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-fit rounded-full border border-line bg-background px-3 py-1 text-xs font-bold text-teal focus:outline-none focus:ring-2 focus:ring-gold">{children}</button>;
}

function DeletePointModal({ cancelRef, onCancel, onConfirm }: { cancelRef: RefObject<HTMLButtonElement | null>; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 print:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section id="delete-point-modal" role="dialog" aria-modal="true" aria-labelledby="delete-point-title" className="w-full max-w-md rounded-3xl border border-line bg-cream-strong p-6 shadow-2xl">
        <h2 id="delete-point-title" className="font-serif text-3xl font-semibold text-teal">Delete this sermon point?</h2>
        <p className="mt-3 text-sm leading-6 text-muted">This point and any notes inside it will be removed.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={onCancel} className="min-h-11 rounded-full border border-line bg-background px-5 py-2 text-sm font-bold text-teal focus:outline-none focus:ring-2 focus:ring-gold">Cancel</button>
          <button type="button" onClick={onConfirm} className="min-h-11 rounded-full bg-red-700 px-5 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Delete Point</button>
        </div>
      </section>
    </div>
  );
}

function PrintScriptureText({ text }: { text?: string }) {
  const lines = scriptureLines(text);
  if (!lines.length) return null;
  return (
    <div className="mt-1 grid gap-1">
      {lines.map((line, index) => (
        <p key={`${line.verse}-${index}`} className="text-xs leading-snug">
          {line.verse ? <strong>{line.verse}: </strong> : null}
          {line.text}
        </p>
      ))}
    </div>
  );
}

function PrintSection({ title, children, notes }: { title: string; children: ReactNode; notes?: string }) {
  return (
    <section className="mt-6 break-inside-avoid border-t border-black/25 pt-4">
      <h2 className="break-after-avoid text-base font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
      <PrintNotesBlock notes={notes} />
    </section>
  );
}

function PrintPulpitNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} compact />
      <PrintSection title="Introduction" notes={draft.introduction.notes}>
        {draft.introduction.scripture ? <p className="mt-2 text-xs font-semibold">{draft.introduction.scripture}</p> : null}
        <PrintScriptureText text={draft.introduction.scriptureText} />
        <ul className="mt-2 list-disc pl-5">{draft.introduction.bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}</ul>
        <PrintLine label="Explanation" value={draft.introduction.explanation} />
      </PrintSection>
      <section className="mt-7">
        {draft.points.map((point, index) => (
          <section key={point.id} className="mt-6 break-inside-avoid-page border-t border-black/25 pt-4">
            <h3 className="break-after-avoid text-base font-bold">{index + 1}. {point.title}</h3>
            <p className="mt-1 text-xs font-semibold">{point.scripture}</p>
            <PrintScriptureText text={point.scriptureText} />
            <ul className="mt-2 list-disc pl-5">{point.bullets.slice(0, 3).map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul>
            <PrintLine label="Application" value={point.application} />
            <PrintLine label="Transition" value={point.transition} />
            <PrintNotesBlock notes={point.notes} />
          </section>
        ))}
      </section>
      <PrintSection title="Closing and Prayer" notes={draft.closing.notes}>
        <ul className="list-disc pl-5">{draft.closing.bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}</ul>
        {draft.closing.scripture ? <p className="mt-2 text-xs font-semibold">{draft.closing.scripture}</p> : null}
        <PrintScriptureText text={draft.closing.scriptureText} />
        <PrintLine label="Prayer cue" value={draft.closing.prayer} />
      </PrintSection>
    </article>
  );
}

function PrintFullPreparationNotes({ draft, active }: { draft: MessageDraft; active: boolean }) {
  const supporting = uniqueScriptureItems(draft.scriptureBank).filter((item) => item.reference !== draft.mainScripture);
  return (
    <article className={`${active ? "print:block" : "print:hidden"} hidden print:p-0 print:text-[10.5pt] print:leading-snug print:text-black`}>
      <PrintHeader draft={draft} />
      {draft.contextNotes.length ? <section className="mt-5 break-inside-avoid border-t border-black/25 pt-4"><h2 className="text-base font-bold">Passage Context</h2>{draft.contextNotes.filter(Boolean).map((note, index) => <p key={index} className="mt-1">{note}</p>)}</section> : null}
      {draft.pastoralCareNote ? <PrintLine label="Pastoral care note" value={draft.pastoralCareNote.text} /> : null}
      <section className="mt-5 break-inside-avoid border-t border-black/25 pt-4">
        <h2 className="text-base font-bold">Scripture Bank</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">Main Passage</p>
        <p>{draft.mainScripture}</p>
        {supporting.length ? <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em]">Supporting Scriptures</p> : null}
        {supporting.map((item) => (
          <div key={item.id} className="mt-2 break-inside-avoid">
            <p><strong>{item.reference}</strong></p>
            {scriptureLines(item.text).length <= 3 ? <PrintScriptureText text={item.text} /> : null}
          </div>
        ))}
      </section>
      <PrintSection title="Introduction" notes={draft.introduction.notes}>
        {draft.introduction.scripture ? <p className="mt-2 text-xs font-semibold">{draft.introduction.scripture}</p> : null}
        <PrintScriptureText text={draft.introduction.scriptureText} />
        <ul className="mt-2 list-disc pl-5">{draft.introduction.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        <PrintLine label="Explanation" value={draft.introduction.explanation} />
        <PrintLine label="Hook" value={draft.introduction.hook} />
        <PrintLine label="Transition" value={draft.introduction.firstMovementTransition} />
      </PrintSection>
      <section className="mt-7">
        <h2 className="text-base font-bold">Message Points</h2>
        {draft.points.map((point, index) => (
          <section key={point.id} className="mt-6 break-inside-avoid-page border-t border-black/25 pt-4">
            <h3 className="break-after-avoid text-base font-bold">{index + 1}. {point.title}</h3>
            <p className="mt-1 text-sm font-semibold">{point.scripture}</p>
            <PrintScriptureText text={point.scriptureText} />
            <ul className="mt-2 list-disc pl-5">{point.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul>
            <PrintLine label="Explanation" value={point.explanation} />
            <PrintLine label="Application" value={point.application} />
            {point.illustrationOptions.length ? <PrintLine label="Illustration options" value={point.illustrationOptions.join(" | ")} /> : null}
            <PrintLine label="Transition" value={point.transition} />
            <PrintNotesBlock notes={point.notes} />
          </section>
        ))}
      </section>
      <PrintSection title="Closing and Prayer" notes={draft.closing.notes}>
        <ul className="list-disc pl-5">{draft.closing.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        {draft.closing.scripture ? <p className="mt-2 text-xs font-semibold">{draft.closing.scripture}</p> : null}
        <PrintScriptureText text={draft.closing.scriptureText} />
        <PrintLine label="Application" value={draft.closing.closingApplication} />
        <PrintLine label="Prayer cue" value={draft.closing.prayer} />
      </PrintSection>
    </article>
  );
}

function PrintNotesBlock({ notes }: { notes?: string }) {
  return (
    <div className="mt-4 mb-5 break-inside-avoid-page">
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

function PrintHeader({ draft, compact = false }: { draft: MessageDraft; compact?: boolean }) {
  return <header className="break-after-avoid border-b border-black/30 pb-3"><p className="text-xs font-bold uppercase tracking-[0.16em]">My Pulpit Pro</p><h1 className="mt-2 text-2xl font-bold">{draft.title}</h1><p className="mt-1 font-semibold">Main passage: {draft.mainScripture}</p><p className="mt-1">Big idea: {draft.bigIdea}</p><p className="mt-1 text-sm">{compact ? draft.lengthLabel : `${draft.lengthLabel} · Preferred translation: ${draft.translation}`}</p></header>;
}

function PrintLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <p className="mt-1"><strong>{label}:</strong> {value}</p>;
}

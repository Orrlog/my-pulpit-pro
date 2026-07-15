"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  messageLengths,
  messageModes,
  startPaths,
  themes,
  tones,
  translations,
  type StartPathId,
} from "./data";
import {
  buildClosing,
  buildContextNotes,
  buildInitialPoints,
  buildIntroduction,
  buildPastoralCareNote,
  buildScriptureBank,
  cleanMessageDraft,
  getVerseText,
  type MessageDraft,
} from "./message-draft-storage";

import {
  getDevelopDirections,
  getExploreDirections,
  getVisibleConcerns,
  getWeeklyConcernDirections,
} from "./direction-previews";

const stages = ["Starting Point", "Message Details", "Length and Translation", "Explore Directions"];

function isStartPathId(value: string | undefined): value is StartPathId {
  return value === "explore" || value === "develop" || value === "week";
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
      {children}
    </label>
  );
}

export function NewMessageWizard({
  initialPath,
  initialStage = 0,
}: {
  initialPath?: string;
  initialStage?: number;
}) {
  const [stage, setStage] = useState(initialStage);
  const [selectedPath, setSelectedPath] = useState<StartPathId>(
    isStartPathId(initialPath) ? initialPath : "explore",
  );
  const [selectedMode, setSelectedMode] = useState("sunday");
  const [theme, setTheme] = useState(themes[0]);
  const [tone, setTone] = useState(tones[0]);
  const [length, setLength] = useState("45");
  const [translation, setTranslation] = useState(translations[0]);
  const [idea, setIdea] = useState("");
  const [passage, setPassage] = useState("");
  const [response, setResponse] = useState("");
  const [ideaOffset, setIdeaOffset] = useState(0);
  const [concernOffset, setConcernOffset] = useState(0);
  const [selectedConcernIndex, setSelectedConcernIndex] = useState<number | null>(null);
  const [showOwnConcern, setShowOwnConcern] = useState(false);
  const [creationError, setCreationError] = useState("");
  const [ownConcern, setOwnConcern] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const path = useMemo(
    () => startPaths.find((item) => item.id === selectedPath) ?? startPaths[0],
    [selectedPath],
  );
  const visibleConcerns = useMemo(() => getVisibleConcerns(concernOffset), [concernOffset]);
  const selectedConcern =
    selectedConcernIndex === null ? null : visibleConcerns[selectedConcernIndex] ?? null;
  const directionCards = useMemo(() => {
    if (selectedPath === "develop") {
      return getDevelopDirections(idea, passage, response);
    }

    if (selectedPath === "week") {
      return getWeeklyConcernDirections(selectedConcern);
    }

    return getExploreDirections(theme, tone, ideaOffset);
  }, [idea, ideaOffset, passage, response, selectedConcern, selectedPath, theme, tone]);
  const isFinalStage = stage === stages.length - 1;
  const nextDisabled = isFinalStage && selectedDirection === null;

  function choosePath(nextPath: StartPathId) {
    setSelectedPath(nextPath);
    setSelectedDirection(null);
    setSelectedConcernIndex(null);

    if (nextPath !== "develop") {
      setIdea("");
      setPassage("");
      setResponse("");
    }

    if (nextPath !== "week") {
      setOwnConcern("");
      setShowOwnConcern(false);
    }
  }

  function refreshIdeas() {
    setIdeaOffset((current) => current + 5);
    setSelectedDirection(null);
  }

  function refreshConcerns() {
    setConcernOffset((current) => current + 5);
    setSelectedConcernIndex(null);
    setSelectedDirection(null);
  }

  async function createMessageDraft() {
    if (selectedDirection === null) return;
    setCreationError("");
    const direction = directionCards[selectedDirection];
    const pastoralFocus = direction.focus.replace(/^Preview sample:\s*/i, "");
    const mode = messageModes.find((item) => item.id === selectedMode) ?? messageModes[0];
    const selectedLength = messageLengths.find((item) => item.value === length) ?? messageLengths[1];
    const now = new Date().toISOString();
    const scriptureBank = buildScriptureBank({
      length,
      mainScripture: direction.scripture,
      directionTitle: direction.title,
      bigIdea: direction.bigIdea,
      angle: direction.angle,
      pastoralFocus,
    });
    const draft: MessageDraft = {
      id: `local-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      startingPath: selectedPath,
      startingPathLabel: path.label,
      messageMode: selectedMode,
      messageModeLabel: mode.label,
      directionTitle: direction.title,
      mainScripture: direction.scripture,
      mainScriptureText: getVerseText(direction.scripture),
      bigIdea: direction.bigIdea,
      angle: direction.angle,
      pastoralFocus,
      length,
      lengthLabel: selectedLength.label,
      translation,
      developIdea: selectedPath === "develop" ? idea.trim() : undefined,
      developPassage: selectedPath === "develop" ? passage.trim() : undefined,
      desiredResponse: selectedPath === "develop" ? response.trim() : undefined,
      weeklyConcern: selectedPath === "week" ? selectedConcern?.category ?? ownConcern.trim() : undefined,
      title: direction.title,
      contextNotes: buildContextNotes({
        mainScripture: direction.scripture,
        directionTitle: direction.title,
        bigIdea: direction.bigIdea,
      }),
      pastoralCareNote: buildPastoralCareNote({
        directionTitle: direction.title,
        bigIdea: direction.bigIdea,
        angle: direction.angle,
        pastoralFocus,
      }),
      scriptureBank,
      introduction: buildIntroduction({
        directionTitle: direction.title,
        mainScripture: direction.scripture,
        bigIdea: direction.bigIdea,
        angle: direction.angle,
        pastoralFocus,
      }),
      points: buildInitialPoints({
        length,
        directionTitle: direction.title,
        mainScripture: direction.scripture,
        bigIdea: direction.bigIdea,
        angle: direction.angle,
        pastoralFocus,
        scriptureBank,
      }),
      closing: buildClosing({
        directionTitle: direction.title,
        mainScripture: direction.scripture,
        bigIdea: direction.bigIdea,
        pastoralFocus,
      }),
    };

    setIsCreating(true);
    try {
      const response = await fetch("/api/message-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: cleanMessageDraft(draft) }),
      });
      const payload = (await response.json()) as { project?: { id: string }; error?: string };
      if (!response.ok || !payload.project) {
        setCreationError(payload.error ?? "This message project could not be created right now.");
        return;
      }
      router.push(`/message-workspace?project=${payload.project.id}`);
    } catch {
      setCreationError("This message project could not be created right now.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-line bg-cream-strong p-5">
        <ol className="grid gap-3 md:grid-cols-4">
          {stages.map((item, index) => (
            <li key={item} className="flex items-center gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  index <= stage ? "bg-teal text-cream-strong" : "bg-background text-muted"
                }`}
              >
                {index + 1}
              </span>
              <span className={`text-sm font-bold ${index === stage ? "text-teal" : "text-muted"}`}>
                {item}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-line bg-cream-strong p-6">
        {stage === 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-ink">Choose a starting path</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Built to support sermon preparation, not replace the pastor.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {startPaths.map((item) => {
                const selected = selectedPath === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choosePath(item.id)}
                    className={`premium-card rounded-3xl border p-5 text-left ${
                      selected
                        ? "selected-card premium-card-dark border-2 border-gold bg-teal text-cream-strong shadow-[0_22px_52px_rgba(0,47,49,0.24)]"
                        : "border-line bg-cream-strong text-ink"
                    }`}
                    aria-pressed={selected}
                  >
                    <span
                      className={`grid size-11 place-items-center rounded-2xl text-sm font-bold ${
                        selected ? "bg-cream-strong text-teal" : "bg-teal text-cream-strong"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`text-lg font-bold ${
                          selected ? "text-cream-strong" : "text-ink"
                        }`}
                      >
                        {item.label}
                      </span>
                      {selected ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gold/70 bg-gold/20 px-3 py-1 text-xs font-bold text-cream-strong">
                          <span aria-hidden="true" className="text-gold">
                            ✓
                          </span>
                          Selected
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`mt-2 block text-sm leading-6 ${
                        selected ? "text-cream-strong/85" : "text-muted"
                      }`}
                    >
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {stage === 1 ? (
          <div>
            <h2 className="text-2xl font-bold text-ink">{path.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              The pastor remains in control of Scripture study, conviction, calling, voice, final
              message, and theological judgment.
            </p>

            <div className="mt-6 rounded-3xl border border-line bg-background p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-ink">Message mode</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Solo includes Sunday Sermon and Special Service. Ministry Plus modes are shown
                    here as locked previews.
                  </p>
                </div>
                <span className="rounded-full bg-gold/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-teal">
                  Solo preview
                </span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-4">
                {messageModes.map((mode) => {
                  const selected = selectedMode === mode.id;
                  const selectable = !mode.locked;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      disabled={!selectable}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`rounded-2xl border p-4 text-left ${
                        selected && selectable
                          ? "selected-card border-2 border-gold bg-teal text-cream-strong shadow-[0_16px_32px_rgba(0,47,49,0.18)]"
                          : mode.locked
                            ? "cursor-not-allowed border-line bg-cream text-muted opacity-85"
                            : "border-line bg-cream-strong text-ink"
                      }`}
                      aria-pressed={selected && selectable}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span
                          className={`font-bold ${
                            selected && selectable ? "text-cream-strong" : "text-ink"
                          }`}
                        >
                          {mode.label}
                        </span>
                        {selected && selectable ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-1 text-xs font-bold text-cream-strong">
                            <span aria-hidden="true" className="text-gold">
                              ✓
                            </span>
                            Selected
                          </span>
                        ) : null}
                        {mode.badge ? (
                          <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-bold text-teal">
                            {mode.badge}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`mt-3 block text-sm leading-6 ${
                          selected && selectable ? "text-cream-strong/85" : "text-muted"
                        }`}
                      >
                        {mode.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPath === "explore" ? (
              <div className="mt-6 grid gap-5">
                <div>
                  <h3 className="text-xl font-bold text-ink">
                    Give My Pulpit Pro a little direction, or let it surprise you.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Everything here is optional. Leave every field blank and My Pulpit Pro will
                    still give you five fresh sermon directions to explore.
                  </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="theme">Optional theme selector</FieldLabel>
                    <select
                      id="theme"
                      value={theme}
                      onChange={(event) => setTheme(event.target.value)}
                      className="min-h-12 rounded-2xl border border-line bg-background px-4"
                    >
                      {themes.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="tone">Optional tone selector</FieldLabel>
                    <select
                      id="tone"
                      value={tone}
                      onChange={(event) => setTone(event.target.value)}
                      className="min-h-12 rounded-2xl border border-line bg-background px-4"
                    >
                      {tones.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedPath === "develop" ? (
              <div className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <FieldLabel htmlFor="heart-idea">What idea is tugging at your heart?</FieldLabel>
                  <textarea
                    id="heart-idea"
                    rows={4}
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    className="rounded-2xl border border-line bg-background p-4 text-ink"
                  />
                </div>
                <div className="grid gap-2">
                  <FieldLabel htmlFor="scripture">Optional Scripture passage</FieldLabel>
                  <input
                    id="scripture"
                    value={passage}
                    onChange={(event) => setPassage(event.target.value)}
                    className="min-h-12 rounded-2xl border border-line bg-background px-4"
                    placeholder="Example: Psalm 13"
                  />
                </div>
                <div className="grid gap-2">
                  <FieldLabel htmlFor="response">
                    What do you want people to understand, feel, or do?
                  </FieldLabel>
                  <textarea
                    id="response"
                    rows={4}
                    value={response}
                    onChange={(event) => setResponse(event.target.value)}
                    className="rounded-2xl border border-line bg-background p-4 text-ink"
                  />
                </div>
              </div>
            ) : null}

            {selectedPath === "week" ? (
              <div className="mt-6 grid gap-5">
                <div>
                  <h3 className="text-xl font-bold text-ink">What are people carrying this week?</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Explore timely concerns that may be weighing on your congregation, then choose a
                    Scripture-centered direction that speaks to the deeper need beneath the
                    headlines.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-5">
                  {visibleConcerns.map((concern, index) => {
                    const selected = selectedConcernIndex === index;

                    return (
                      <article
                        key={`${concern.category}-${concern.suggestedRefs}`}
                        className={`rounded-3xl border p-4 ${
                          selected
                            ? "selected-card border-2 border-gold bg-teal text-cream-strong shadow-[0_18px_38px_rgba(0,47,49,0.2)]"
                            : "border-line bg-background"
                        }`}
                      >
                        <div className="flex min-h-full flex-col gap-3">
                          <div>
                            <h4
                              className={`font-bold ${
                                selected ? "text-cream-strong" : "text-ink"
                              }`}
                            >
                              {concern.category}
                            </h4>
                            <p
                              className={`mt-2 text-sm leading-6 ${
                                selected ? "text-cream-strong/85" : "text-muted"
                              }`}
                            >
                              {concern.context}
                            </p>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <p className={selected ? "text-cream-strong/85" : "text-muted"}>
                              <span
                                className={`font-bold ${selected ? "text-gold" : "text-teal"}`}
                              >
                                Deeper theme:
                              </span>{" "}
                              {concern.pastoralTheme}
                            </p>
                            <p className={selected ? "text-cream-strong/85" : "text-muted"}>
                              <span
                                className={`font-bold ${selected ? "text-gold" : "text-teal"}`}
                              >
                                Direction:
                              </span>{" "}
                              {concern.possibleDirection}
                            </p>
                            <p className={selected ? "text-cream-strong/85" : "text-muted"}>
                              <span
                                className={`font-bold ${selected ? "text-gold" : "text-teal"}`}
                              >
                                References:
                              </span>{" "}
                              {concern.suggestedRefs}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedConcernIndex(index);
                              setSelectedDirection(null);
                            }}
                            className={`mt-auto min-h-11 rounded-full px-4 py-2 text-sm font-bold ${
                              selected ? "bg-gold text-teal-dark" : "bg-teal text-cream-strong"
                            }`}
                          >
                            Build Around This
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={refreshConcerns}
                    className="min-h-12 w-fit rounded-full bg-teal px-6 py-3 text-sm font-bold text-cream-strong"
                  >
                    Refresh This Week&apos;s Concerns
                  </button>
                  <p className="text-sm font-semibold text-muted">
                    Live current-event and holiday suggestions will be connected in a later phase.
                  </p>
                </div>
                <div className="rounded-3xl border border-line bg-background p-5">
                  <button
                    type="button"
                    onClick={() => setShowOwnConcern((current) => !current)}
                    className="text-sm font-bold text-teal hover:text-teal-dark"
                  >
                    I want to enter my own concern instead
                  </button>
                  {showOwnConcern ? (
                    <div className="mt-4 grid gap-2">
                      <FieldLabel htmlFor="own-concern">Your concern</FieldLabel>
                      <textarea
                        id="own-concern"
                        rows={4}
                        value={ownConcern}
                        onChange={(event) => setOwnConcern(event.target.value)}
                        className="rounded-2xl border border-line bg-cream-strong p-4 text-ink"
                        placeholder="Keep this pastoral and congregation-focused rather than political or news-driven."
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {stage === 2 ? (
          <div>
            <h2 className="text-2xl font-bold text-ink">Length and translation</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {messageLengths.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLength(item.value)}
                  className={`premium-card rounded-3xl border p-5 text-left ${
                    length === item.value
                      ? "selected-card border-2 border-gold bg-teal text-cream-strong shadow-[0_18px_38px_rgba(0,47,49,0.2)]"
                      : "border-line bg-cream-strong text-ink"
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${
                      length === item.value ? "text-cream-strong" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`mt-3 block text-sm leading-7 ${
                      length === item.value ? "text-cream-strong/85" : "text-muted"
                    }`}
                  >
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <FieldLabel htmlFor="translation">Bible translation preference</FieldLabel>
              <select
                id="translation"
                value={translation}
                onChange={(event) => setTranslation(event.target.value)}
                className="min-h-12 rounded-2xl border border-line bg-background px-4"
              >
                {translations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <p className="text-sm leading-6 text-muted">
                Exact Bible text will later be retrieved from properly licensed or public-domain
                sources. This preview only saves the selected preference.
              </p>
            </div>
          </div>
        ) : null}

        {stage === 3 ? (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-ink">Explore directions</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Sample data for preview only. Exploring message ideas does not use one of your
                  monthly projects.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedPath === "explore" ? (
                  <button
                    type="button"
                    onClick={refreshIdeas}
                    className="min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-bold text-teal-dark"
                  >
                    Refresh Ideas
                  </button>
                ) : null}
                <span className="rounded-full bg-gold/20 px-4 py-2 text-sm font-bold text-teal">
                  Five preview cards
                </span>
              </div>
            </div>

            {selectedPath === "develop" && (idea.trim() || passage.trim() || response.trim()) ? (
              <div className="mt-5 rounded-3xl border border-line bg-background p-5">
                <h3 className="font-bold text-ink">Based on your message direction</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {idea.trim() ? idea.trim() : "No main idea entered yet."}
                  {passage.trim() ? ` Passage preference: ${passage.trim()}.` : ""}
                  {response.trim() ? ` Desired response: ${response.trim()}` : ""}
                </p>
              </div>
            ) : null}

            {selectedPath === "week" && selectedConcern ? (
              <div className="mt-5 rounded-3xl border border-line bg-background p-5">
                <h3 className="font-bold text-ink">Built around {selectedConcern.category}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {selectedConcern.pastoralTheme} Suggested references:{" "}
                  {selectedConcern.suggestedRefs}
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              {directionCards.map((direction, index) => (
                <article
                  key={`${direction.title}-${index}`}
                  className="premium-card rounded-3xl border border-line bg-background p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-ink">{direction.title}</h3>
                      <p className="mt-1 text-sm font-bold text-teal">{direction.scripture}</p>
                      <p className="mt-3 text-sm font-bold text-ink">
                        Big idea: {direction.bigIdea}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">{direction.angle}</p>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        Focus: {direction.focus}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDirection(index)}
                      className={`min-h-11 shrink-0 rounded-full px-5 py-2 text-sm font-bold ${
                        selectedDirection === index
                          ? "bg-gold text-teal-dark"
                          : "bg-teal text-cream-strong"
                      }`}
                    >
                      Select This Direction
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {selectedDirection !== null ? (
              <div className="mt-6 rounded-3xl border border-teal/20 bg-cream p-5">
                <h3 className="text-xl font-bold text-teal">Review selected direction</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {directionCards[selectedDirection].title} is selected. Creating the full outline
                  will count as 1 of your 10 monthly message projects. You may edit, rewrite,
                  rearrange, and rebuild content in this local
                  preview without using another project.
                </p>
              </div>
            ) : null}
            {creationError ? (
              <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm font-bold text-teal">
                {creationError}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setStage((current) => Math.max(0, current - 1))}
            disabled={stage === 0}
            className="min-h-11 rounded-full border border-line px-5 py-2 text-sm font-bold text-teal disabled:cursor-not-allowed disabled:opacity-45"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (isFinalStage) {
                createMessageDraft();
                return;
              }
              setStage((current) => Math.min(stages.length - 1, current + 1));
            }}
            disabled={nextDisabled || isCreating}
            className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isCreating ? "Creating..." : isFinalStage ? "Create Message" : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}

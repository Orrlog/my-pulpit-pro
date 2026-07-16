import { buildClosing, buildContextNotes, buildInitialPoints, buildIntroduction, buildPastoralCareNote, buildScriptureBank, cleanMessageDraft, getVerseText, mergeGenerationHistory, type MessageDraft } from "@/components/app-shell/message-draft-storage";
import type { DevelopMessageGenerationInput } from "./develop-types";

export function buildCuratedDevelopDraft(input: DevelopMessageGenerationInput): MessageDraft {
  const now = new Date().toISOString();
  const pastoralFocus = input.direction.focus.replace(/^Preview sample:\s*/i, "");
  const base = { length: input.length, mainScripture: input.direction.scripture, directionTitle: input.direction.title, bigIdea: input.direction.bigIdea, angle: input.direction.angle, pastoralFocus };
  const scriptureBank = buildScriptureBank(base);
  const points = buildInitialPoints({ ...base, scriptureBank });
  const draft: MessageDraft = {
    id: `fallback-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    startingPath: "develop",
    startingPathLabel: input.startingPathLabel,
    messageMode: input.messageMode,
    messageModeLabel: input.messageModeLabel,
    directionTitle: input.direction.title,
    mainScripture: input.direction.scripture,
    mainScriptureText: getVerseText(input.direction.scripture),
    bigIdea: input.direction.bigIdea,
    angle: input.direction.angle,
    pastoralFocus,
    length: input.length,
    lengthLabel: input.lengthLabel,
    translation: input.translation,
    developIdea: input.developIdea,
    developPassage: input.developPassage,
    desiredResponse: input.desiredResponse,
    title: input.direction.title,
    contextNotes: buildContextNotes(base),
    pastoralCareNote: buildPastoralCareNote(base),
    scriptureBank,
    introduction: buildIntroduction(base),
    points,
    closing: buildClosing(base),
  };
  return cleanMessageDraft({ ...draft, generationHistory: mergeGenerationHistory(draft, points) });
}

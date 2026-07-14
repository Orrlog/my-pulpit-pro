import type { StartPathId } from "./data";

export const MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v1";

export type MessageDraftPoint = {
  id: string;
  title: string;
  mainVerse: string;
  explanation: string;
  application: string;
  status?: "kept" | "rewritten";
};

export type MessageDraft = {
  id: string;
  createdAt: string;
  updatedAt: string;
  startingPath: StartPathId;
  startingPathLabel: string;
  messageMode: string;
  messageModeLabel: string;
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
  length: string;
  lengthLabel: string;
  translation: string;
  developIdea?: string;
  developPassage?: string;
  desiredResponse?: string;
  weeklyConcern?: string;
  title: string;
  introduction: string;
  points: MessageDraftPoint[];
  application: string;
  closingPrayer: string;
};

export function getPointCount(length: string) {
  if (length === "30") return 3;
  if (length === "60") return 5;
  return 4;
}

export function buildInitialPoints(input: {
  length: string;
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
}): MessageDraftPoint[] {
  const count = getPointCount(input.length);
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const isOpening = index === 0;
    const isClosing = index === count - 1;
    return {
      id: `${Date.now()}-${number}`,
      title: isOpening
        ? `Begin with ${input.directionTitle}`
        : isClosing
          ? `Practice the faithful response`
          : `Let the big idea shape point ${number}`,
      mainVerse: input.mainScripture,
      explanation: isOpening
        ? `${input.angle} Use this point to introduce the congregation to the main tension in ${input.mainScripture}.`
        : isClosing
          ? `${input.bigIdea} Bring the message toward a clear, pastorally grounded response.`
          : `${input.bigIdea} Develop this point with attention to ${input.pastoralFocus.toLowerCase()}.`,
      application: isClosing
        ? `Invite listeners to take one concrete step connected to ${input.pastoralFocus.toLowerCase()}.`
        : `Help listeners connect ${input.mainScripture} to ordinary decisions, relationships, and prayer this week.`,
    };
  });
}

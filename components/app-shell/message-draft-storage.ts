import type { StartPathId } from "./data";

export const MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v2";
export const LEGACY_MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v1";

export type MessageDraftIntroduction = {
  hook: string;
  pastoralTension: string;
  passageConnection: string;
  bigIdeaBridge: string;
  firstMovementTransition: string;
};

export type MessageDraftClosing = {
  recap: string;
  callToResponse: string;
  closingApplication: string;
  prayer: string;
};

export type MessageDraftPoint = {
  id: string;
  title: string;
  scripture: string;
  bullets: string[];
  explanation: string;
  application: string;
  illustration: string;
  transition: string;
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
  scriptureBank: string[];
  introduction: MessageDraftIntroduction;
  points: MessageDraftPoint[];
  closing: MessageDraftClosing;
};

type LegacyDraft = Partial<Omit<MessageDraft, "introduction" | "points" | "closing">> & {
  introduction?: string | Partial<MessageDraftIntroduction>;
  points?: Array<Partial<MessageDraftPoint> & { mainVerse?: string }>;
  application?: string;
  closingPrayer?: string;
  closing?: Partial<MessageDraftClosing>;
};

const scripturePools: Record<string, string[]> = {
  grief: ["Psalm 13:1-6", "Psalm 34:18", "John 11:32-36", "Romans 8:18-25", "2 Corinthians 1:3-7", "1 Thessalonians 4:13-18", "Revelation 21:1-5", "Lamentations 3:21-24", "Matthew 5:4", "1 Peter 1:3-9"],
  forgiveness: ["Matthew 18:21-35", "Ephesians 4:31-32", "Colossians 3:12-15", "Romans 12:17-21", "Luke 23:32-34", "Psalm 103:8-12", "Micah 6:8", "2 Corinthians 5:18-21", "Matthew 6:12-15", "Proverbs 19:11"],
  anxiety: ["Philippians 4:4-9", "Matthew 6:25-34", "1 Peter 5:6-7", "Psalm 46:1-3", "Isaiah 26:3-4", "John 14:25-27", "Romans 8:31-39", "Psalm 23:1-6", "2 Timothy 1:7", "Hebrews 13:5-6"],
  courage: ["Joshua 1:1-9", "Psalm 27:1-5", "Isaiah 41:10", "2 Timothy 1:6-7", "Acts 4:18-31", "Hebrews 12:1-3", "Deuteronomy 31:6", "Romans 15:13", "1 Corinthians 16:13-14", "Ephesians 6:10-18"],
  faithfulness: ["Galatians 6:7-10", "1 Corinthians 15:58", "Hebrews 12:1-3", "Colossians 3:17", "Psalm 1:1-6", "Matthew 25:14-30", "James 1:2-8", "2 Thessalonians 3:13", "Micah 6:8", "John 15:1-8"],
  hope: ["Romans 15:13", "Psalm 42:5-11", "1 Peter 1:3-9", "Isaiah 40:28-31", "Lamentations 3:21-24", "Hebrews 6:17-20", "Romans 5:1-5", "2 Corinthians 4:16-18", "Titus 2:11-14", "Revelation 21:1-5"],
  default: ["Psalm 46:1-3", "Proverbs 3:5-6", "Matthew 6:25-34", "John 15:1-8", "Romans 12:1-2", "Romans 15:13", "Galatians 6:9-10", "Philippians 4:4-9", "Colossians 3:12-17", "Hebrews 12:1-3", "James 1:22-25", "1 Peter 5:6-11"],
};

const progressionLabels = [
  "Name the tension",
  "Enter the passage",
  "See the central truth",
  "Let the Word search the heart",
  "Practice the first faithful response",
  "Receive encouragement for the weary",
  "Put faith into action",
  "Reflect with the church family",
  "Choose the next obedient step",
  "Close with hope and resolve",
];

export function getPointCount(length: string) {
  if (length === "30") return 6;
  if (length === "60") return 10;
  return 8;
}

export function buildScriptureBank(input: {
  length: string;
  mainScripture: string;
  directionTitle: string;
  bigIdea: string;
  pastoralFocus: string;
  angle: string;
}) {
  const needed = getPointCount(input.length);
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle} ${input.mainScripture}`.toLowerCase();
  const topic = Object.keys(scripturePools).find((key) => key !== "default" && haystack.includes(key));
  const pool = [...(topic ? scripturePools[topic] : []), ...scripturePools.default];
  const unique = pool.filter((ref, index, list) => list.indexOf(ref) === index && ref !== input.mainScripture);
  return unique.slice(0, Math.max(needed, 6));
}

export function buildIntroduction(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
}): MessageDraftIntroduction {
  return {
    hook: `Open with a familiar moment when people know the right direction but feel the weight of taking the next faithful step: ${input.directionTitle}.`,
    pastoralTension: `${input.angle} Name the burden honestly without rushing past the questions, weariness, or resistance people may be carrying into the room.`,
    passageConnection: `Invite the church to listen to ${input.mainScripture} as the anchor passage, paying attention to how the text speaks to real life rather than using it as a slogan.`,
    bigIdeaBridge: `State the central burden clearly: ${input.bigIdea}`,
    firstMovementTransition: `Move from the congregation's lived tension into the biblical world of the passage so the message begins with Scripture-shaped clarity.`,
  };
}

export function buildClosing(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  pastoralFocus: string;
}): MessageDraftClosing {
  return {
    recap: `Bring the movements back together: the message began with the tension behind ${input.directionTitle}, listened to ${input.mainScripture}, and traced a faithful response shaped by this truth: ${input.bigIdea}`,
    callToResponse: `Call listeners to respond with one concrete act of trust, repentance, courage, mercy, or obedience that fits ${input.pastoralFocus}.`,
    closingApplication: `Encourage the church to carry the message into one conversation, decision, habit, or prayer this week rather than leaving it as an idea only considered during the sermon.`,
    prayer: `Lord, let Your Word take root in us. Give us humility to receive it, courage to obey it, tenderness toward one another, and hope that rests in Your faithful care. Amen.`,
  };
}

export function buildInitialPoints(input: {
  length: string;
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
  scriptureBank?: string[];
}): MessageDraftPoint[] {
  const count = getPointCount(input.length);
  const bank = input.scriptureBank?.length
    ? input.scriptureBank
    : buildScriptureBank(input);

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const label = progressionLabels[index] ?? `Carry the message forward ${number}`;
    const scripture = bank[index % bank.length] ?? input.mainScripture;
    const next = progressionLabels[index + 1]?.toLowerCase();
    return {
      id: `${Date.now()}-${number}`,
      title: `${label}: ${input.directionTitle}`,
      scripture,
      bullets: [
        `Connect this movement to ${input.mainScripture} without losing the thread of the whole message.`,
        `Show how this part of the progression serves the central truth: ${input.bigIdea}`,
        `Name the pastoral reality behind ${input.pastoralFocus} in concrete, congregation-level language.`,
      ],
      explanation: `${label} develops the sermon by moving from ${input.angle.toLowerCase()} toward the hope and obedience held out in ${input.mainScripture}. Keep this section rooted in the selected direction while giving the pastor enough material to trim for the room and moment.`,
      application: `Ask the congregation to practice a distinct response here: identify where this truth touches their decisions, relationships, prayers, or endurance this week in light of ${input.pastoralFocus}.`,
      illustration: `Consider a brief story, pastoral observation, or everyday example where someone faces this part of the journey and needs the truth of ${scripture} brought near with care.`,
      transition: next
        ? `Transition by showing how this movement prepares the church to ${next}.`
        : `Transition into the closing by gathering the message around ${input.bigIdea}`,
    };
  });
}

function isIntroduction(value: unknown): value is MessageDraftIntroduction {
  return Boolean(value && typeof value === "object" && "hook" in value);
}

function isClosing(value: unknown): value is MessageDraftClosing {
  return Boolean(value && typeof value === "object" && "recap" in value);
}

export function normalizeMessageDraft(raw: unknown): MessageDraft | null {
  if (!raw || typeof raw !== "object") return null;

  const legacy = raw as LegacyDraft;
  const mainScripture = legacy.mainScripture ?? "Selected main passage";
  const directionTitle = legacy.directionTitle ?? legacy.title ?? "Untitled message";
  const bigIdea = legacy.bigIdea ?? "God's Word invites a faithful response in ordinary life.";
  const pastoralFocus = (legacy.pastoralFocus ?? "Pastoral care, faithful response, and congregational encouragement.").replace(/^Preview sample:\s*/i, "");
  const angle = legacy.angle ?? "A Scripture-centered message direction for the congregation.";
  const length = legacy.length ?? "45";
  const base = { length, mainScripture, directionTitle, bigIdea, pastoralFocus, angle };
  const scriptureBank = Array.isArray(legacy.scriptureBank) && legacy.scriptureBank.length
    ? legacy.scriptureBank.filter(Boolean)
    : buildScriptureBank(base);
  const introduction = isIntroduction(legacy.introduction)
    ? { ...buildIntroduction(base), ...legacy.introduction }
    : { ...buildIntroduction(base), hook: typeof legacy.introduction === "string" ? legacy.introduction : buildIntroduction(base).hook };
  const closing = isClosing(legacy.closing)
    ? { ...buildClosing(base), ...legacy.closing }
    : { ...buildClosing(base), closingApplication: legacy.application ?? buildClosing(base).closingApplication, prayer: legacy.closingPrayer ?? buildClosing(base).prayer };
  const generated = buildInitialPoints({ ...base, scriptureBank });
  const points = Array.isArray(legacy.points) && legacy.points.length
    ? legacy.points.map((point, index) => ({
        ...generated[index % generated.length],
        id: point.id ?? `upgraded-${Date.now()}-${index}`,
        title: point.title ?? generated[index % generated.length].title,
        scripture: point.scripture ?? point.mainVerse ?? scriptureBank[index % scriptureBank.length] ?? mainScripture,
        bullets: Array.isArray(point.bullets) && point.bullets.length ? point.bullets : generated[index % generated.length].bullets,
        explanation: point.explanation ?? generated[index % generated.length].explanation,
        application: point.application ?? generated[index % generated.length].application,
        illustration: point.illustration ?? generated[index % generated.length].illustration,
        transition: point.transition ?? generated[index % generated.length].transition,
        status: point.status,
      }))
    : generated;

  return {
    id: legacy.id ?? `local-${Date.now()}`,
    createdAt: legacy.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startingPath: legacy.startingPath ?? "explore",
    startingPathLabel: legacy.startingPathLabel ?? "Explore Message Ideas",
    messageMode: legacy.messageMode ?? "sunday",
    messageModeLabel: legacy.messageModeLabel ?? "Sunday Sermon",
    directionTitle,
    mainScripture,
    bigIdea,
    angle,
    pastoralFocus,
    length,
    lengthLabel: legacy.lengthLabel ?? `${length} minutes`,
    translation: legacy.translation ?? "King James Version, KJV",
    developIdea: legacy.developIdea,
    developPassage: legacy.developPassage,
    desiredResponse: legacy.desiredResponse,
    weeklyConcern: legacy.weeklyConcern,
    title: legacy.title ?? directionTitle,
    scriptureBank,
    introduction,
    points,
    closing,
  };
}

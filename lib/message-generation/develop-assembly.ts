import { cleanMessageDraft, getPointCount, getVerseText, mergeGenerationHistory, normalizeActiveScriptureBank, type MessageDraft, type MessageDraftPoint } from "@/components/app-shell/message-draft-storage";
import type { GeneratedDevelopMessage } from "./develop-schema";
import type { DevelopMessageGenerationInput } from "./develop-types";

const books = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalm","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const bookPattern = `(?:${books.map((b)=>b.replace(/ /g,"\\s+")).join("|")})`;
const referencePattern = new RegExp(`^${bookPattern}\\s+\\d{1,3}(?::\\d{1,3}(?:[-–]\\d{1,3})?)?(?:[-–]\\d{1,3}(?::\\d{1,3})?)?$`, "i");
const badSuffix = /\b(again|revisited|part\s*2|another look|a fresh word|again in daily life)$/i;
function norm(value:string){return value.trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
export function isValidScriptureReference(value: string) { return referencePattern.test(value.trim()); }

export function validateGeneratedDevelopMessage(input: DevelopMessageGenerationInput, generated: GeneratedDevelopMessage): string[] {
  const errors: string[] = [];
  const pointCount = getPointCount(input.length);
  if (generated.points.length !== pointCount) errors.push("wrong-point-count");
  if (!generated.title.trim()) errors.push("missing-title");
  const intro = generated.introduction;
  [intro.hook,intro.pastoralTension,intro.passageConnection,intro.bigIdeaBridge,intro.explanation,intro.firstMovementTransition].forEach((v,i)=>{ if(!v.trim()) errors.push(`missing-intro-${i}`); });
  const closing = generated.closing;
  [closing.recap,closing.callToResponse,closing.closingApplication,closing.prayer].forEach((v,i)=>{ if(!v.trim()) errors.push(`missing-closing-${i}`); });
  const titles = new Set<string>();
  const scriptures = new Set<string>();
  const pointObjects = new Set<string>();
  for (const point of generated.points) {
    const title = norm(point.title);
    if (titles.has(title)) errors.push("duplicate-title");
    if (badSuffix.test(point.title)) errors.push("duplicate-title-suffix");
    titles.add(title);
    const objectKey = JSON.stringify(point);
    if (pointObjects.has(objectKey)) errors.push("duplicate-point-object");
    pointObjects.add(objectKey);
    if (!point.scripture.trim()) errors.push("empty-scripture");
    if (!isValidScriptureReference(point.scripture)) errors.push("bad-scripture");
    const scr = norm(point.scripture);
    if (scriptures.has(scr) && generated.points.length <= books.length) errors.push("duplicate-scripture");
    scriptures.add(scr);
    if (point.bullets.length < 2) errors.push("few-bullets");
    if (point.illustrationOptions.length < 2) errors.push("few-illustrations");
    if (!point.explanation.trim()) errors.push("missing-explanation");
    if (!point.application.trim()) errors.push("missing-application");
    if (!point.transition.trim()) errors.push("missing-transition");
    if ("id" in point || "notes" in point) errors.push("model-owned-fields");
  }
  return Array.from(new Set(errors));
}

export function assembleDevelopMessageDraft(input: DevelopMessageGenerationInput, generated: GeneratedDevelopMessage): MessageDraft {
  const now = new Date().toISOString();
  const pastoralFocus = input.direction.focus.replace(/^Preview sample:\s*/i, "");
  const points: MessageDraftPoint[] = generated.points.map((point, index) => ({
    id: `generated-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
    title: point.title,
    summary: point.summary,
    scripture: point.scripture,
    scriptureText: getVerseText(point.scripture),
    bullets: point.bullets,
    explanation: point.explanation,
    application: point.application,
    illustrationOptions: point.illustrationOptions,
    transition: point.transition,
    optionalResponseMoment: point.optionalResponseMoment,
    includeOptionalResponse: false,
    notes: "",
  }));
  const draft: MessageDraft = {
    id: `generated-${Date.now()}`,
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
    title: generated.title,
    contextNotes: generated.contextNotes,
    pastoralCareNote: generated.pastoralCareNote ? { text: generated.pastoralCareNote, includeInPulpit: false } : undefined,
    scriptureBank: [],
    introduction: { ...generated.introduction, scriptureText: generated.introduction.scripture ? getVerseText(generated.introduction.scripture) : undefined, notes: "" },
    points,
    closing: { ...generated.closing, scriptureText: generated.closing.scripture ? getVerseText(generated.closing.scripture) : undefined, notes: "" },
  };
  const withBank = { ...draft, scriptureBank: normalizeActiveScriptureBank(draft) };
  return cleanMessageDraft({ ...withBank, generationHistory: mergeGenerationHistory(withBank, points) });
}

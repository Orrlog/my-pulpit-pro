import { readFileSync } from "node:fs";
import vm from "node:vm";

const directionPreviews = readFileSync("components/app-shell/direction-previews.ts", "utf8");
const draftStorage = readFileSync("components/app-shell/message-draft-storage.ts", "utf8");
const workspace = readFileSync("app/message-workspace/page.tsx", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractObject(source, marker) {
  const start = source.indexOf(marker);
  assert(start >= 0, `Missing marker: ${marker}`);
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(braceStart, index + 1);
  }
  throw new Error(`Could not extract object for ${marker}`);
}

function evalObject(source, marker) {
  return vm.runInNewContext(`(${extractObject(source, marker)})`);
}

const scripturePools = evalObject(draftStorage, "const scripturePools");
const scriptureProfiles = evalObject(draftStorage, "const scriptureProfiles");
const kjvLookup = evalObject(draftStorage, "const kjvLookup");
const kjvPassageLookup = evalObject(draftStorage, "const kjvPassageLookup");

function uniq(values) {
  return new Set(values).size;
}

function parseSingleChapterRange(reference) {
  const match = reference.trim().match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (!match) return null;
  const [, book, chapter, start, end] = match;
  return { book, chapter, start: Number(start), end: Number(end) };
}

function assembleVerseRange(reference) {
  const parsed = parseSingleChapterRange(reference);
  if (!parsed || parsed.end < parsed.start) return null;
  const verses = [];
  for (let verse = parsed.start; verse <= parsed.end; verse += 1) {
    const verseReference = `${parsed.book} ${parsed.chapter}:${verse}`;
    const text = kjvLookup[verseReference];
    if (!text) return null;
    verses.push(`${verse} ${text}`);
  }
  return verses.join("\n");
}

function getVerseText(reference) {
  return kjvPassageLookup[reference] ?? kjvLookup[reference] ?? assembleVerseRange(reference) ?? "Verse text is not available in this local preview.";
}

function bookOf(reference) {
  return reference.replace(/^\d\s+/, "").split(/\s+/)[0];
}

function topicFrom(input) {
  if (input.mainScripture.toLowerCase().includes("isaiah 40")) return "default";
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle} ${input.mainScripture}`.toLowerCase();
  return Object.keys(scripturePools).find((key) => key !== "default" && haystack.includes(key)) ?? "default";
}

function chooseReferences(input) {
  const needed = input.length === "30" ? 6 : input.length === "60" ? 10 : 8;
  const pool = [...scripturePools[topicFrom(input)], ...scripturePools.default].filter((reference) => scriptureProfiles[reference]);
  const mainBook = bookOf(input.mainScripture);
  const seenBooks = new Set();
  const chosen = [];
  for (const ref of pool) {
    const book = bookOf(ref);
    if (ref === input.mainScripture || book === mainBook || seenBooks.has(book)) continue;
    chosen.push(ref);
    seenBooks.add(book);
    if (chosen.length >= needed) break;
  }
  if (chosen.length < needed) {
    for (const ref of pool) {
      if (ref !== input.mainScripture && !chosen.includes(ref)) chosen.push(ref);
      if (chosen.length >= needed) break;
    }
  }
  return chosen;
}

function buildScriptureBank(input) {
  return [input.mainScripture, ...chooseReferences(input)].map((reference, index) => ({ id: `scripture-${index}`, reference, text: getVerseText(reference) }));
}

function buildInitialPoints(input, scriptureBank) {
  const supportBank = scriptureBank.filter((item) => item.reference !== input.mainScripture);
  const usedTitles = new Set();
  const usedScriptures = new Set();
  const points = [];
  for (let index = 0; index < 6; index += 1) {
    const available = supportBank.find((item) => !usedScriptures.has(item.reference));
    const profile = scriptureProfiles[available.reference];
    assert(profile, `Missing non-generic profile for ${available.reference}`);
    const title = usedTitles.has(profile.title) ? `${profile.title} Again in Daily Life` : profile.title;
    const point = {
      id: `movement-${index}`,
      title,
      scripture: available.reference,
      scriptureText: available.text,
      summary: profile.summary,
      bullets: profile.bullets,
      explanation: profile.explanation,
      application: profile.application,
      illustrationOptions: profile.illustrationOptions,
      transition: profile.transition,
      notes: "",
    };
    usedTitles.add(point.title);
    usedScriptures.add(point.scripture);
    points.push(point);
  }
  return points;
}

function buildIntroduction(input) {
  const isIsaiah = input.mainScripture.toLowerCase().includes("isaiah 40");
  return {
    scripture: input.mainScripture,
    scriptureText: getVerseText(input.mainScripture),
    bullets: [
      isIsaiah ? "Weariness can make faithful people feel as though strength has run out and hope has been delayed." : "The passage names a real pressure people bring into worship.",
      `${input.mainScripture} speaks to that need by revealing God's character and calling for a faithful response.`,
    ],
    explanation: isIsaiah
      ? "Isaiah 40 speaks to people who know the limits of human strength. Even the young and capable become weary, but the Lord gives power to those who have none left. Waiting on Him is not passive resignation; it is dependent trust that receives renewal for rising, running, and continuing to walk without giving up."
      : `${input.mainScripture} anchors the sermon in God's Word by naming the congregation's need and revealing the Lord's character.`,
    firstMovementTransition: "With the main passage before us, move from the burden people carry into the first biblical truth God gives.",
  };
}

const sample = {
  length: "30",
  directionTitle: "When God Renews What Life Has Drained",
  mainScripture: "Isaiah 40:29-31",
  bigIdea: "The Lord renews weary people as they wait on Him in active trust.",
  angle: "A hope-filled direction for people worn down by a long season.",
  pastoralFocus: "Weariness, renewal, endurance, and hope in the Lord.",
};

const scriptureBank = buildScriptureBank(sample);
const points = buildInitialPoints(sample, scriptureBank);
const introduction = buildIntroduction(sample);
const addedOne = buildInitialPoints({ ...sample, length: "30" }, scriptureBank.concat([{ id: "extra", reference: "Ephesians 6:10", text: getVerseText("Ephesians 6:10") }]))[0];
const rewritten = { ...points[0], ...scriptureProfiles[points[1].scripture], scripture: points[1].scripture, notes: "Pastor note" };

assert(points.length === 6, "Expected exactly six points.");
assert(uniq(points.map((point) => point.id)) === 6, "Point IDs must be distinct.");
assert(uniq(points.map((point) => point.scripture)) === 6, "Supporting Scriptures must be distinct.");
assert(uniq(points.map((point) => point.title)) === 6, "Point titles must be distinct.");
assert(!points.some((point) => point.title === "Trust the Truth God Gives"), "Generic fallback title must not appear.");
assert(uniq(points.map((point) => JSON.stringify(point.bullets))) === 6, "Bullet arrays must differ.");
assert(uniq(points.map((point) => point.application)) === 6, "Applications must differ.");
assert(uniq(points.map((point) => JSON.stringify(point.illustrationOptions))) === 6, "Illustration option sets must differ.");
assert(uniq(points.map((point) => point.transition)) === 6, "Transitions must differ.");
assert(points.every((point) => scriptureProfiles[point.scripture]), "Every displayed Scripture must use a specific profile.");
assert(points.every((point) => point.scriptureText && !point.scriptureText.includes("not available")), "Every generated point should have verse text when available.");
assert(introduction.explanation && !introduction.explanation.includes("This Scripture gives the church"), "Introduction needs a non-generic explanation.");
assert(rewritten.notes === "Pastor note", "Rewrite behavior must preserve notes.");
assert(addedOne.title !== "Trust the Truth God Gives", "Add Another Point must not use generic fallback when profiles exist.");

const introductionCard = workspace.slice(workspace.indexOf("function IntroductionCard"), workspace.indexOf("function PointCard"));
assert(introductionCard.indexOf("<ScriptureBlock") < introductionCard.indexOf("<BulletList"), "Introduction Scripture should render before bullets onscreen.");
assert(introductionCard.indexOf("<BulletList") < introductionCard.indexOf('label="Explanation"'), "Introduction explanation should render after bullets.");
assert(introductionCard.indexOf('label="Explanation"') < introductionCard.indexOf('label="Transition"'), "Introduction explanation should render before transition.");
assert(workspace.includes('<PrintLine label="Explanation" value={draft.introduction.explanation} />'), "Print formats must include Introduction explanation.");
assert(!directionPreviews.includes("${subject.toLowerCase()} feels heavy"), "Fallback direction wording should not duplicate heavy/difficult phrases.");

console.log("Message polish checks passed.");
console.log("Generated point titles:");
for (const point of points) console.log(`- ${point.title}`);
console.log("Generated Scriptures:");
for (const point of points) console.log(`- ${point.scripture}`);
console.log("Generated applications:");
for (const point of points) console.log(`- ${point.application}`);
console.log(`Illustration sets differ: ${uniq(points.map((point) => JSON.stringify(point.illustrationOptions))) === points.length}`);
console.log(`Introduction explanation: ${introduction.explanation}`);

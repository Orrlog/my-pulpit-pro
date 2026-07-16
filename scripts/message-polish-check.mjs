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

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
}

function mergeGenerationHistory(draft, selectedPoints = draft.points) {
  return {
    scriptureReferences: uniqueValues([
      ...(draft.generationHistory?.scriptureReferences ?? []),
      ...draft.scriptureBank.filter((item) => item.reference !== draft.mainScripture).map((item) => item.reference),
      ...selectedPoints.map((point) => point.scripture),
    ]),
    pointTitles: uniqueValues([
      ...(draft.generationHistory?.pointTitles ?? []),
      ...selectedPoints.map((point) => point.title),
    ]),
  };
}

function normalizeActiveScriptureBank(draft) {
  const references = uniqueValues([
    draft.mainScripture,
    draft.introduction?.scripture,
    ...draft.points.map((point) => point.scripture),
    draft.closing?.scripture,
  ]);
  return references.map((reference, index) => {
    const existing = draft.scriptureBank.find((item) => item.reference === reference);
    return {
      id: existing?.id ?? `scripture-${Date.now()}-${index}`,
      reference,
      text: existing?.text && !existing.text.includes("not available") ? existing.text : getVerseText(reference),
      supportNote: "",
      fullContext: undefined,
    };
  });
}

function globalCandidates(draft) {
  return Array.from(new Set([...(scripturePools[topicFrom(draft)] ?? []), ...scripturePools.default, ...Object.keys(scriptureProfiles)]))
    .filter((reference) => reference !== draft.mainScripture && scriptureProfiles[reference] && getVerseText(reference) !== "Verse text is not available in this local preview.");
}

function resultForReference(draft, reference, index) {
  const existing = draft.scriptureBank.find((item) => item.reference === reference);
  const item = existing ?? { id: `scripture-extra-${index}`, reference, text: getVerseText(reference), supportNote: "", fullContext: undefined };
  return { item, scriptureItem: existing ? undefined : item };
}

function pointFromProfile(draft, item, index, profile = scriptureProfiles[item.reference]) {
  return {
    id: `generated-${index}`,
    title: profile.title,
    scripture: item.reference,
    scriptureText: item.text,
    summary: profile.summary,
    bullets: profile.bullets,
    explanation: profile.explanation,
    application: profile.application,
    illustrationOptions: profile.illustrationOptions,
    transition: profile.transition,
    notes: "",
  };
}

function firstUnusedProfiledReference(draft, exclude = new Set()) {
  const history = mergeGenerationHistory(draft);
  const usedScriptures = new Set([...draft.points.map((point) => point.scripture), ...history.scriptureReferences, ...exclude]);
  const usedTitles = new Set([...draft.points.map((point) => point.title), ...history.pointTitles]);
  return globalCandidates(draft).find((candidate) => !usedScriptures.has(candidate) && !usedTitles.has(scriptureProfiles[candidate].title));
}

function buildAdditionalResult(draft) {
  const reference = firstUnusedProfiledReference(draft) ?? globalCandidates(draft).find((candidate) => !draft.points.some((point) => point.scripture === candidate));
  assert(reference, "Expected a profiled reference for Add Another Point.");
  const { item, scriptureItem } = resultForReference(draft, reference, draft.points.length);
  return { point: pointFromProfile(draft, item, draft.points.length), scriptureItem };
}

function rewriteProfileFor(reference) {
  if (reference === "Proverbs 3:5") {
    return {
      title: "Release the Demand to Understand Everything",
      summary: "Trust grows when believers stop requiring complete explanations before obeying the Lord.",
      bullets: [
        "Proverbs calls the whole heart to lean on God rather than self-protection.",
        "Limited understanding is not a failure; it is an invitation to dependence.",
        "Acknowledging the Lord means bringing decisions under His wisdom before clarity feels complete.",
      ],
      explanation: "Proverbs 3:5 does not shame people for having questions. It redirects where their weight rests. When life feels heavy, the believer can stop demanding total control and entrust the next step to the Lord who sees the path fully.",
      application: "Name one place where needing to understand everything has delayed obedience, then take the next faithful step while asking God for wisdom instead of control.",
      illustrationOptions: [
        "A traveler following a trustworthy guide through fog when the whole road is not visible.",
        "A patient following a doctor's recovery plan before every result has arrived.",
        "A family making one wise decision at a time during an uncertain season.",
      ],
      transition: "When trust releases the demand for complete explanation, the sermon can move toward the strength Christ gives to weary people.",
    };
  }
  return null;
}

function rewriteResult(draft, point) {
  const reference = firstUnusedProfiledReference(draft, new Set([point.scripture])) ?? point.scripture;
  const { item, scriptureItem } = resultForReference(draft, reference, draft.points.length);
  const profile = reference === point.scripture ? (rewriteProfileFor(reference) ?? scriptureProfiles[reference]) : scriptureProfiles[reference];
  return {
    point: {
      ...pointFromProfile(draft, item, draft.points.findIndex((itemPoint) => itemPoint.id === point.id), profile),
      id: point.id,
      notes: point.notes,
      includeOptionalResponse: point.includeOptionalResponse,
      status: "rewritten",
    },
    scriptureItem,
  };
}

function applyAdd(draft, result) {
  const points = [...draft.points, result.point];
  const next = {
    ...draft,
    points,
    generationHistory: mergeGenerationHistory(draft, [result.point]),
    scriptureBank: result.scriptureItem ? [...draft.scriptureBank, result.scriptureItem] : draft.scriptureBank,
  };
  return { ...next, scriptureBank: normalizeActiveScriptureBank(next) };
}

function applyRewrite(draft, originalPoint, result) {
  const points = draft.points.map((point) => (point.id === originalPoint.id ? result.point : point));
  const next = {
    ...draft,
    points,
    generationHistory: mergeGenerationHistory(draft, [originalPoint, result.point]),
    scriptureBank: result.scriptureItem ? [...draft.scriptureBank, result.scriptureItem] : draft.scriptureBank,
  };
  return { ...next, scriptureBank: normalizeActiveScriptureBank(next) };
}

function applyDelete(draft, deletedPoint) {
  const points = draft.points.filter((point) => point.id !== deletedPoint.id);
  const next = {
    ...draft,
    points,
    generationHistory: mergeGenerationHistory(draft, [deletedPoint]),
  };
  return { ...next, scriptureBank: normalizeActiveScriptureBank(next) };
}

let draft = {
  ...sample,
  introduction,
  closing: { scripture: "", scriptureText: "" },
  scriptureBank,
  points,
};
draft = { ...draft, generationHistory: mergeGenerationHistory(draft), scriptureBank: normalizeActiveScriptureBank(draft) };

const originalRewritePoint = { ...draft.points[1], notes: "Keep this personal note" };
draft = { ...draft, points: draft.points.map((point) => (point.id === originalRewritePoint.id ? originalRewritePoint : point)) };
draft = { ...draft, generationHistory: mergeGenerationHistory(draft), scriptureBank: normalizeActiveScriptureBank(draft) };
const bankBeforeRewrite = draft.scriptureBank.map((item) => item.reference);
const rewritten = rewriteResult(draft, originalRewritePoint);
const draftAfterRewrite = applyRewrite(draft, originalRewritePoint, rewritten);
const bankAfterRewrite = draftAfterRewrite.scriptureBank.map((item) => item.reference);
const historyBeforeFirstAdd = draftAfterRewrite.generationHistory;
const firstAdd = buildAdditionalResult(draftAfterRewrite);
const draftAfterFirstAdd = applyAdd(draftAfterRewrite, firstAdd);
const historyBeforeSecondAdd = draftAfterFirstAdd.generationHistory;
const secondAdd = buildAdditionalResult(draftAfterFirstAdd);
const draftAfterSecondAdd = applyAdd(draftAfterFirstAdd, secondAdd);
const bankAfterBothAdds = draftAfterSecondAdd.scriptureBank.map((item) => item.reference);
const deletedPoint = draftAfterSecondAdd.points[0];
const draftAfterDelete = applyDelete(draftAfterSecondAdd, deletedPoint);
const addAfterDelete = buildAdditionalResult(draftAfterDelete);

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
assert(!points.some((point) => /Again|Part 2|Revisited|Another Look|In Daily Life/.test(point.title)), "Initial titles must not use duplicate suffixes.");

assert(originalRewritePoint.title === "Trust Beyond Your Own Understanding", "Point 2 should begin with the tested Proverbs title.");
assert(originalRewritePoint.scripture === "Proverbs 3:5", "Point 2 should begin with Proverbs 3:5.");
assert(bankBeforeRewrite.includes("Proverbs 3:5"), "Proverbs 3:5 should appear in the active bank before Rewrite.");
assert(rewritten.point.id === originalRewritePoint.id, "Rewrite must preserve point ID.");
assert(rewritten.point.notes === "Keep this personal note", "Rewrite must preserve notes exactly.");
assert(rewritten.point.status === "rewritten", "Rewrite must mark status.");
for (const field of ["title", "summary", "explanation", "application", "transition"]) {
  assert(rewritten.point[field] !== originalRewritePoint[field], `Rewrite must change ${field}.`);
}
assert(JSON.stringify(rewritten.point.bullets) !== JSON.stringify(originalRewritePoint.bullets), "Rewrite must change bullets.");
assert(JSON.stringify(rewritten.point.illustrationOptions) !== JSON.stringify(originalRewritePoint.illustrationOptions), "Rewrite must change illustrations.");
assert(scriptureProfiles[rewritten.point.scripture], "Rewrite must use a specific profile.");
assert(!/Again|Again in Daily Life|Part 2|Revisited|Another Look|In Daily Life/.test(rewritten.point.title), "Rewrite title must not use duplicate suffixes.");
assert(draftAfterRewrite.generationHistory.scriptureReferences.includes("Proverbs 3:5"), "Generation history must keep rewritten-away Proverbs 3:5.");
assert(draftAfterRewrite.generationHistory.pointTitles.includes("Trust Beyond Your Own Understanding"), "Generation history must keep the rewritten-away title.");
assert(bankAfterRewrite.includes(rewritten.point.scripture), "Active bank should include the rewritten Scripture.");
assert(!bankAfterRewrite.includes("Proverbs 3:5"), "Active bank should remove inactive Proverbs 3:5 after Rewrite.");
assert(bankAfterRewrite.filter((reference) => reference === rewritten.point.scripture).length === 1, "Rewritten Scripture must appear exactly once.");

assert(firstAdd.point.scripture !== "Proverbs 3:5", "First Add Another Point must not recycle rewritten-away Proverbs 3:5.");
assert(firstAdd.point.title !== "Trust Beyond Your Own Understanding", "First Add Another Point must not recycle the rewritten-away title.");
assert(!historyBeforeFirstAdd.scriptureReferences.includes(firstAdd.point.scripture), "First added Scripture should not be in generation history before the click.");
assert(!historyBeforeFirstAdd.pointTitles.includes(firstAdd.point.title), "First added title should not be in generation history before the click.");
assert(secondAdd.point.scripture !== firstAdd.point.scripture, "Two consecutive added Scriptures must differ.");
assert(secondAdd.point.title !== firstAdd.point.title, "Two consecutive added titles must differ.");
assert(!historyBeforeSecondAdd.scriptureReferences.includes(secondAdd.point.scripture), "Second added Scripture should not be in generation history before the click.");
assert(!historyBeforeSecondAdd.pointTitles.includes(secondAdd.point.title), "Second added title should not be in generation history before the click.");
for (const added of [firstAdd, secondAdd]) {
  assert(!points.some((point) => point.title === added.point.title), "Added point title must be new.");
  assert(!points.some((point) => point.scripture === added.point.scripture), "Added point Scripture must be new when candidates remain.");
  assert(!/Again|Again in Daily Life|Part 2|Revisited|Another Look|In Daily Life/.test(added.point.title), "Added title must not use duplicate suffixes.");
  assert(!points.some((point) => point.application === added.point.application), "Added application must differ.");
  assert(!points.some((point) => JSON.stringify(point.illustrationOptions) === JSON.stringify(added.point.illustrationOptions)), "Added illustrations must differ.");
  assert(!points.some((point) => point.transition === added.point.transition), "Added transition must differ.");
  assert(scriptureProfiles[added.point.scripture], "Added point must use a specific profile.");
  assert(added.scriptureItem, "Added point with a new Scripture should return a ScriptureBankItem.");
}
assert(draftAfterSecondAdd.generationHistory.scriptureReferences.includes(firstAdd.point.scripture), "History must contain the first added Scripture.");
assert(draftAfterSecondAdd.generationHistory.scriptureReferences.includes(secondAdd.point.scripture), "History must contain the second added Scripture.");
assert(draftAfterSecondAdd.generationHistory.pointTitles.includes(firstAdd.point.title), "History must contain the first added title.");
assert(draftAfterSecondAdd.generationHistory.pointTitles.includes(secondAdd.point.title), "History must contain the second added title.");
assert(bankAfterBothAdds.filter((reference) => reference === firstAdd.point.scripture).length === 1, "First added Scripture must be in the bank exactly once.");
assert(bankAfterBothAdds.filter((reference) => reference === secondAdd.point.scripture).length === 1, "Second added Scripture must be in the bank exactly once.");
assert(!bankAfterBothAdds.includes("Proverbs 3:5"), "Inactive historical Proverbs 3:5 must not return to the active bank after additions.");
for (const point of draftAfterSecondAdd.points) {
  assert(bankAfterBothAdds.filter((reference) => reference === point.scripture).length === 1, `Active point Scripture ${point.scripture} must appear exactly once in the bank.`);
}

assert(!draftAfterDelete.points.some((point) => point.id === deletedPoint.id), "Deleted point should be removed from visible points.");
assert(!draftAfterDelete.scriptureBank.some((item) => item.reference === deletedPoint.scripture), "Deleted point Scripture should leave the active bank when unused.");
assert(draftAfterDelete.generationHistory.scriptureReferences.includes(deletedPoint.scripture), "Deleted point Scripture should remain in generation history.");
assert(draftAfterDelete.generationHistory.pointTitles.includes(deletedPoint.title), "Deleted point title should remain in generation history.");
assert(addAfterDelete.point.scripture !== deletedPoint.scripture, "Add after delete must not recreate the deleted Scripture.");
assert(addAfterDelete.point.title !== deletedPoint.title, "Add after delete must not recreate the deleted title.");
assert(rewritten.point.notes === "Keep this personal note", "Pastor note must remain exact.");

const introductionCard = workspace.slice(workspace.indexOf("function IntroductionCard"), workspace.indexOf("function PointCard"));
assert(introductionCard.indexOf("<ScriptureBlock") < introductionCard.indexOf("<BulletList"), "Introduction Scripture should render before bullets onscreen.");
assert(introductionCard.indexOf("<BulletList") < introductionCard.indexOf('label="Explanation"'), "Introduction explanation should render after bullets.");
assert(introductionCard.indexOf('label="Explanation"') < introductionCard.indexOf('label="Transition"'), "Introduction explanation should render before transition.");
assert(workspace.includes('<PrintLine label="Explanation" value={draft.introduction.explanation} />'), "Print formats must include Introduction explanation.");
assert(!directionPreviews.includes("${subject.toLowerCase()} feels heavy"), "Fallback direction wording should not duplicate heavy/difficult phrases.");

console.log("Message polish checks passed.");
console.log("Initial generated titles and Scriptures:");
for (const point of points) console.log(`- ${point.title} — ${point.scripture}`);
console.log(`Original Point 2: ${originalRewritePoint.title} — ${originalRewritePoint.scripture}`);
console.log(`Rewritten Point 2: ${rewritten.point.title} — ${rewritten.point.scripture}`);
console.log(`First added point: ${firstAdd.point.title} — ${firstAdd.point.scripture}`);
console.log(`Second added point: ${secondAdd.point.title} — ${secondAdd.point.scripture}`);
console.log(`Generation-history Scriptures: ${draftAfterSecondAdd.generationHistory.scriptureReferences.join(", ")}`);
console.log(`Generation-history Titles: ${draftAfterSecondAdd.generationHistory.pointTitles.join(" | ")}`);
console.log(`Active Scripture Bank after Rewrite: ${bankAfterRewrite.join(", ")}`);
console.log(`Active Scripture Bank after both additions: ${bankAfterBothAdds.join(", ")}`);
console.log("Every generated rewrite field changed: true");
console.log(`Personal notes remained exact: ${rewritten.point.notes === "Keep this personal note"}`);
console.log(`New Scripture Bank entries added exactly once: ${bankAfterBothAdds.filter((reference) => reference === firstAdd.point.scripture).length === 1 && bankAfterBothAdds.filter((reference) => reference === secondAdd.point.scripture).length === 1 && bankAfterRewrite.filter((reference) => reference === rewritten.point.scripture).length === 1}`);
console.log(`Introduction explanation: ${introduction.explanation}`);

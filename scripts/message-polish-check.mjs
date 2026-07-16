import { readFileSync } from "node:fs";

const directionPreviews = readFileSync("components/app-shell/direction-previews.ts", "utf8");
const draftStorage = readFileSync("components/app-shell/message-draft-storage.ts", "utf8");
const workspace = readFileSync("app/message-workspace/page.tsx", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fallbackTitles = [
  "God's Strength for Weary People",
  "Waiting Without Giving Up",
  "When God Renews What Life Has Drained",
  "Strength Beyond Your Own",
  "Rising with Enduring Hope",
];

for (const title of fallbackTitles) {
  assert(directionPreviews.includes(title), `Missing distinct fallback direction title: ${title}`);
}

assert(draftStorage.includes('"Isaiah 40:29"'), "Missing Isaiah 40:29 verse text.");
assert(draftStorage.includes('"Isaiah 40:30"') && draftStorage.includes('assembleVerseRange'), "Missing support for assembling Isaiah 40:29-31 passage text.");
assert(draftStorage.includes("scriptureProfiles"), "Missing scripture-profile point generation.");
assert(draftStorage.includes("const usedTitles = new Set<string>()") && draftStorage.includes("const usedScriptures = new Set<string>()"), "Initial point generation must share title and Scripture uniqueness sets.");
assert(draftStorage.includes("usedTitles.add(point.title)") && draftStorage.includes("usedScriptures.add(point.scripture)"), "Initial point generation must record used titles and Scriptures after each point.");
assert(draftStorage.includes('if (length === "30") return 6'), "30-minute messages should generate exactly six points.");
const requiredProfileRefs = ["Isaiah 40:31", "Psalm 46:1", "Proverbs 3:5", "Matthew 11:28", "John 15:5", "Romans 12:2", "Romans 15:13", "Galatians 6:9"];
for (const ref of requiredProfileRefs) {
  assert(draftStorage.includes(`"${ref}": {`), `Missing specific Scripture profile for ${ref}.`);
}
assert(draftStorage.includes("export function buildAdditionalPoint"), "Missing distinct Add Another Point helper.");
assert(draftStorage.includes("export function rewriteMessagePoint"), "Missing full Rewrite helper.");
assert(draftStorage.includes("notes: point.notes"), "Rewrite must preserve personal notes.");
assert(!draftStorage.includes("Let ${scripture.reference} shape the practical response"), "Generic application filler should not be appended to generated points.");
assert(workspace.includes("handlePointDrag"), "Missing drag auto-scroll handler.");
assert(workspace.includes("Move to Point"), "Missing move-to-position control.");
assert(workspace.includes("buildAdditionalPoint(current)"), "Add Another Point should use distinct helper.");
assert(workspace.includes("rewriteMessagePoint(current, item)"), "Rewrite should replace the full point through helper.");
assert(!workspace.includes("Pulpit Outline"), "Pulpit Notes should not include the Pulpit Outline heading.");
assert(workspace.includes("<PrintHeader draft={draft} compact />"), "Pulpit Notes should use compact metadata.");
assert(workspace.includes("break-inside-avoid-page"), "Print sections should avoid awkward page breaks where practical.");
const introductionCard = workspace.slice(workspace.indexOf("function IntroductionCard"), workspace.indexOf("function PointCard"));
assert(introductionCard.indexOf("<ScriptureBlock") < introductionCard.indexOf("<BulletList"), "Introduction Scripture should render before bullets onscreen.");
const pulpitIntro = workspace.slice(workspace.indexOf("function PrintPulpitNotes"), workspace.indexOf("<section className=\"mt-7\">", workspace.indexOf("function PrintPulpitNotes")));
assert(pulpitIntro.indexOf("<PrintScriptureText") < pulpitIntro.indexOf("<ul"), "Pulpit Notes Introduction Scripture should print before bullets.");
const fullIntro = workspace.slice(workspace.indexOf("<PrintSection title=\"Introduction\"", workspace.indexOf("function PrintFullPreparationNotes")), workspace.indexOf("<PrintLine label=\"Hook\"", workspace.indexOf("function PrintFullPreparationNotes")));
assert(fullIntro.indexOf("<PrintScriptureText") < fullIntro.indexOf("<ul"), "Full Preparation Introduction Scripture should print before bullets.");
assert(!directionPreviews.toLowerCase().includes("feels heavy, god meets") || !directionPreviews.includes("${subject.toLowerCase()} feels heavy"), "Fallback direction wording should not mechanically duplicate heavy/difficult phrases.");

console.log("Message polish checks passed.");

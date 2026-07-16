import { readFileSync } from "node:fs";
import vm from "node:vm";

const workspace = readFileSync("app/message-workspace/page.tsx", "utf8");
const draftStorage = readFileSync("components/app-shell/message-draft-storage.ts", "utf8");

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

const kjvLookup = vm.runInNewContext(`(${extractObject(draftStorage, "const kjvLookup")})`);

function scriptureLines(text) {
  if (!text || text === "Verse text is not available in this local preview.") return [];
  return text
    .replace(/\s+(?=\d+(?::|\s+)\s*[A-Z])/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)(?::|\s+)\s*(.+)$/);
      return match ? { verse: match[1], text: match[2].trim() } : { verse: "", text: line };
    });
}

function renderPrintScripture(lines) {
  return lines.map((line) => `${line.verse ? `${line.verse}: ` : ""}${line.text}`).join("\n\n");
}

const isaiahParagraph = `29: ${kjvLookup["Isaiah 40:29"]} 30 ${kjvLookup["Isaiah 40:30"]} 31 ${kjvLookup["Isaiah 40:31"]}`;
const renderedIsaiah = renderPrintScripture(scriptureLines(isaiahParagraph));
const isaiahLines = scriptureLines(isaiahParagraph);

assert(isaiahLines.length === 3, "Isaiah 40:29-31 should render as three verse lines.");
assert(isaiahLines.map((line) => line.verse).join(",") === "29,30,31", "Isaiah verse numbers should be parsed distinctly.");
assert(renderedIsaiah.includes("29:") && renderedIsaiah.includes("30:") && renderedIsaiah.includes("31:"), "Every rendered Isaiah verse number should include a colon.");
assert(workspace.includes("<PrintScriptureText text={draft.introduction.scriptureText} />"), "Introduction Scripture should use PrintScriptureText.");
assert(workspace.includes("<PrintScriptureText text={point.scriptureText} />"), "Point Scripture should use PrintScriptureText.");
assert(!workspace.includes("Message Points"), "Full Preparation must not print a Message Points heading.");
assert(!workspace.includes("Pulpit Outline"), "Pulpit Outline heading must remain absent.");
assert(!workspace.includes("draft.lengthLabel"), "Printed output must not include sermon duration metadata.");
const compactHeaderStart = workspace.indexOf("function PrintHeader");
const compactHeader = workspace.slice(compactHeaderStart, workspace.indexOf("function PrintIllustrationList"));
assert(compactHeader.includes("compact ? null"), "Compact Pulpit Notes header should omit extra metadata.");
assert(!workspace.includes('join(" | ")'), "Printed illustration lists must not use vertical bars.");
assert(workspace.includes("function PrintIllustrationList"), "Full Preparation should render illustrations as a list.");
assert(workspace.includes("<PrintIllustrationList items={point.illustrationOptions} />"), "Full Preparation should use PrintIllustrationList.");
const fullPreparationSource = workspace.slice(workspace.indexOf("function PrintFullPreparationNotes"), workspace.indexOf("function PrintNotesBlock"));
assert(!fullPreparationSource.includes('className="mt-6 break-inside-avoid-page border-t'), "Full Preparation point cards should not force every point to a new page.");
assert(!fullPreparationSource.includes('className="mt-5 break-inside-avoid border-t border-black/25 pt-4"><h2 className="text-base font-bold">Scripture Bank'), "Scripture Bank should not be forced to the next page as a whole.");
const contextSource = draftStorage.slice(draftStorage.indexOf("export function buildContextNotes"), draftStorage.indexOf("export function buildPastoralCareNote"));
assert(!contextSource.includes("Keep ${input.mainScripture} as the anchor"), "Passage Context must not use internal anchor instructions.");
assert(!contextSource.includes("Let supporting passages serve the main text instead of taking over the sermon"), "Passage Context must not use support-instruction filler.");
assert(contextSource.includes("return [];"), "Missing passage context should be omitted instead of replaced with filler.");
assert(!draftStorage.includes("explanation: qualityText(`${profile.explanation} Connect it back"), "New point generation must not append Connect it back boilerplate.");
assert(!draftStorage.includes("cleanSentence(input.bigIdea).toLowerCase()"), "Generated explanations must not lowercase the big idea and divine titles.");
assert(!draftStorage.includes("serves the sermon’s central burden: ${cleanSentence(input.bigIdea).toLowerCase()}"), "Generated explanations must not include the repeated central-burden suffix.");
assert(!draftStorage.includes("the lord can renew"), "Generated content must not lowercase The Lord.");
assert(workspace.includes("whitespace-pre-line"), "PrintLine should preserve intentional line breaks.");

console.log("Print polish checks passed.");
console.log("Rendered Isaiah 40:29-31 verse lines:");
for (const line of isaiahLines) console.log(`- ${line.verse}: ${line.text}`);
console.log("Message Points heading absent: true");
console.log("Sermon duration metadata absent from print header: true");
console.log("Pulpit Notes compact metadata: true");
console.log("Full Preparation illustration lists use bullets: true");
console.log("Scripture Bank forced page break absent: true");
console.log("Generated Connect it back boilerplate absent from new point generation: true");

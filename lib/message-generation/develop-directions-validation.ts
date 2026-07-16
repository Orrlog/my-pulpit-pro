import type { SampleDirection } from "@/components/app-shell/data";
import { isValidScriptureReference } from "./develop-assembly";
import type { DevelopDirectionGenerationInput } from "./develop-directions-schema";

function normalize(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function firstWords(value: string) { return normalize(value).split(" ").slice(0, 3).join(" "); }

export function validateDevelopDirections(input: DevelopDirectionGenerationInput, directions: SampleDirection[]): string[] {
  const errors: string[] = [];
  if (directions.length !== 5) errors.push("wrong-direction-count");
  const titles = new Set<string>();
  const bigIdeas = new Set<string>();
  const angles = new Set<string>();
  const focuses = new Set<string>();
  const objects = new Set<string>();
  const titlePrefixes = new Set<string>();
  const suppliedPassage = input.mainPassage.trim();
  for (const direction of directions) {
    if (!direction.title.trim() || !direction.scripture.trim() || !direction.bigIdea.trim() || !direction.angle.trim() || !direction.focus.trim()) errors.push("missing-direction-content");
    if (!isValidScriptureReference(direction.scripture)) errors.push("bad-scripture");
    if (suppliedPassage && direction.scripture.trim() !== suppliedPassage) errors.push("supplied-passage-not-preserved");
    const title = normalize(direction.title);
    const bigIdea = normalize(direction.bigIdea);
    const angle = normalize(direction.angle);
    const focus = normalize(direction.focus);
    const objectKey = JSON.stringify({ title, scripture: normalize(direction.scripture), bigIdea, angle, focus });
    if (titles.has(title)) errors.push("duplicate-title");
    if (bigIdeas.has(bigIdea)) errors.push("duplicate-big-idea");
    if (angles.has(angle)) errors.push("duplicate-angle");
    if (focuses.has(focus)) errors.push("duplicate-focus");
    if (objects.has(objectKey)) errors.push("duplicate-direction-object");
    const prefix = firstWords(direction.title);
    if (titlePrefixes.has(prefix)) errors.push("title-prefix-variation");
    titles.add(title); bigIdeas.add(bigIdea); angles.add(angle); focuses.add(focus); objects.add(objectKey); titlePrefixes.add(prefix);
  }
  return Array.from(new Set(errors));
}

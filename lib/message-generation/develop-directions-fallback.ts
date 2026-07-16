import { getDevelopDirections } from "@/components/app-shell/direction-previews";
import type { SampleDirection } from "@/components/app-shell/data";
import type { DevelopDirectionGenerationInput } from "./develop-directions-schema";

export function buildCuratedDevelopDirections(input: DevelopDirectionGenerationInput): SampleDirection[] {
  return getDevelopDirections(input.messageIdea, input.mainPassage, input.desiredResponse).slice(0, 5);
}

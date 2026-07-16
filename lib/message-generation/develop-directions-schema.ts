import { z } from "zod";

export const developDirectionGenerationInputSchema = z.object({
  messageIdea: z.string().trim().max(1200),
  mainPassage: z.string().trim().max(160),
  desiredResponse: z.string().trim().max(800),
  messageMode: z.string().trim().max(40),
  messageModeLabel: z.string().trim().max(80),
}).strict();

export const generatedDevelopDirectionsSchema = z.object({
  directions: z.array(z.object({
    title: z.string().trim().min(3).max(120),
    scripture: z.string().trim().min(3).max(120),
    bigIdea: z.string().trim().min(20).max(240),
    angle: z.string().trim().min(20).max(360),
    focus: z.string().trim().min(10).max(200),
  }).strict()).length(5),
}).strict();

export type DevelopDirectionGenerationInput = z.infer<typeof developDirectionGenerationInputSchema>;
export type GeneratedDevelopDirections = z.infer<typeof generatedDevelopDirectionsSchema>;
export type DevelopDirectionGenerationResponse = {
  directions: GeneratedDevelopDirections["directions"];
  generationSource: "openai" | "curated-fallback";
  warning?: string;
};

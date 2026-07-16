import { z } from "zod";
import type { MessageDraft } from "@/components/app-shell/message-draft-storage";

export const developMessageGenerationInputSchema = z.object({
  startingPath: z.literal("develop"),
  startingPathLabel: z.string().trim().min(1).max(80),
  messageMode: z.string().trim().min(1).max(40),
  messageModeLabel: z.string().trim().min(1).max(80),
  length: z.enum(["30", "45", "60"]),
  lengthLabel: z.string().trim().min(1).max(40),
  translation: z.string().trim().min(1).max(80),
  developIdea: z.string().trim().max(1200),
  developPassage: z.string().trim().max(160),
  desiredResponse: z.string().trim().max(800),
  direction: z.object({
    title: z.string().trim().min(1).max(140),
    scripture: z.string().trim().min(1).max(120),
    bigIdea: z.string().trim().min(1).max(240),
    angle: z.string().trim().min(1).max(360),
    focus: z.string().trim().min(1).max(240),
  }).strict(),
}).strict();

export type DevelopMessageGenerationInput = z.infer<typeof developMessageGenerationInputSchema>;

export type DevelopGenerationResponse = {
  draft: MessageDraft;
  generationSource: "openai" | "curated-fallback";
  warning?: string;
};

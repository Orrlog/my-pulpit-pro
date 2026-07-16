import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { getPointCount } from "@/components/app-shell/message-draft-storage";
import { assembleDevelopMessageDraft, validateGeneratedDevelopMessage } from "./develop-assembly";
import { buildCuratedDevelopDraft } from "./develop-fallback";
import { buildDevelopPrompt } from "./develop-prompt";
import { generatedDevelopMessageSchema, type GeneratedDevelopMessage } from "./develop-schema";
import type { DevelopGenerationResponse, DevelopMessageGenerationInput } from "./develop-types";

const FALLBACK_WARNING = "This message was created with the reliable starter generator because AI generation was temporarily unavailable. You can still edit every part of it.";
const DEFAULT_MODEL = "gpt-5.6-terra";

function fallback(input: DevelopMessageGenerationInput): DevelopGenerationResponse {
  return { draft: buildCuratedDevelopDraft(input), generationSource: "curated-fallback", warning: FALLBACK_WARNING };
}

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try { return await promise; } finally { clearTimeout(timeout); }
}

export async function generateDevelopMessage(input: DevelopMessageGenerationInput): Promise<DevelopGenerationResponse> {
  if (!process.env.OPENAI_API_KEY) return fallback(input);
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 18000 });
    const pointCount = getPointCount(input.length);
    const prompt = buildDevelopPrompt(input, pointCount);
    const response = await withTimeout(openai.responses.parse({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      text: { format: zodTextFormat(generatedDevelopMessageSchema, "develop_message") },
    }), 22000);
    if (response.status === "incomplete" || response.output_parsed == null) throw new Error("No parsed generation");
    const generated = response.output_parsed as GeneratedDevelopMessage;
    const issues = validateGeneratedDevelopMessage(input, generated);
    if (issues.length) throw new Error(`Semantic validation failed: ${issues.join(",")}`);
    return { draft: assembleDevelopMessageDraft(input, generated), generationSource: "openai" };
  } catch (error) {
    console.error("Develop generation fell back", { name: error instanceof Error ? error.name : "Unknown", message: error instanceof Error ? error.message.slice(0, 160) : "Unknown error" });
    return fallback(input);
  }
}

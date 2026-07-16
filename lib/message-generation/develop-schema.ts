import { z } from "zod";

const stringList = z.array(z.string().trim().min(8).max(240)).min(2).max(4);

export const generatedDevelopMessageSchema = z.object({
  title: z.string().trim().min(3).max(120),
  contextNotes: z.array(z.string().trim().min(20).max(360)).min(1).max(4),
  pastoralCareNote: z.string().trim().min(20).max(500).optional(),
  introduction: z.object({
    hook: z.string().trim().min(20).max(500),
    pastoralTension: z.string().trim().min(20).max(500),
    passageConnection: z.string().trim().min(20).max(500),
    bigIdeaBridge: z.string().trim().min(20).max(500),
    explanation: z.string().trim().min(40).max(900),
    firstMovementTransition: z.string().trim().min(20).max(400),
    bullets: stringList,
    scripture: z.string().trim().max(120).optional(),
  }).strict(),
  points: z.array(z.object({
    title: z.string().trim().min(3).max(80),
    summary: z.string().trim().min(20).max(360),
    scripture: z.string().trim().min(3).max(120),
    bullets: stringList,
    explanation: z.string().trim().min(40).max(900),
    application: z.string().trim().min(30).max(700),
    illustrationOptions: z.array(z.string().trim().min(12).max(220)).min(2).max(3),
    transition: z.string().trim().min(20).max(400),
    optionalResponseMoment: z.string().trim().min(20).max(300).optional(),
  }).strict()).min(6).max(10),
  closing: z.object({
    recap: z.string().trim().min(20).max(500),
    callToResponse: z.string().trim().min(20).max(500),
    closingApplication: z.string().trim().min(20).max(500),
    prayer: z.string().trim().min(20).max(700),
    bullets: stringList,
    scripture: z.string().trim().max(120).optional(),
  }).strict(),
}).strict();

export type GeneratedDevelopMessage = z.infer<typeof generatedDevelopMessageSchema>;

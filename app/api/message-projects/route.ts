import { NextResponse } from "next/server";
import { createMessageProject, listMessageProjects } from "@/lib/message-projects/server";

export async function GET(request: Request) {
  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const result = await listMessageProjects(Number.isFinite(limit) ? limit : undefined);
  return NextResponse.json(result.error ? { error: result.error } : { projects: result.data }, { status: result.error ? result.status : 200 });
}

export async function POST(request: Request) {
  let body: { draft?: unknown; legacyLocalId?: string; importMetadata?: { status?: "Draft" | "Saved"; savedAt?: string | null } } = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send a message draft." }, { status: 400 }); }
  const result = await createMessageProject(body.draft, body.legacyLocalId, body.legacyLocalId ? body.importMetadata : undefined);
  return NextResponse.json(result.error ? { error: result.error } : { project: result.data }, { status: result.error ? result.status : 201 });
}

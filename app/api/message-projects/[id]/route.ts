import { NextResponse } from "next/server";
import { deleteMessageProject, getMessageProject, updateMessageProjectDraft } from "@/lib/message-projects/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await getMessageProject(id);
  return NextResponse.json(result.error ? { error: result.error } : { project: result.data }, { status: result.error ? result.status : 200 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { draft?: unknown; action?: "save" } = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send a message draft." }, { status: 400 }); }
  const result = await updateMessageProjectDraft(id, body.draft, body.action === "save" ? "save" : undefined);
  return NextResponse.json(result.error ? { error: result.error } : { project: result.data }, { status: result.error ? result.status : 200 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteMessageProject(id);
  if (result.error || !result.data) return NextResponse.json({ error: result.error ?? "This message could not be deleted right now." }, { status: result.status ?? 500 });
  return NextResponse.json({ success: true, id: result.data.id });
}

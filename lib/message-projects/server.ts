import { cleanMessageDraft, normalizeMessageDraft, type MessageDraft } from "@/components/app-shell/message-draft-storage";
import { createClient } from "@/lib/supabase/server";
import type { MessageProject, MessageProjectResult, MessageProjectStatus } from "./types";

type ProjectRow = {
  id: string;
  legacy_local_id: string | null;
  title: string;
  main_scripture: string;
  length: string;
  length_label: string;
  translation: string;
  status: MessageProjectStatus;
  draft: unknown;
  saved_at: string | null;
  created_at: string;
  updated_at: string;
};

function safeError(message = "Message projects are unavailable right now.", status = 500): MessageProjectResult<never> {
  return { data: null, error: message, status };
}

async function getUserAndClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null };
  return { supabase, user: data.user };
}

function deriveDraft(raw: unknown, id?: string, timestamps?: { createdAt?: string; updatedAt?: string }) {
  const normalized = normalizeMessageDraft(raw);
  if (!normalized) return null;
  return cleanMessageDraft({
    ...normalized,
    id: id ?? normalized.id,
    createdAt: timestamps?.createdAt ?? normalized.createdAt,
    updatedAt: timestamps?.updatedAt ?? normalized.updatedAt,
  });
}

function rowToProject(row: ProjectRow): MessageProject | null {
  const draft = deriveDraft(row.draft, row.id, { createdAt: row.created_at, updatedAt: row.updated_at });
  if (!draft) return null;
  return {
    id: row.id,
    legacyLocalId: row.legacy_local_id,
    title: row.title,
    mainScripture: row.main_scripture,
    length: row.length,
    lengthLabel: row.length_label,
    translation: row.translation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    savedAt: row.saved_at,
    draft,
  };
}

function metadata(draft: MessageDraft) {
  return {
    title: draft.title?.trim() || "Untitled Message",
    main_scripture: draft.mainScripture?.trim() || "",
    length: draft.length || "45",
    length_label: draft.lengthLabel || "45 minutes",
    translation: draft.translation || "KJV",
  };
}

export async function listMessageProjects(limit?: number): Promise<MessageProjectResult<MessageProject[]>> {
  const { supabase, user } = await getUserAndClient();
  if (!user) return safeError("Please sign in to view message projects.", 401);
  let query = supabase.from("message_projects").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return safeError();
  return { data: ((data as ProjectRow[]) ?? []).map(rowToProject).filter(Boolean) as MessageProject[], error: null };
}

export async function getMessageProject(id: string): Promise<MessageProjectResult<MessageProject>> {
  const { supabase, user } = await getUserAndClient();
  if (!user) return safeError("Please sign in to view this message.", 401);
  const { data, error } = await supabase.from("message_projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) return safeError();
  if (!data) return safeError("No message found.", 404);
  const project = rowToProject(data as ProjectRow);
  return project ? { data: project, error: null } : safeError("This message could not be loaded.", 500);
}

export async function createMessageProject(rawDraft: unknown, legacyLocalId?: string | null): Promise<MessageProjectResult<MessageProject>> {
  const { supabase, user } = await getUserAndClient();
  if (!user) return safeError("Please sign in to create a message.", 401);
  const cleanLegacyId = legacyLocalId?.trim() || null;
  if (cleanLegacyId) {
    const existing = await supabase.from("message_projects").select("*").eq("user_id", user.id).eq("legacy_local_id", cleanLegacyId).maybeSingle();
    if (existing.error) return safeError();
    if (existing.data) {
      const project = rowToProject(existing.data as ProjectRow);
      if (project) return { data: project, error: null };
    }
  }
  const now = new Date().toISOString();
  const initialDraft = deriveDraft(rawDraft, undefined, { createdAt: now, updatedAt: now });
  if (!initialDraft) return safeError("This message draft could not be read.", 400);
  const { data: inserted, error: insertError } = await supabase.from("message_projects").insert({
    user_id: user.id,
    legacy_local_id: cleanLegacyId,
    ...metadata(initialDraft),
    draft: initialDraft,
  }).select("*").single();
  if (insertError || !inserted) return safeError("This message could not be created right now.", 500);
  const row = inserted as ProjectRow;
  const projectDraft = deriveDraft(initialDraft, row.id, { createdAt: row.created_at, updatedAt: row.updated_at });
  if (!projectDraft) return safeError("This message could not be created right now.", 500);
  const { data: updated, error: updateError } = await supabase.from("message_projects").update({ draft: projectDraft, ...metadata(projectDraft) }).eq("id", row.id).eq("user_id", user.id).select("*").single();
  if (updateError || !updated) return safeError("This message could not be created right now.", 500);
  const project = rowToProject(updated as ProjectRow);
  return project ? { data: project, error: null } : safeError("This message could not be created right now.", 500);
}

export async function updateMessageProjectDraft(id: string, rawDraft: unknown, action?: "save"): Promise<MessageProjectResult<MessageProject>> {
  const { supabase, user } = await getUserAndClient();
  if (!user) return safeError("Please sign in to update this message.", 401);
  const existing = await getMessageProject(id);
  if (existing.error) return existing;
  const existingProject = existing.data;
  if (!existingProject) return safeError("No message found.", 404);
  const now = new Date().toISOString();
  const draft = deriveDraft(rawDraft, id, { createdAt: existingProject.createdAt, updatedAt: now });
  if (!draft) return safeError("This message draft could not be read.", 400);
  const patch = { ...metadata(draft), draft, status: action === "save" ? "Saved" : existingProject.status, saved_at: action === "save" ? now : existingProject.savedAt ?? null };
  const { data, error } = await supabase.from("message_projects").update(patch).eq("id", id).eq("user_id", user.id).select("*").maybeSingle();
  if (error) return safeError("This message could not be saved right now.", 500);
  if (!data) return safeError("No message found.", 404);
  const project = rowToProject(data as ProjectRow);
  return project ? { data: project, error: null } : safeError("This message could not be saved right now.", 500);
}

export async function deleteMessageProject(id: string): Promise<MessageProjectResult<{ id: string }>> {
  const { supabase, user } = await getUserAndClient();
  if (!user) return safeError("Please sign in to delete this message.", 401);
  const existing = await getMessageProject(id);
  if (existing.error) return existing as MessageProjectResult<{ id: string }>;
  const { error } = await supabase.from("message_projects").delete().eq("id", id).eq("user_id", user.id);
  if (error) return safeError("This message could not be deleted right now.", 500);
  return { data: { id }, error: null };
}

import {
  LEGACY_MESSAGE_DRAFT_STORAGE_KEY,
  MESSAGE_DRAFT_STORAGE_KEY,
  PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY,
  normalizeMessageDraft,
  type MessageDraft,
} from "./message-draft-storage";

export const MESSAGE_PROJECT_LIBRARY_KEY = "my-pulpit-pro.message-project-library.v1";
export const ACTIVE_MESSAGE_PROJECT_ID_KEY = "my-pulpit-pro.active-message-project-id.v1";
export const MESSAGE_USAGE_LEDGER_KEY = "my-pulpit-pro.message-usage-ledger.v1";
export const SOLO_MONTHLY_PROJECT_LIMIT = 10;

export type MessageProjectStatus = "Draft" | "Saved";

export type MessageProject = {
  id: string;
  title: string;
  mainScripture: string;
  length: string;
  lengthLabel: string;
  translation: string;
  createdAt: string;
  updatedAt: string;
  status: MessageProjectStatus;
  savedAt?: string;
  draft: MessageDraft;
};

export type MessageUsageRecord = {
  projectId: string;
  createdAt: string;
  month: string;
};

export type ProjectUsageSummary = {
  used: number;
  total: number;
  remaining: number;
  month: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getBillingMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createProjectId() {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `message-${suffix}`;
}

export function projectFromDraft(draft: MessageDraft, status: MessageProjectStatus = "Draft", savedAt?: string): MessageProject {
  return {
    id: draft.id,
    title: draft.title,
    mainScripture: draft.mainScripture,
    length: draft.length,
    lengthLabel: draft.lengthLabel,
    translation: draft.translation,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    status,
    savedAt,
    draft,
  };
}

function syncProjectFromDraft(project: MessageProject, draft: MessageDraft): MessageProject {
  return {
    ...project,
    title: draft.title,
    mainScripture: draft.mainScripture,
    length: draft.length,
    lengthLabel: draft.lengthLabel,
    translation: draft.translation,
    updatedAt: draft.updatedAt,
    draft,
  };
}

export function getProjectLibrary(): MessageProject[] {
  const projects = readJson<MessageProject[]>(MESSAGE_PROJECT_LIBRARY_KEY, []);
  return Array.isArray(projects) ? projects : [];
}

export function saveProjectLibrary(projects: MessageProject[]) {
  writeJson(MESSAGE_PROJECT_LIBRARY_KEY, projects);
}

export function getUsageLedger(): MessageUsageRecord[] {
  const ledger = readJson<MessageUsageRecord[]>(MESSAGE_USAGE_LEDGER_KEY, []);
  return Array.isArray(ledger) ? ledger : [];
}

export function saveUsageLedger(ledger: MessageUsageRecord[]) {
  writeJson(MESSAGE_USAGE_LEDGER_KEY, ledger);
}

export function getUsageSummary(date = new Date()): ProjectUsageSummary {
  const month = getBillingMonth(date);
  const used = getUsageLedger().filter((record) => record.month === month).length;
  return {
    used,
    total: SOLO_MONTHLY_PROJECT_LIMIT,
    remaining: Math.max(0, SOLO_MONTHLY_PROJECT_LIMIT - used),
    month,
  };
}

export function addUsageRecord(projectId: string, createdAt = new Date().toISOString()) {
  const ledger = getUsageLedger();
  if (ledger.some((record) => record.projectId === projectId)) return ledger;
  const next = [...ledger, { projectId, createdAt, month: getBillingMonth(new Date(createdAt)) }];
  saveUsageLedger(next);
  return next;
}

export function getActiveProjectId() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ACTIVE_MESSAGE_PROJECT_ID_KEY);
}

export function setActiveProjectId(projectId: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACTIVE_MESSAGE_PROJECT_ID_KEY, projectId);
}

export function clearActiveProjectId(projectId?: string) {
  if (!canUseStorage()) return;
  if (!projectId || window.localStorage.getItem(ACTIVE_MESSAGE_PROJECT_ID_KEY) === projectId) {
    window.localStorage.removeItem(ACTIVE_MESSAGE_PROJECT_ID_KEY);
  }
}

export function persistCompatibilityDraft(draft: MessageDraft) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(MESSAGE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function readLegacyDraft() {
  if (!canUseStorage()) return null;
  const raw =
    window.localStorage.getItem(MESSAGE_DRAFT_STORAGE_KEY) ??
    window.localStorage.getItem(PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_MESSAGE_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeMessageDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function ensureProjectLibrary() {
  const projects = getProjectLibrary();
  const legacyDraft = readLegacyDraft();
  if (!legacyDraft) return projects;

  const existing = projects.find((project) => project.id === legacyDraft.id);
  if (existing) {
    if (!getActiveProjectId()) setActiveProjectId(existing.id);
    return projects;
  }

  const migrated = projectFromDraft(legacyDraft, "Draft");
  const next = [migrated, ...projects];
  saveProjectLibrary(next);
  setActiveProjectId(migrated.id);
  persistCompatibilityDraft(legacyDraft);
  addUsageRecord(migrated.id, migrated.createdAt);
  return next;
}

export function getProject(projectId: string) {
  return getProjectLibrary().find((project) => project.id === projectId) ?? null;
}

export function createDraftProject(draft: MessageDraft) {
  const usage = getUsageSummary();
  if (usage.used >= usage.total) {
    return { project: null, error: `All ${usage.total} message projects have been used for ${usage.month}. Exploring message ideas is still free.` };
  }

  const projectId = createProjectId();
  const now = new Date().toISOString();
  const projectDraft = { ...draft, id: projectId, createdAt: draft.createdAt || now, updatedAt: now };
  const project = projectFromDraft(projectDraft, "Draft");
  const projects = [project, ...getProjectLibrary().filter((item) => item.id !== projectId)];
  saveProjectLibrary(projects);
  setActiveProjectId(project.id);
  persistCompatibilityDraft(projectDraft);
  addUsageRecord(project.id, project.createdAt);
  return { project, error: null };
}

export function updateProjectDraft(projectId: string, draft: MessageDraft) {
  const projects = getProjectLibrary();
  const existing = projects.find((project) => project.id === projectId);
  const nextDraft = { ...draft, id: projectId };
  const nextProject = existing
    ? syncProjectFromDraft(existing, nextDraft)
    : projectFromDraft(nextDraft, "Draft");
  const nextProjects = [nextProject, ...projects.filter((project) => project.id !== projectId)];
  saveProjectLibrary(nextProjects);
  setActiveProjectId(projectId);
  persistCompatibilityDraft(nextDraft);
  return nextProject;
}

export function markProjectSaved(projectId: string, draft: MessageDraft) {
  const savedAt = new Date().toISOString();
  const updated = updateProjectDraft(projectId, { ...draft, updatedAt: savedAt });
  const projects = getProjectLibrary().map((project) =>
    project.id === projectId ? { ...updated, status: "Saved" as const, savedAt } : project,
  );
  saveProjectLibrary(projects);
  setActiveProjectId(projectId);
  persistCompatibilityDraft({ ...draft, id: projectId, updatedAt: savedAt });
  return projects.find((project) => project.id === projectId) ?? null;
}

export function deleteProject(projectId: string) {
  const projects = getProjectLibrary().filter((project) => project.id !== projectId);
  saveProjectLibrary(projects);
  clearActiveProjectId(projectId);
  const activeFallback = projects[0] ?? null;
  if (activeFallback) {
    setActiveProjectId(activeFallback.id);
    persistCompatibilityDraft(activeFallback.draft);
  } else if (canUseStorage()) {
    window.localStorage.removeItem(MESSAGE_DRAFT_STORAGE_KEY);
  }
  return projects;
}

export function formatEditedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

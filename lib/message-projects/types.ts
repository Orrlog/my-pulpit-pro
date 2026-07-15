import type { MessageDraft } from "@/components/app-shell/message-draft-storage";

export type MessageProjectStatus = "Draft" | "Saved";

export type MessageProject = {
  id: string;
  legacyLocalId?: string | null;
  title: string;
  mainScripture: string;
  length: string;
  lengthLabel: string;
  translation: string;
  createdAt: string;
  updatedAt: string;
  status: MessageProjectStatus;
  savedAt?: string | null;
  draft: MessageDraft;
};

export type MessageProjectResult<T> =
  | { data: T; error: null; status?: number }
  | { data: null; error: string; status: number };

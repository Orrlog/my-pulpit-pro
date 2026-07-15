"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { MessageCard } from "@/components/app-shell/MessageCard";
import { ensureProjectLibrary, type MessageProjectStatus } from "@/components/app-shell/message-project-library";
import type { MessageProject } from "@/lib/message-projects/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MessageProject[]>([]);
  const [localProjects, setLocalProjects] = useState<MessageProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | MessageProjectStatus>("All");
  const [length, setLength] = useState("All");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/message-projects", { cache: "no-store" });
      const payload = (await response.json()) as { projects?: MessageProject[]; error?: string };
      if (!response.ok || !payload.projects) throw new Error(payload.error ?? "Projects could not be loaded.");
      setProjects(payload.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Projects could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadProjects();
      setLocalProjects(ensureProjectLibrary() as unknown as MessageProject[]);
    });
  }, []);

  const importedLegacyIds = useMemo(() => new Set(projects.map((project) => project.legacyLocalId).filter(Boolean)), [projects]);
  const availableLocalProjects = localProjects.filter((project) => !importedLegacyIds.has(project.id));

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || `${project.title} ${project.mainScripture}`.toLowerCase().includes(query);
      const matchesStatus = status === "All" || project.status === status;
      const matchesLength = length === "All" || project.lengthLabel === length;
      return matchesSearch && matchesStatus && matchesLength;
    });
  }, [length, projects, search, status]);

  async function handleDelete(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    const confirmed = window.confirm(`Delete ${project?.title ?? "this message"}? This removes it from your account.`);
    if (!confirmed) return;
    setDeleteError("");
    try {
      const response = await fetch(`/api/message-projects/${projectId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "This message could not be deleted.");
      setProjects((current) => current.filter((item) => item.id !== projectId));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "This message could not be deleted.");
    }
  }

  async function importDrafts() {
    setImporting(true);
    setImportMessage("");
    let success = 0;
    let failed = 0;
    const imported: MessageProject[] = [];
    for (const project of availableLocalProjects) {
      try {
        const response = await fetch("/api/message-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft: project.draft, legacyLocalId: project.id }),
        });
        const payload = (await response.json()) as { project?: MessageProject; error?: string };
        if (!response.ok || !payload.project) throw new Error(payload.error);
        success += 1;
        imported.push(payload.project);
      } catch {
        failed += 1;
      }
    }
    if (imported.length) {
      setProjects((current) => [...imported, ...current.filter((project) => !imported.some((item) => item.id === project.id))].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    }
    setImportMessage(failed ? `${success} imported. ${failed} could not be imported yet; you can retry.` : `${success} browser drafts imported successfully.`);
    setImporting(false);
  }

  return (
    <AppShell title="My Messages">
      <div className="grid gap-6">
        {availableLocalProjects.length ? (
          <section className="rounded-3xl border border-gold/40 bg-gold/10 p-5">
            <h2 className="text-xl font-bold text-teal">Import browser drafts</h2>
            <p className="mt-2 text-sm leading-6 text-ink">{availableLocalProjects.length} older drafts were saved only in this browser. Import them to save them securely to your My Pulpit Pro account.</p>
            <button type="button" onClick={importDrafts} disabled={importing} className="mt-4 min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong disabled:opacity-70">{importing ? "Importing..." : "Import Drafts"}</button>
            {importMessage ? <p className="mt-3 text-sm font-bold text-teal">{importMessage}</p> : null}
          </section>
        ) : null}

        <section className="rounded-3xl border border-line bg-cream-strong p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_13rem_13rem]">
            <div className="grid gap-2"><label htmlFor="project-search" className="text-sm font-bold text-ink">Search messages</label><input id="project-search" value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-12 rounded-2xl border border-line bg-background px-4" placeholder="Search by title or passage" /></div>
            <div className="grid gap-2"><label htmlFor="status-filter" className="text-sm font-bold text-ink">Status</label><select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value as "All" | MessageProjectStatus)} className="min-h-12 rounded-2xl border border-line bg-background px-4"><option value="All">All statuses</option><option value="Draft">Draft</option><option value="Saved">Saved</option></select></div>
            <div className="grid gap-2"><label htmlFor="length-filter" className="text-sm font-bold text-ink">Message length</label><select id="length-filter" value={length} onChange={(event) => setLength(event.target.value)} className="min-h-12 rounded-2xl border border-line bg-background px-4"><option value="All">All lengths</option><option value="30 minutes">30 minutes</option><option value="45 minutes">45 minutes</option><option value="60 minutes">60 minutes</option></select></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Showing Draft and Saved messages from your account.</p>
        </section>

        {deleteError ? <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm font-bold text-teal">{deleteError}</p> : null}
        {loading ? <p className="text-muted">Loading projects...</p> : null}
        {error ? <p className="rounded-2xl border border-line bg-cream-strong p-4 text-sm font-bold text-teal">{error}</p> : null}

        {!loading && !error && filteredProjects.length ? (
          <section className="grid gap-5 lg:grid-cols-3">{filteredProjects.map((project) => <MessageCard key={project.id} project={project} controls="full" onDelete={handleDelete} />)}</section>
        ) : null}
        {!loading && !error && !filteredProjects.length ? (
          <section className="rounded-3xl border border-line bg-cream-strong p-6 text-center"><h2 className="text-xl font-bold text-ink">No messages found</h2><p className="mt-2 text-sm leading-6 text-muted">Try another search or start a new message.</p><Link href="/new-message" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">Start a New Message</Link></section>
        ) : null}
      </div>
    </AppShell>
  );
}

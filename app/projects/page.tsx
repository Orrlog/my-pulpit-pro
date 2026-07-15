"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { MessageCard } from "@/components/app-shell/MessageCard";
import {
  deleteProject,
  ensureProjectLibrary,
  type MessageProject,
  type MessageProjectStatus,
} from "@/components/app-shell/message-project-library";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MessageProject[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | MessageProjectStatus>("All");
  const [length, setLength] = useState("All");

  useEffect(() => {
    queueMicrotask(() => {
      setProjects(ensureProjectLibrary().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    });
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || `${project.title} ${project.mainScripture}`.toLowerCase().includes(query);
      const matchesStatus = status === "All" || project.status === status;
      const matchesLength = length === "All" || project.lengthLabel === length;
      return matchesSearch && matchesStatus && matchesLength;
    });
  }, [length, projects, search, status]);

  function handleDelete(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    const confirmed = window.confirm(`Delete ${project?.title ?? "this message"}? This will not restore monthly project usage.`);
    if (!confirmed) return;
    setProjects(deleteProject(projectId).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  return (
    <AppShell title="My Messages">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-line bg-cream-strong p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_13rem_13rem]">
            <div className="grid gap-2">
              <label htmlFor="project-search" className="text-sm font-bold text-ink">Search messages</label>
              <input id="project-search" value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-12 rounded-2xl border border-line bg-background px-4" placeholder="Search by title or passage" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status-filter" className="text-sm font-bold text-ink">Status</label>
              <select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value as "All" | MessageProjectStatus)} className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option value="All">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Saved">Saved</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="length-filter" className="text-sm font-bold text-ink">Message length</label>
              <select id="length-filter" value={length} onChange={(event) => setLength(event.target.value)} className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option value="All">All lengths</option>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
              </select>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Showing local Draft and Saved messages stored in this browser.</p>
        </section>

        {filteredProjects.length ? (
          <section className="grid gap-5 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <MessageCard key={project.id} project={project} controls="full" onDelete={handleDelete} />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-line bg-cream-strong p-6 text-center">
            <h2 className="text-xl font-bold text-ink">No messages found</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Try another search or start a new message.</p>
            <Link href="/new-message" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">Start a New Message</Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell/AppShell";
import { MessageCard } from "@/components/app-shell/MessageCard";
import { sampleProjects } from "@/components/app-shell/data";

export const metadata = {
  title: "My Messages | My Pulpit Pro",
};

export default function ProjectsPage() {
  return (
    <AppShell title="My Messages">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-line bg-cream-strong p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_13rem_13rem]">
            <div className="grid gap-2">
              <label htmlFor="project-search" className="text-sm font-bold text-ink">
                Search messages
              </label>
              <input
                id="project-search"
                className="min-h-12 rounded-2xl border border-line bg-background px-4"
                placeholder="Search by title or passage"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status-filter" className="text-sm font-bold text-ink">
                Status
              </label>
              <select id="status-filter" className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option>All statuses</option>
                <option>Draft</option>
                <option>Ready to Print</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="length-filter" className="text-sm font-bold text-ink">
                Message length
              </label>
              <select id="length-filter" className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option>All lengths</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Filters and controls are preview behavior only. Permanent changes are not saved yet.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {sampleProjects.map((project) => (
            <MessageCard key={project.title} project={project} controls="full" />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import { MessageCard } from "./MessageCard";
import type { MessageProject } from "@/lib/message-projects/types";

export function RecentMessages({ projects }: { projects: MessageProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="mt-5 rounded-3xl border border-line bg-cream-strong p-6 text-center">
        <h3 className="text-xl font-bold text-ink">No messages yet</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Create your first message workspace to see it here.</p>
        <Link href="/new-message" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">Start a New Message</Link>
      </div>
    );
  }
  return <div className="mt-5 grid gap-5 lg:grid-cols-3">{projects.map((project) => <MessageCard key={project.id} project={project} />)}</div>;
}

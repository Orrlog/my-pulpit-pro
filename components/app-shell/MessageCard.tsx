import Link from "next/link";
import { formatEditedDate, type MessageProject } from "./message-project-library";

type MessageCardProps = {
  project: MessageProject;
  controls?: "recent" | "full";
  onDelete?: (projectId: string) => void;
};

export function MessageCard({ project, controls = "recent", onDelete }: MessageCardProps) {
  const saved = project.status === "Saved";

  return (
    <article className="premium-card rounded-3xl border border-line bg-cream-strong p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-ink">{project.title}</h3>
          <p className="mt-1 break-words text-sm font-bold text-teal">{project.mainScripture}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${saved ? "bg-teal text-cream-strong" : "bg-gold/20 text-teal"}`}>
          {project.status}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-bold text-muted">Length</dt>
          <dd className="mt-1 text-ink">{project.lengthLabel}</dd>
        </div>
        <div>
          <dt className="font-bold text-muted">Last edited</dt>
          <dd className="mt-1 text-ink">{formatEditedDate(project.updatedAt)}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/message-workspace?project=${project.id}`} className="inline-flex min-h-10 items-center rounded-full bg-teal px-4 py-2 text-sm font-bold text-cream-strong">
          Open
        </Link>
        {controls === "full" ? (
          <button type="button" onClick={() => onDelete?.(project.id)} className="min-h-10 rounded-full border border-line px-4 py-2 text-sm font-bold text-muted">
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}

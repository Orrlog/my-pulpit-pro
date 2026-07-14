type MessageCardProps = {
  project: {
    title: string;
    passage: string;
    length: string;
    edited: string;
    status: string;
  };
  controls?: "recent" | "full";
};

export function MessageCard({ project, controls = "recent" }: MessageCardProps) {
  const ready = project.status === "Ready to Print";

  return (
    <article className="premium-card rounded-3xl border border-line bg-cream-strong p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink">{project.title}</h3>
          <p className="mt-1 text-sm font-bold text-teal">{project.passage}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            ready ? "bg-teal text-cream-strong" : "bg-gold/20 text-teal"
          }`}
        >
          {project.status}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-bold text-muted">Length</dt>
          <dd className="mt-1 text-ink">{project.length}</dd>
        </div>
        <div>
          <dt className="font-bold text-muted">Date edited</dt>
          <dd className="mt-1 text-ink">{project.edited}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="min-h-10 rounded-full bg-teal px-4 py-2 text-sm font-bold text-cream-strong">
          Open
        </button>
        {controls === "full" ? (
          <>
            <button className="min-h-10 rounded-full border border-teal/25 px-4 py-2 text-sm font-bold text-teal">
              Print
            </button>
            <button className="min-h-10 rounded-full border border-line px-4 py-2 text-sm font-bold text-muted">
              Delete
            </button>
          </>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">
        Preview sample. Permanent project actions are not connected yet.
      </p>
    </article>
  );
}

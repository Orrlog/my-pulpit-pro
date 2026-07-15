import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { DashboardStartPaths } from "@/components/app-shell/DashboardStartPaths";
import { RecentMessages } from "@/components/app-shell/RecentMessages";
import { UsageCard } from "@/components/app-shell/UsageCard";

export const metadata = {
  title: "Dashboard | My Pulpit Pro",
};

export default function DashboardPage() {
  return (
    <AppShell title="Welcome back. What message are you preparing next?">
      <div className="grid gap-8">
        <UsageCard />

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Start a new message</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Choose the path that best matches where you are in preparation today.
              </p>
            </div>
            <p className="text-sm font-bold text-teal">
              Built to support sermon preparation, not replace the pastor.
            </p>
          </div>
          <DashboardStartPaths />
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Recent Messages</h2>
            <Link href="/projects" className="text-sm font-bold text-teal hover:text-teal-dark">
              View All Messages
            </Link>
          </div>
<RecentMessages />
        </section>
      </div>
    </AppShell>
  );
}

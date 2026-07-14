import { AppShell } from "@/components/app-shell/AppShell";
import { NewMessageWizard } from "@/components/app-shell/NewMessageWizard";

export const metadata = {
  title: "Start a New Message | My Pulpit Pro",
};

type NewMessagePageProps = {
  searchParams: Promise<{
    path?: string;
  }>;
};

export default async function NewMessagePage({ searchParams }: NewMessagePageProps) {
  const params = await searchParams;

  return (
    <AppShell title="Start a New Message">
      <NewMessageWizard initialPath={params.path} />
    </AppShell>
  );
}

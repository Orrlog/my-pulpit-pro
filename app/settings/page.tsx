import { AppShell } from "@/components/app-shell/AppShell";
import { getCurrentProfile } from "@/lib/profiles/current-profile";
import { updateProfileName } from "./actions";

export const metadata = {
  title: "Settings | My Pulpit Pro",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="premium-card rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="text-xl font-bold text-ink">Profile</h2>
          <form action={updateProfileName} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="profile-name" className="text-sm font-bold text-ink">
                Name
              </label>
              <input
                id="profile-name"
                name="fullName"
                defaultValue={profile?.fullName ?? ""}
                placeholder="Add your name"
                className="min-h-12 rounded-2xl border border-line bg-background px-4"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="profile-email" className="text-sm font-bold text-ink">
                Email
              </label>
              <input
                id="profile-email"
                value={profile?.email ?? ""}
                readOnly
                className="min-h-12 rounded-2xl border border-line bg-background px-4 text-muted"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="profile-role" className="text-sm font-bold text-ink">
                Account role
              </label>
              <input
                id="profile-role"
                value={profile?.role ?? "member"}
                readOnly
                className="min-h-12 rounded-2xl border border-line bg-background px-4 capitalize text-muted"
              />
            </div>
            <button className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              Save Profile
            </button>
          </form>
        </section>

        <section className="premium-card rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="text-xl font-bold text-ink">Message defaults</h2>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="default-translation" className="text-sm font-bold text-ink">
                Preferred Bible translation
              </label>
              <select id="default-translation" className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option>King James Version, KJV</option>
                <option>New King James Version, NKJV</option>
                <option>New International Version, NIV</option>
                <option>New Living Translation, NLT</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="default-length" className="text-sm font-bold text-ink">
                Default message length
              </label>
              <select id="default-length" className="min-h-12 rounded-2xl border border-line bg-background px-4">
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
          </div>
        </section>

        <section className="premium-card rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="text-xl font-bold text-ink">Plan preview</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="font-bold text-muted">Plan</dt>
              <dd className="font-bold text-teal">Solo</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="font-bold text-muted">Monthly projects</dt>
              <dd className="font-bold text-ink">8</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="font-bold text-muted">Used</dt>
              <dd className="font-bold text-ink">3</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-muted">Remaining</dt>
              <dd className="font-bold text-ink">5</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted">
            Preview data until plan tracking is connected.
          </p>
        </section>

        <section className="premium-card rounded-3xl border border-line bg-cream-strong p-6">
          <h2 className="text-xl font-bold text-ink">Account</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Account and billing actions are not connected yet.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="min-h-11 rounded-full bg-teal px-5 py-2 text-sm font-bold text-cream-strong">
              Manage Subscription
            </button>
            <button className="min-h-11 rounded-full border border-line px-5 py-2 text-sm font-bold text-muted">
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

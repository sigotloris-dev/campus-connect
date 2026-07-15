import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { calcAge, timeRemainingLabel } from "@/lib/format";
import { ProfileCard } from "@/components/profile-card";
import type { Candidate } from "@/lib/types";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  const preview: Candidate = {
    id: user.id,
    firstName: user.firstName,
    age: calcAge(user.birthDate),
    nationality: user.nationality,
    englishLevel: user.englishLevel,
    dorm: user.dorm?.name ?? null,
    timeRemaining: timeRemainingLabel(user.departureDate),
    bio: user.bio,
    photos: user.photos.map((p) => p.url),
  };

  return (
    <div className="flex flex-1 flex-col px-5 py-5">
      <header className="mb-4">
        <h1 className="text-xl font-extrabold">
          <span className="text-gradient">Your profile</span>
        </h1>
      </header>

      {/* Anteprima come la vedono gli altri */}
      <div className="mb-4 aspect-[3/4] w-full">
        <ProfileCard c={preview} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Row label="Full name" value={`${user.firstName} ${user.lastName}`} />
        <Row label="Student ID" value={user.studentCode} />
        <Row label="Email" value={user.email} />
      </div>

      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white py-3.5 font-semibold text-[var(--primary-600)]"
        >
          <LogOut size={18} /> Log out
        </button>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-2.5 last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { calcAge, timeRemainingLabel } from "@/lib/format";
import { ProfileCard } from "@/components/profile-card";
import type { Candidate } from "@/lib/types";

const userSelect = {
  id: true,
  firstName: true,
  birthDate: true,
  nationality: true,
  englishLevel: true,
  departureDate: true,
  bio: true,
  photos: { orderBy: { order: "asc" as const }, select: { url: true } },
  dorm: { select: { name: true } },
};

export default async function MatchProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const meId = session!.userId;

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      userAId: true,
      userBId: true,
      userA: { select: userSelect },
      userB: { select: userSelect },
    },
  });
  // Puoi vedere il profilo solo se fai parte di questo match
  if (!match || (match.userAId !== meId && match.userBId !== meId)) notFound();

  const other = match.userAId === meId ? match.userB : match.userA;

  const c: Candidate = {
    id: other.id,
    firstName: other.firstName,
    age: calcAge(other.birthDate),
    nationality: other.nationality,
    englishLevel: other.englishLevel,
    dorm: other.dorm?.name ?? null,
    timeRemaining: timeRemainingLabel(other.departureDate),
    bio: other.bio,
    photos: other.photos.map((p) => p.url),
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--border)] bg-white/90 px-3 py-2.5 backdrop-blur">
        <Link href={`/matches/${id}`} className="p-1 text-[var(--muted)]">
          <ChevronLeft size={24} />
        </Link>
        <span className="font-semibold">{other.firstName}</span>
      </header>

      <div className="p-4">
        <div className="aspect-[3/4] w-full">
          <ProfileCard c={c} />
        </div>
      </div>
    </div>
  );
}

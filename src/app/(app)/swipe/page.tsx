import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { calcAge, timeRemainingLabel } from "@/lib/format";
import type { Candidate } from "@/lib/types";
import { Deck } from "./deck";

export default async function SwipePage() {
  const session = await verifySession();
  const meId = session!.userId;

  // Escludi te stesso e chi hai già valutato
  const swiped = await prisma.swipe.findMany({
    where: { fromUserId: meId },
    select: { toUserId: true },
  });
  const excludeIds = [meId, ...swiped.map((s) => s.toUserId)];

  const users = await prisma.user.findMany({
    where: { id: { notIn: excludeIds } },
    include: { photos: { orderBy: { order: "asc" } }, dorm: true },
    take: 40,
  });

  const candidates: Candidate[] = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    age: calcAge(u.birthDate),
    nationality: u.nationality,
    englishLevel: u.englishLevel,
    dorm: u.dorm?.name ?? null,
    timeRemaining: timeRemainingLabel(u.departureDate),
    bio: u.bio,
    photos: u.photos.map((p) => p.url),
  }));

  // Mescola per varietà
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-5 pb-2">
        <h1 className="text-xl font-extrabold">
          <span className="text-gradient">Discover</span>
        </h1>
      </header>
      <Deck initial={candidates} />
    </div>
  );
}

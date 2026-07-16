import Link from "next/link";
import { MessageCircle, MapPin, Zap } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const photoSelect = {
  id: true,
  firstName: true,
  photos: { orderBy: { order: "asc" as const }, take: 1, select: { url: true } },
};

export default async function MatchesPage() {
  const session = await verifySession();
  const meId = session!.userId;

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: meId }, { userBId: meId }] },
    include: {
      userA: { select: photoSelect },
      userB: { select: photoSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
      meetups: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, place: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const rows = matches.map((m) => {
    const other = m.userAId === meId ? m.userB : m.userA;
    const mu = m.meetups[0];
    const confirmed = mu?.status === "CONFIRMED";
    const challengeReady = m.challengeAt.getTime() <= now;

    let subtitle: string;
    if (confirmed) subtitle = `Meetup set · ${mu!.place}`;
    else subtitle = m.messages[0]?.body ?? "New match · say hi";

    const state: "confirmed" | "ready" | "chat" = confirmed
      ? "confirmed"
      : challengeReady
        ? "ready"
        : "chat";

    return {
      id: m.id,
      name: other.firstName,
      photo: other.photos[0]?.url ?? null,
      state,
      subtitle,
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-5 pb-3">
        <h1 className="text-xl font-extrabold">
          <span className="text-gradient">Your matches</span>
        </h1>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="text-5xl">💫</div>
          <h2 className="text-lg font-bold">No matches yet</h2>
          <p className="text-sm text-[var(--muted)]">
            Head to <span className="font-semibold">Discover</span> and start
            meeting the campus.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/matches/${r.id}`}
                className="flex items-center gap-3 px-5 py-3 active:bg-black/5"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                  {r.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🎓
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{r.name}</span>
                    {r.state === "confirmed" ? (
                      <MapPin size={14} className="text-[var(--success)]" />
                    ) : r.state === "ready" ? (
                      <Zap size={14} className="text-[var(--accent)]" fill="currentColor" />
                    ) : (
                      <MessageCircle size={14} className="text-[var(--primary)]" />
                    )}
                  </div>
                  <p className="truncate text-sm text-[var(--muted)]">
                    {r.subtitle}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

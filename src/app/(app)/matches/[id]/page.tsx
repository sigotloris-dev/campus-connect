import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getMessages } from "@/app/actions/chat";
import { Chat } from "./chat";
import { ChallengeBanner } from "@/components/challenge-banner";

const otherSelect = {
  id: true,
  firstName: true,
  photos: { orderBy: { order: "asc" as const }, take: 1, select: { url: true } },
};

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const meId = session!.userId;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      userA: { select: otherSelect },
      userB: { select: otherSelect },
      meetups: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });
  if (!match || (match.userAId !== meId && match.userBId !== meId)) notFound();

  const other = match.userAId === meId ? match.userB : match.userA;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--border)] bg-white/90 px-3 py-2.5 backdrop-blur">
        <Link href="/matches" className="p-1 text-[var(--muted)]">
          <ChevronLeft size={24} />
        </Link>
        <Link
          href={`/matches/${id}/profile`}
          className="flex min-w-0 items-center gap-2"
          aria-label={`Vedi il profilo di ${other.firstName}`}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200">
            {other.photos[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={other.photos[0].url}
                alt={other.firstName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">🎓</div>
            )}
          </div>
          <span className="truncate font-semibold">{other.firstName}</span>
        </Link>
      </header>

      <ChallengeBanner
        matchId={id}
        challengeAt={match.challengeAt.toISOString()}
        meetupStatus={match.meetups[0]?.status ?? null}
        met={!!match.metAt}
      />

      <Chat matchId={id} meId={meId} initial={await getMessages(id)} />
    </div>
  );
}

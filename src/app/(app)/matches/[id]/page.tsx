import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getMessages } from "@/app/actions/chat";
import { Chat } from "./chat";
import { Meetup } from "./meetup";

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
      meetups: { orderBy: { createdAt: "desc" } },
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
        <span className="font-semibold">{other.firstName}</span>
        <span className="ml-auto rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          {match.variant === "MEETUP" ? "Meetup" : "Chat"}
        </span>
      </header>

      {match.variant === "CHAT" ? (
        <Chat matchId={id} meId={meId} initial={await getMessages(id)} />
      ) : (
        <Meetup
          matchId={id}
          meId={meId}
          otherName={other.firstName}
          latest={
            match.meetups[0]
              ? {
                  id: match.meetups[0].id,
                  proposerId: match.meetups[0].proposerId,
                  place: match.meetups[0].place,
                  time: match.meetups[0].time.toISOString(),
                  status: match.meetups[0].status,
                }
              : null
          }
        />
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Meetup } from "../meetup";

export default async function ChallengePage({
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
      userA: { select: { id: true, firstName: true } },
      userB: { select: { id: true, firstName: true } },
      meetups: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!match || (match.userAId !== meId && match.userBId !== meId)) notFound();

  // Sfida non ancora sbloccata → torna alla chat
  if (match.challengeAt.getTime() > Date.now()) redirect(`/matches/${id}`);

  const other = match.userAId === meId ? match.userB : match.userA;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--border)] bg-white/90 px-3 py-2.5 backdrop-blur">
        <Link href={`/matches/${id}`} className="p-1 text-[var(--muted)]">
          <ChevronLeft size={24} />
        </Link>
        <span className="font-semibold">Challenge · {other.firstName}</span>
      </header>

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
    </div>
  );
}

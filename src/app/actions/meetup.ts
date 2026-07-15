"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

async function assertMember(matchId: string, userId: string) {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: { userAId: true, userBId: true, variant: true },
  });
  if (!m || (m.userAId !== userId && m.userBId !== userId)) return null;
  return m;
}

export async function proposeMeetup(
  matchId: string,
  place: string,
  timeIso: string,
): Promise<{ ok: boolean; error?: string }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");

  const m = await assertMember(matchId, s.userId);
  if (!m) throw new Error("Match not found");
  if (m.variant !== "MEETUP") throw new Error("Not available for this match");

  if (!place.trim()) return { ok: false, error: "Choose a place" };
  const time = new Date(timeIso);
  if (Number.isNaN(time.getTime()) || time.getTime() < Date.now()) {
    return { ok: false, error: "Choose a future time" };
  }

  await prisma.meetup.create({
    data: {
      matchId,
      proposerId: s.userId,
      place: place.trim(),
      time,
      status: "PROPOSED",
    },
  });
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

export async function respondMeetup(
  meetupId: string,
  accept: boolean,
): Promise<{ ok: boolean }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");

  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    select: { id: true, matchId: true, proposerId: true, status: true },
  });
  if (!meetup) throw new Error("Proposal not found");

  const m = await assertMember(meetup.matchId, s.userId);
  if (!m) throw new Error("Not authorized");
  // Only the recipient (not the proposer) can respond
  if (meetup.proposerId === s.userId) throw new Error("You can't respond to your own proposal");
  if (meetup.status !== "PROPOSED") return { ok: true };

  await prisma.meetup.update({
    where: { id: meetupId },
    data: { status: accept ? "CONFIRMED" : "DECLINED" },
  });
  revalidatePath(`/matches/${meetup.matchId}`);
  return { ok: true };
}

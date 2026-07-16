"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, EyeOff, Zap } from "lucide-react";
import { TIMER_REVEAL_WINDOWS } from "@/lib/constants";

function inWindow(d: Date): boolean {
  const h = d.getHours();
  return TIMER_REVEAL_WINDOWS.some(([s, e]) => h >= s && h < e);
}

function nextWindowStart(d: Date): Date {
  const starts = TIMER_REVEAL_WINDOWS.map(([s]) => s).sort((a, b) => a - b);
  const res = new Date(d);
  res.setMinutes(0, 0, 0);
  const next = starts.find((s) => s > d.getHours());
  if (next !== undefined) {
    res.setHours(next);
  } else {
    res.setDate(res.getDate() + 1);
    res.setHours(starts[0]);
  }
  return res;
}

function fmtRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function ChallengeBanner({
  matchId,
  challengeAt,
  meetupStatus,
}: {
  matchId: string;
  challengeAt: string;
  meetupStatus: string | null;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return null; // evita mismatch SSR/idratazione

  const target = new Date(challengeAt).getTime();
  const unlocked = now >= target;

  // Sfida sbloccata
  if (unlocked) {
    if (meetupStatus === "CONFIRMED") {
      return (
        <Link
          href={`/matches/${matchId}/challenge`}
          className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--success)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--success)]"
        >
          <CheckCircle2 size={18} /> Meetup confirmed — tap for details
        </Link>
      );
    }
    return (
      <Link
        href={`/matches/${matchId}/challenge`}
        className="brand-gradient flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Zap size={18} fill="currentColor" /> Challenge unlocked! Schedule your
        meetup →
      </Link>
    );
  }

  // Sfida bloccata: countdown visibile solo nelle finestre orarie
  const nowDate = new Date(now);
  if (inWindow(nowDate)) {
    return (
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium">
        <Clock size={18} className="text-[var(--accent)]" />
        Challenge unlocks in{" "}
        <span className="font-bold text-[var(--accent)]">
          {fmtRemaining(target - now)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--muted)]">
      <EyeOff size={18} />
      Timer hidden · peek again around {fmtTime(nextWindowStart(nowDate))}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Zap, Clock, PartyPopper } from "lucide-react";
import { ProfileCard } from "@/components/profile-card";
import { swipe, type SwipeResult } from "@/app/actions/swipe";
import type { Candidate } from "@/lib/types";

export function Deck({ initial }: { initial: Candidate[] }) {
  const [queue, setQueue] = useState<Candidate[]>(initial);
  const [pending, startTransition] = useTransition();
  const [match, setMatch] = useState<SwipeResult | null>(null);
  const [leaving, setLeaving] = useState<null | "now" | "later">(null);

  const current = queue[0];
  const busy = pending || leaving !== null;

  // "Meet now" — come il like: registra e verifica il match reciproco
  function meetNow() {
    if (!current || busy) return;
    const target = current;
    setLeaving("now");
    startTransition(async () => {
      const res = await swipe(target.id, true);
      if (res.matched) setMatch(res);
      setQueue((q) => q.slice(1));
      setLeaving(null);
    });
  }

  // "Meet later" — nessun record permanente: sposta il profilo in fondo alla coda
  function meetLater() {
    if (!current || busy) return;
    setLeaving("later");
    setTimeout(() => {
      setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q));
      setLeaving(null);
    }, 180);
  }

  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="text-5xl">🌱</div>
        <h2 className="text-lg font-bold">That&apos;s everyone for now</h2>
        <p className="text-sm text-[var(--muted)]">
          You&apos;ve reached out to everyone available. Check back later — the
          campus is always changing!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <div
          className={`absolute inset-0 px-4 pb-2 transition-all duration-200 ${
            leaving === "now"
              ? "translate-x-8 rotate-3 opacity-0"
              : leaving === "later"
                ? "translate-y-6 opacity-0"
                : ""
          }`}
        >
          <ProfileCard key={current.id} c={current} />
        </div>
      </div>

      <div className="flex items-stretch justify-center gap-3 px-4 py-4">
        <button
          onClick={meetLater}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white py-4 font-semibold text-[var(--foreground)] shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          <Clock size={20} className="text-[var(--muted)]" />
          Meet later
        </button>
        <button
          onClick={meetNow}
          disabled={busy}
          className="brand-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
        >
          <Zap size={20} fill="currentColor" />
          Meet now
        </button>
      </div>

      {match && (
        <MatchOverlay result={match} onClose={() => setMatch(null)} />
      )}
    </div>
  );
}

function MatchOverlay({
  result,
  onClose,
}: {
  result: SwipeResult;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/70 px-8 text-center backdrop-blur-sm">
      <PartyPopper size={56} className="text-white" />
      <h2 className="text-3xl font-extrabold text-white">It&apos;s a match!</h2>
      <p className="text-white/90">
        You and <span className="font-semibold">{result.name}</span> liked each
        other.
      </p>
      <p className="max-w-xs text-sm text-white/70">
        You&apos;ve unlocked a chat — say hi and break the ice! 👋
      </p>
      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        <Link
          href={`/matches/${result.matchId}`}
          className="brand-gradient w-full rounded-xl py-3.5 font-semibold text-white shadow-md"
        >
          Open chat
        </Link>
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-white/15 py-3 font-semibold text-white"
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Check, X } from "lucide-react";
import { CAMPUS_PLACES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { proposeMeetup, respondMeetup } from "@/app/actions/meetup";

type Latest = {
  id: string;
  proposerId: string;
  place: string;
  time: string;
  status: string;
} | null;

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)]";

export function Meetup({
  matchId,
  meId,
  otherName,
  latest,
}: {
  matchId: string;
  meId: string;
  otherName: string;
  latest: Latest;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [place, setPlace] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  function propose() {
    setError(null);
    if (!place) return setError("Choose a place");
    if (!time) return setError("Choose a date and time");
    startTransition(async () => {
      const res = await proposeMeetup(matchId, place, time);
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else router.refresh();
    });
  }

  function respond(accept: boolean) {
    if (!latest) return;
    startTransition(async () => {
      await respondMeetup(latest.id, accept);
      router.refresh();
    });
  }

  // Confirmed meetup
  if (latest?.status === "CONFIRMED") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
          <Check size={32} />
        </div>
        <h2 className="text-xl font-bold">Meetup confirmed!</h2>
        <div className="w-full max-w-xs rounded-2xl bg-white p-4 text-left shadow-sm">
          <p className="flex items-center gap-2 font-medium">
            <MapPin size={18} className="text-[var(--accent)]" />
            {latest.place}
          </p>
          <p className="mt-2 flex items-center gap-2 text-[var(--muted)]">
            <Clock size={18} />
            {formatDateTime(latest.time)}
          </p>
        </div>
        <p className="text-sm text-[var(--muted)]">
          See you there with {otherName}. Have fun! 🎉
        </p>
      </div>
    );
  }

  // Pending proposal
  if (latest?.status === "PROPOSED") {
    const mine = latest.proposerId === meId;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <h2 className="text-lg font-bold">
          {mine ? "Proposal sent" : `${otherName} suggested a meetup`}
        </h2>
        <div className="w-full max-w-xs rounded-2xl bg-white p-4 text-left shadow-sm">
          <p className="flex items-center gap-2 font-medium">
            <MapPin size={18} className="text-[var(--accent)]" />
            {latest.place}
          </p>
          <p className="mt-2 flex items-center gap-2 text-[var(--muted)]">
            <Clock size={18} />
            {formatDateTime(latest.time)}
          </p>
        </div>
        {mine ? (
          <p className="text-sm text-[var(--muted)]">
            Waiting for {otherName} to confirm…
          </p>
        ) : (
          <div className="flex w-full max-w-xs gap-3">
            <button
              onClick={() => respond(false)}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--border)] bg-white py-3 font-semibold"
            >
              <X size={18} /> Decline
            </button>
            <button
              onClick={() => respond(true)}
              disabled={pending}
              className="brand-gradient flex flex-1 items-center justify-center gap-1 rounded-xl py-3 font-semibold text-white"
            >
              <Check size={18} /> Confirm
            </button>
          </div>
        )}
      </div>
    );
  }

  // No active proposal (or declined) → form to propose
  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-6">
      {latest?.status === "DECLINED" && (
        <p className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
          The previous proposal was declined. Try another one.
        </p>
      )}
      <div className="text-center">
        <div className="text-4xl">📍</div>
        <h2 className="mt-2 text-lg font-bold">Blind date</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          No chat: pick where and when to meet on campus.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Place</label>
        <select
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a place…</option>
          {CAMPUS_PLACES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">When</label>
        <input
          type="datetime-local"
          min={nowLocal}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {error}
        </p>
      )}

      <button
        onClick={propose}
        disabled={pending}
        className="brand-gradient mt-2 w-full rounded-xl py-3.5 font-semibold text-white shadow-md active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send proposal"}
      </button>
    </div>
  );
}

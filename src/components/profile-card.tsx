"use client";

import { useState } from "react";
import { Clock, GraduationCap, Home } from "lucide-react";
import { countryName, flagEmoji, ENGLISH_LEVEL_LABEL } from "@/lib/constants";
import type { Candidate } from "@/lib/types";
import type { EnglishLevel } from "@/lib/constants";

export function ProfileCard({ c }: { c: Candidate }) {
  const [i, setI] = useState(0);
  const photos = c.photos.length > 0 ? c.photos : [];
  const hasPhotos = photos.length > 0;

  function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (photos.length < 2) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) setI((v) => (v - 1 + photos.length) % photos.length);
    else setI((v) => (v + 1) % photos.length);
  }

  const engLabel =
    ENGLISH_LEVEL_LABEL[c.englishLevel as EnglishLevel] ?? c.englishLevel;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-xl">
      {/* Foto */}
      <div className="absolute inset-0" onClick={tap}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[i]}
            alt={c.firstName}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-300 text-6xl">
            🎓
          </div>
        )}
      </div>

      {/* Indicatori foto */}
      {photos.length > 1 && (
        <div className="absolute inset-x-3 top-3 flex gap-1.5">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full ${
                idx === i ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Gradiente + info */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pt-16 text-white">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-bold leading-tight">
            {c.firstName}, {c.age}
          </h2>
          <span className="pb-0.5 text-xl">{flagEmoji(c.nationality)}</span>
        </div>
        <p className="mt-0.5 text-sm text-white/85">
          {countryName(c.nationality)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Chip icon={<GraduationCap size={14} />}>{engLabel}</Chip>
          <Chip icon={<Clock size={14} />}>{c.timeRemaining}</Chip>
          {c.dorm && <Chip icon={<Home size={14} />}>{c.dorm}</Chip>}
        </div>

        {c.bio && <p className="mt-3 text-sm text-white/90">{c.bio}</p>}
      </div>
    </div>
  );
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

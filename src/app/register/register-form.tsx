"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { register } from "@/app/actions/auth";
import {
  COUNTRIES,
  ENGLISH_LEVELS,
  ENGLISH_LEVEL_LABEL,
  flagEmoji,
} from "@/lib/constants";

type Dorm = { id: string; name: string };

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)]";

const STEPS = ["ID", "Account", "Profile", "Photos"];

export function RegisterForm({ dorms }: { dorms: Dorm[] }) {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(register, undefined);
  const [localError, setLocalError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    studentCode: "",
    firstName: "",
    lastName: "",
    email: "",
    pin: "",
    pin2: "",
    birthDate: "",
    nationality: "",
    englishLevel: "",
    dormId: "",
    departureDate: "",
    bio: "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fe = (state && !state.ok && state.fieldErrors) || {};

  // If the server reports errors, jump back to the first step containing them
  useEffect(() => {
    if (!state || state.ok) return;
    const stepOf: Record<string, number> = {
      studentCode: 0,
      firstName: 1,
      lastName: 1,
      email: 1,
      pin: 1,
      birthDate: 2,
      nationality: 2,
      englishLevel: 2,
      dormId: 2,
      departureDate: 2,
      bio: 2,
      photos: 3,
    };
    const keys = Object.keys(fe);
    if (keys.length > 0) {
      const target = Math.min(...keys.map((k) => stepOf[k] ?? 3));
      setStep(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const previews = useMemo(
    () => photos.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [photos],
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  function validateStep(): boolean {
    setLocalError(null);
    if (step === 0) {
      if (form.studentCode.trim().length < 3) {
        setLocalError("Enter a valid student ID");
        return false;
      }
    }
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setLocalError("Enter your first and last name");
        return false;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        setLocalError("Enter a valid email");
        return false;
      }
      if (!/^\d{4,6}$/.test(form.pin)) {
        setLocalError("The PIN must be 4 to 6 digits");
        return false;
      }
      if (form.pin !== form.pin2) {
        setLocalError("The two PINs don't match");
        return false;
      }
    }
    if (step === 2) {
      if (
        !form.birthDate ||
        !form.nationality ||
        !form.englishLevel ||
        !form.dormId ||
        !form.departureDate
      ) {
        setLocalError("Fill in all the profile fields");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setLocalError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files).slice(0, 4) : [];
    setPhotos(list);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "brand-gradient" : "bg-[var(--border)]"
              }`}
            />
          </div>
        ))}
      </div>

      {/* STEP 0 — Student ID */}
      <section className={step === 0 ? "" : "hidden"}>
        <label className="mb-1 block text-sm font-medium">Student ID</label>
        <input
          name="studentCode"
          value={form.studentCode}
          onChange={(e) => set("studentCode", e.target.value)}
          autoCapitalize="characters"
          placeholder="e.g. EF-2024-0198"
          className={inputClass}
        />
        {fe.studentCode && (
          <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.studentCode[0]}</p>
        )}
        <p className="mt-3 rounded-lg bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted)]">
          Your ID keeps the community authentic: one ID = one profile.
        </p>
      </section>

      {/* STEP 1 — Account */}
      <section className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">First name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Last name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {(fe.firstName || fe.lastName) && (
          <p className="text-sm text-[var(--primary-600)]">
            {fe.firstName?.[0] ?? fe.lastName?.[0]}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@example.com"
            className={inputClass}
          />
          {fe.email && (
            <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.email[0]}</p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">PIN (4-6 digits)</label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={form.pin}
              onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={form.pin2}
              onChange={(e) => set("pin2", e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </div>
        </div>
        {fe.pin && (
          <p className="text-sm text-[var(--primary-600)]">{fe.pin[0]}</p>
        )}
      </section>

      {/* STEP 2 — Profile */}
      <section className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <div>
          <label className="mb-1 block text-sm font-medium">Date of birth</label>
          <input
            name="birthDate"
            type="date"
            max={today}
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
            className={inputClass}
          />
          {fe.birthDate && (
            <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.birthDate[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nationality</label>
          <select
            name="nationality"
            value={form.nationality}
            onChange={(e) => set("nationality", e.target.value)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {flagEmoji(c.code)} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">English level</label>
          <select
            name="englishLevel"
            value={form.englishLevel}
            onChange={(e) => set("englishLevel", e.target.value)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {ENGLISH_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {ENGLISH_LEVEL_LABEL[lvl]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Dorm</label>
          <select
            name="dormId"
            value={form.dormId}
            onChange={(e) => set("dormId", e.target.value)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {dorms.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            End of stay on campus
          </label>
          <input
            name="departureDate"
            type="date"
            min={today}
            value={form.departureDate}
            onChange={(e) => set("departureDate", e.target.value)}
            className={inputClass}
          />
          {fe.departureDate && (
            <p className="mt-1 text-sm text-[var(--primary-600)]">
              {fe.departureDate[0]}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Bio <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="A couple of words about you, what you're looking for…"
            className={inputClass + " resize-none"}
          />
        </div>
      </section>

      {/* STEP 3 — Photos */}
      <section className={step === 3 ? "flex flex-col gap-4" : "hidden"}>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Your photos (1-4)
          </label>
          <input
            ref={fileRef}
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-[var(--border)] bg-white py-8 text-[var(--muted)]"
          >
            + Choose photos
          </button>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.url}
                  src={p.url}
                  alt={p.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          {fe.photos && (
            <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.photos[0]}</p>
          )}
        </div>
      </section>

      {/* Errors */}
      {localError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {localError}
        </p>
      )}
      {state && !state.ok && state.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {state.error}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 font-semibold"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="brand-gradient flex-1 rounded-xl py-3.5 font-semibold text-white shadow-md active:scale-[0.99]"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending || photos.length === 0}
            className="brand-gradient flex-1 rounded-xl py-3.5 font-semibold text-white shadow-md active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create profile"}
          </button>
        )}
      </div>
    </form>
  );
}

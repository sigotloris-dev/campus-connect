"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const fe = (state && !state.ok && state.fieldErrors) || {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Student ID</label>
        <input
          name="studentCode"
          autoCapitalize="characters"
          placeholder="e.g. EF-2024-0198"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)]"
        />
        {fe.studentCode && (
          <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.studentCode[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">PIN</label>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base tracking-[0.3em] outline-none focus:border-[var(--primary)]"
        />
        {fe.pin && (
          <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.pin[0]}</p>
        )}
      </div>

      {state && !state.ok && state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-2 w-full rounded-xl py-3.5 text-base font-semibold text-white shadow-md transition active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

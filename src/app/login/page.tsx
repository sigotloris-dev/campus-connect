import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await verifySession()) redirect("/swipe");

  return (
    <div className="app-shell justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <div className="brand-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg">
          🎓
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-gradient">Campus Connect</span>
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Meet new people on your campus
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Don&apos;t have a profile?{" "}
        <Link href="/register" className="font-semibold text-[var(--primary)]">
          Sign up
        </Link>
      </p>
    </div>
  );
}

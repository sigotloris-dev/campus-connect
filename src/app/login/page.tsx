import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/logo";

export default async function LoginPage() {
  if (await verifySession()) redirect("/swipe");

  return (
    <div className="app-shell justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
          <Logo className="h-full w-full" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-gradient">StudyBuddy</span>
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

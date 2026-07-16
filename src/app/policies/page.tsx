import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Policies · StudyBuddy",
};

// Da completare: contatto e data di aggiornamento
const CONTACT = "[your contact email]";
const LAST_UPDATED = "July 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--foreground)]">
        {children}
      </ul>
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li>
      <span className="font-semibold">{label}:</span> {children}
    </li>
  );
}

export default function PoliciesPage() {
  return (
    <div className="app-shell px-6 py-8">
      <header className="mb-5">
        <Link
          href="/register"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)]"
        >
          <ChevronLeft size={18} /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl">
            <Logo className="h-full w-full" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight">Policies</h1>
            <p className="text-xs text-[var(--muted)]">StudyBuddy</p>
          </div>
        </div>
      </header>

      <p className="rounded-xl bg-white p-4 text-sm leading-relaxed shadow-sm">
        StudyBuddy is a <b>free, non-commercial prototype</b> that helps
        international students on campus meet and connect. It is not an official
        service. By creating an account you agree to the terms below.
      </p>

      <Section title="Terms of Use">
        <Item label="Eligibility">
          You must be at least 16 years old and a student on the campus. One
          account per person.
        </Item>
        <Item label="Your account">
          You sign up with a student ID and a PIN. Keep your PIN private — you
          are responsible for what happens on your account. The student ID is not
          verified; it only helps discourage fake profiles.
        </Item>
        <Item label="Acceptable use">
          Use StudyBuddy respectfully and lawfully. Do not harass, impersonate,
          spam, or post illegal or harmful content, and do not use it for
          commercial purposes.
        </Item>
        <Item label="Meeting people">
          StudyBuddy only helps you connect — any meeting happens at your own
          risk. Meet in public places on campus and use common sense.
        </Item>
        <Item label="Prototype, no warranty">
          The app is provided “as is”, without warranties. It may change, break,
          or be discontinued at any time, and data could be lost.
        </Item>
        <Item label="Termination">
          We may suspend or remove accounts that break these terms.
        </Item>
        <Item label="Contact">{CONTACT}</Item>
      </Section>

      <Section title="Privacy Policy">
        <Item label="What we collect">
          First and last name, email, student ID, date of birth, nationality,
          English level, dorm, photos, bio, and the messages you send.
        </Item>
        <Item label="How we use it">
          Only to run the service — create your profile, show you to other
          students, and enable connections and chat.
        </Item>
        <Item label="Who can see it">
          Other students see your public profile (photos, first name, age,
          nationality, English level, time left on campus, dorm, bio). We do not
          sell your data.
        </Item>
        <Item label="Storage">
          Data is stored on third-party hosting and database providers and
          protected with reasonable measures. No system is 100% secure.
        </Item>
        <Item label="Your choices">
          You can edit most of your profile in the app. To delete your account
          and data, contact {CONTACT}.
        </Item>
        <Item label="Retention">
          We keep your data while your account is active.
        </Item>
      </Section>

      <Section title="Community Guidelines">
        <Item label="Be respectful">
          Everyone is here to make friends and connections — be kind and open.
        </Item>
        <Item label="Zero tolerance">
          No harassment, hate speech, threats, or sexual, explicit or
          discriminatory content.
        </Item>
        <Item label="Be yourself">
          No impersonation or fake profiles.
        </Item>
        <Item label="Respect privacy">
          Don’t share other people’s photos or messages without their consent.
        </Item>
        <Item label="Stay safe">
          When meeting someone, choose public campus spots, meet during the day,
          and tell a friend where you’re going.
        </Item>
        <Item label="Reporting">
          Report problems or bad behavior to {CONTACT}. Breaking these guidelines
          may lead to removal.
        </Item>
      </Section>

      <p className="mt-8 text-xs text-[var(--muted)]">
        Last updated: {LAST_UPDATED}
      </p>
    </div>
  );
}

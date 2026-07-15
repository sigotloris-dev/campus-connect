"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "cc-install-dismissed";

export function PWA() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Registra il service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          /* registrazione fallita: l'app funziona comunque */
        });
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setDismissed(false);

    // Android / Chrome: intercetta il prompt nativo
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari: nessun prompt nativo → mostra istruzioni
    const isIOS = /iad|iphone|ipod/i.test(navigator.userAgent);
    const isSafari =
      /safari/i.test(navigator.userAgent) &&
      !/crios|fxios|edgios/i.test(navigator.userAgent);
    if (isIOS && isSafari) setShowIOS(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function close() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* localStorage non disponibile */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    close();
  }

  if (dismissed || (!deferred && !showIOS)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-[28rem] items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl">
        <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg">
          🎓
        </div>
        {deferred ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Install Campus Connect</p>
              <p className="truncate text-xs text-[var(--muted)]">
                Add it to your Home Screen to open it like an app.
              </p>
            </div>
            <button
              onClick={install}
              className="brand-gradient flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            >
              <Download size={16} /> Install
            </button>
          </>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Add to Home Screen</p>
            <p className="text-xs text-[var(--muted)]">
              Tap{" "}
              <Share size={13} className="inline align-[-2px]" /> then
              &quot;Add to Home Screen&quot;.
            </p>
          </div>
        )}
        <button
          onClick={close}
          aria-label="Close"
          className="shrink-0 self-start p-1 text-[var(--muted)]"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

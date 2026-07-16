"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpFromLine,
  CheckCircle2,
  Download,
  MoreVertical,
  SquarePlus,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";

type Platform = "ios-safari" | "ios-other" | "android" | "desktop";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Ctx = {
  ready: boolean;
  isStandalone: boolean;
  platform: Platform;
  canPrompt: boolean;
  promptInstall: () => Promise<void>;
  openGuide: () => void;
};

const InstallContext = createContext<Ctx | null>(null);

export function useInstall(): Ctx {
  const c = useContext(InstallContext);
  if (!c) throw new Error("useInstall must be used within <InstallProvider>");
  return c;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) {
    const isSafari =
      /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
    return isSafari ? "ios-safari" : "ios-other";
  }
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

const DISMISS_KEY = "cc-install-dismissed";

// Aree dell'app riservate agli utenti loggati (qui può comparire il banner)
const APP_AREAS = ["/swipe", "/matches", "/profile"];

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    // Registra il service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    setPlatform(detectPlatform());
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);
    setBannerDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    setReady(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const openGuide = useCallback(() => setGuideOpen(true), []);

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* localStorage non disponibile */
    }
  }

  const ctx: Ctx = {
    ready,
    isStandalone,
    platform,
    canPrompt: !!deferred,
    promptInstall,
    openGuide,
  };

  // Solo nell'area loggata (non su login/registrazione)
  const onAppArea = APP_AREAS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const showBanner =
    ready && onAppArea && !isStandalone && !bannerDismissed && !guideOpen;

  return (
    <InstallContext.Provider value={ctx}>
      {children}

      {showBanner && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex w-full max-w-[28rem] items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl">
              <Logo className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Install StudyBuddy</p>
              <p className="truncate text-xs text-[var(--muted)]">
                Add it to your Home Screen.
              </p>
            </div>
            <button
              onClick={openGuide}
              className="brand-gradient shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            >
              Install
            </button>
            <button
              onClick={dismissBanner}
              aria-label="Close"
              className="shrink-0 self-start p-1 text-[var(--muted)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <InstallModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        platform={platform}
        canPrompt={!!deferred}
        promptInstall={promptInstall}
      />
    </InstallContext.Provider>
  );
}

// Pulsante da mettere dove serve (es. pagina Profilo)
export function InstallButton() {
  const { ready, isStandalone, openGuide } = useInstall();
  if (!ready) return null;

  if (isStandalone) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white py-3.5 text-sm font-medium text-[var(--muted)]">
        <CheckCircle2 size={18} className="text-[var(--success)]" /> App installed
      </div>
    );
  }

  return (
    <button
      onClick={openGuide}
      className="brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-md active:scale-[0.99]"
    >
      <Download size={18} /> Add to Home Screen
    </button>
  );
}

function InstallModal({
  open,
  onClose,
  platform,
  canPrompt,
  promptInstall,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform;
  canPrompt: boolean;
  promptInstall: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-[30rem] overflow-y-auto rounded-t-3xl bg-white p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border)]" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Install the app</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--muted)]">
            <X size={22} />
          </button>
        </div>
        <ModalBody
          platform={platform}
          canPrompt={canPrompt}
          promptInstall={promptInstall}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function ModalBody({
  platform,
  canPrompt,
  promptInstall,
  onClose,
}: {
  platform: Platform;
  canPrompt: boolean;
  promptInstall: () => Promise<void>;
  onClose: () => void;
}) {
  // Android / desktop con prompt nativo disponibile
  if (canPrompt) {
    return (
      <div>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Add StudyBuddy to your device for quick, full-screen access — no
          app store needed.
        </p>
        <button
          onClick={async () => {
            await promptInstall();
            onClose();
          }}
          className="brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-md"
        >
          <Download size={18} /> Install now
        </button>
      </div>
    );
  }

  if (platform === "ios-safari") {
    return (
      <ol className="space-y-4">
        <Step n={1} icon={<ArrowUpFromLine size={18} />}>
          Tap the <b>Share</b> button in the Safari toolbar (the square with an
          arrow pointing up).
        </Step>
        <Step n={2} icon={<SquarePlus size={18} />}>
          Scroll down and tap <b>Add to Home Screen</b>.
        </Step>
        <Step n={3} icon={<CheckCircle2 size={18} />}>
          Tap <b>Add</b> in the top-right corner. The icon appears on your Home
          Screen.
        </Step>
      </ol>
    );
  }

  if (platform === "ios-other") {
    return (
      <div>
        <p className="mb-4 rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
          On iPhone/iPad, apps can be added to the Home Screen only from{" "}
          <b>Safari</b>. Open this page in Safari, then follow the steps.
        </p>
        <ol className="space-y-4">
          <Step n={1} icon={<ArrowUpFromLine size={18} />}>
            In Safari, tap the <b>Share</b> button.
          </Step>
          <Step n={2} icon={<SquarePlus size={18} />}>
            Tap <b>Add to Home Screen</b>.
          </Step>
          <Step n={3} icon={<CheckCircle2 size={18} />}>
            Tap <b>Add</b>.
          </Step>
        </ol>
      </div>
    );
  }

  if (platform === "android") {
    return (
      <ol className="space-y-4">
        <Step n={1} icon={<MoreVertical size={18} />}>
          Tap the <b>⋮</b> menu (top-right of your browser).
        </Step>
        <Step n={2} icon={<SquarePlus size={18} />}>
          Tap <b>Add to Home screen</b> (or <b>Install app</b>).
        </Step>
        <Step n={3} icon={<CheckCircle2 size={18} />}>
          Confirm with <b>Add</b> / <b>Install</b>.
        </Step>
      </ol>
    );
  }

  // Desktop senza prompt nativo
  return (
    <ol className="space-y-4">
      <Step n={1} icon={<Download size={18} />}>
        Click the <b>install icon</b> in your browser&apos;s address bar (right
        side).
      </Step>
      <Step n={2} icon={<SquarePlus size={18} />}>
        Or open the browser menu and choose <b>Install StudyBuddy</b>.
      </Step>
      <Step n={3} icon={<CheckCircle2 size={18} />}>
        Confirm to add it to your apps.
      </Step>
    </ol>
  );
}

function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="brand-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
        {n}
      </span>
      <span className="flex-1 text-sm leading-relaxed">
        <span className="mr-1 inline-flex align-[-3px] text-[var(--accent)]">
          {icon}
        </span>
        {children}
      </span>
    </li>
  );
}

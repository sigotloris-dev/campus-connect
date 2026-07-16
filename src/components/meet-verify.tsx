"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { CheckCircle2, QrCode, ScanLine } from "lucide-react";
import {
  startVerification,
  redeemVerification,
  getMetStatus,
} from "@/app/actions/verify";

type Mode = "idle" | "show" | "scan";

export function MeetVerify({
  matchId,
  initialMet,
}: {
  matchId: string;
  initialMet: boolean;
}) {
  const [met, setMet] = useState(initialMet);
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const redeemingRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Modalità "mostra QR": attiva un codice effimero e attende la scansione
  useEffect(() => {
    if (mode !== "show") return;
    let poll: ReturnType<typeof setInterval> | null = null;
    let tick: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    (async () => {
      setError(null);
      setQr(null);
      const res = await startVerification(matchId);
      if (cancelled) return;
      if (!res.ok || !res.code || !res.expiresAt) {
        setError(res.error ?? "Couldn't activate the code");
        return;
      }
      const dataUrl = await QRCode.toDataURL(res.code, { width: 256, margin: 1 });
      if (cancelled) return;
      setQr(dataUrl);
      const exp = new Date(res.expiresAt).getTime();
      const update = () =>
        setSecondsLeft(Math.max(0, Math.ceil((exp - Date.now()) / 1000)));
      update();
      tick = setInterval(update, 500);
      poll = setInterval(async () => {
        try {
          const st = await getMetStatus(matchId);
          if (st.met) {
            setMet(true);
            setMode("idle");
          }
        } catch {
          /* ignora */
        }
      }, 2000);
    })();

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (tick) clearInterval(tick);
    };
  }, [mode, matchId]);

  // Modalità "scansiona": fotocamera + jsQR
  useEffect(() => {
    if (mode !== "scan") return;
    let cancelled = false;
    setError(null);
    redeemingRef.current = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        const loop = () => {
          if (cancelled) return;
          if (
            video.readyState === video.HAVE_ENOUGH_DATA &&
            !redeemingRef.current
          ) {
            const w = 300;
            const h =
              Math.round((video.videoHeight / video.videoWidth) * w) || 300;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const found = jsQR(img.data, w, h);
            if (found?.data) {
              redeemingRef.current = true;
              redeemVerification(matchId, found.data)
                .then((r) => {
                  if (r.ok) {
                    setMet(true);
                    stopCamera();
                    setMode("idle");
                  } else {
                    setError(r.error ?? "Invalid code");
                    redeemingRef.current = false;
                  }
                })
                .catch(() => {
                  redeemingRef.current = false;
                });
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setError(
          "Camera access is needed to scan. Allow it in your browser settings.",
        );
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mode, matchId, stopCamera]);

  if (met) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--success)]/10 p-5 text-center">
        <CheckCircle2 size={40} className="text-[var(--success)]" />
        <p className="font-bold">You met! ✅</p>
        <p className="text-sm text-[var(--muted)]">Meeting verified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-center font-bold">Verify you met</h3>
      <p className="mt-1 text-center text-sm text-[var(--muted)]">
        When you&apos;re together, one shows the QR and the other scans it. The
        code lasts 60 seconds.
      </p>

      {mode === "idle" && (
        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => setMode("show")}
            className="brand-gradient flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white"
          >
            <QrCode size={18} /> Show my QR code
          </button>
          <button
            onClick={() => setMode("scan")}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3.5 font-semibold"
          >
            <ScanLine size={18} /> Scan their code
          </button>
        </div>
      )}

      {mode === "show" && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {qr ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code" className="h-56 w-56 rounded-xl" />
              {secondsLeft > 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Active for <b className="text-[var(--foreground)]">{secondsLeft}s</b> ·
                  ask them to scan it
                </p>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Expired —{" "}
                  <button
                    onClick={() => setMode("show")}
                    className="font-semibold text-[var(--primary)]"
                  >
                    activate again
                  </button>
                </p>
              )}
            </>
          ) : (
            <p className="py-10 text-sm text-[var(--muted)]">Activating…</p>
          )}
          <button
            onClick={() => setMode("idle")}
            className="text-sm text-[var(--muted)]"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === "scan" && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/70" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-sm text-[var(--muted)]">Point at their QR code…</p>
          <button
            onClick={() => setMode("idle")}
            className="text-sm text-[var(--muted)]"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {error}
        </p>
      )}
    </div>
  );
}

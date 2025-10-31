"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ProjectsShowcase() {
  const ref = useRef<HTMLElement | null>(null);

  // Timeline strictement bornée à la vie du sticky (pin => release)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // ==== TIMELINE (0 → 1) ====
  // PAPER
  const P_CARD_START = 0.1;
  const P_CARD_CENTER = 0.24;
  const P_CARD_EXIT = 0.36;

  // Crossfade Paper → Kodex (après disparition totale de la card Paper)
  const X1_START = P_CARD_EXIT; // 0.36
  const X1_END = X1_START + 0.06; // 0.42

  // KODEX (vidéo immobile, card seule qui monte)
  const K_CARD_START = X1_START + 0.02; // 0.38
  const K_CARD_CENTER = K_CARD_START + 0.18; // 0.56
  const K_CARD_EXIT = 0.66; // card OUT

  // Crossfade Kodex → Marty (après disparition totale de la card Kodex)
  const X2_START = K_CARD_EXIT; // 0.66
  const X2_END = X2_START + 0.06; // 0.72

  // MARTY (vidéo immobile, card seule qui monte puis se "lock" à 50vh)
  const M_CARD_START = X2_START + 0.02; // 0.68
  const M_CARD_CENTER = M_CARD_START + 0.18; // 0.86
  const M_CARD_LOCK = 0.94; // on atteint 50vh et on n'avance plus
  // pas de section Contact -> fin de la section ici

  // ==== VIDÉOS (IMMOBILES : aucune scale/translate) ====
  // Paper visible dès le début puis s'efface sur X1
  const pOpacity = useTransform(
    scrollYProgress,
    [0, X1_START, X1_END],
    [1, 1, 0]
  );

  // Kodex apparaît pendant X1, reste plein, puis s'efface sur X2
  const kOpacity = useTransform(
    scrollYProgress,
    [X1_START, X1_END, X2_START, X2_END],
    [0, 1, 1, 0]
  );

  // Marty apparaît pendant X2 et reste à 1 jusqu’à la fin (pas de fade final)
  const mOpacity = useTransform(
    scrollYProgress,
    [X2_START, X2_END, 1],
    [0, 1, 1]
  );

  // ==== CARDS (elles seules bougent) ====
  const pCardY = useTransform(
    scrollYProgress,
    [0, P_CARD_START, P_CARD_CENTER, P_CARD_EXIT],
    ["80vh", "80vh", "0vh", "-120%"]
  );
  const pCardOpacity = useTransform(
    scrollYProgress,
    [0, P_CARD_START, P_CARD_START + 0.04, P_CARD_EXIT - 0.02, P_CARD_EXIT],
    [0, 0, 1, 1, 0]
  );

  const kCardY = useTransform(
    scrollYProgress,
    [0, K_CARD_START, K_CARD_CENTER, K_CARD_EXIT],
    ["80vh", "80vh", "0vh", "-120%"]
  );
  const kCardOpacity = useTransform(
    scrollYProgress,
    [0, K_CARD_START, K_CARD_START + 0.04, K_CARD_EXIT - 0.02, K_CARD_EXIT],
    [0, 0, 1, 1, 0]
  );

  // Marty : on "lock" la montée à 50vh et on la maintient
  const mCardY = useTransform(
    scrollYProgress,
    [0, M_CARD_START, M_CARD_CENTER, M_CARD_LOCK, 1],
    ["80vh", "80vh", "0vh", "50vh", "50vh"]
  );
  const mCardOpacity = useTransform(
    scrollYProgress,
    [0, M_CARD_START + 0.02, M_CARD_LOCK],
    [0, 1, 1]
  );

  // Autoplay robuste
  const pRef = useRef<HTMLVideoElement>(null);
  const kRef = useRef<HTMLVideoElement>(null);
  const mRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const tryPlay = (el?: HTMLVideoElement | null) => {
      if (!el) return;
      const p = el.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    };
    tryPlay(pRef.current);
    tryPlay(kRef.current);
    tryPlay(mRef.current);
  }, []);

  // Nappe de lisibilité : on la garde pour la lecture des cards
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);

  const CARD_SHIFT_PX = -14;

  return (
    // Hauteur suffisante pour tout dérouler, et fin "pile" au lock Marty
    <section ref={ref} id="projects" className="relative h-[560svh] w-full">
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ background: "black" }}
      >
        {/* ===== VIDÉOS (ABSOLUTE DANS LE STICKY → visibles uniquement dans Projects) ===== */}
        <div className="absolute inset-0">
          {/* MARTY (fond) */}
          <motion.video
            ref={mRef}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            src="/marty-video.mp4"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
            style={{ opacity: mOpacity, willChange: "opacity" }}
          />
          {/* KODEX (milieu) */}
          <motion.video
            ref={kRef}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            src="/kodex-video.mp4"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
            style={{ opacity: kOpacity, willChange: "opacity" }}
          />
          {/* PAPER (devant au début) */}
          <motion.video
            ref={pRef}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            src="/paper-video.mp4"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
            style={{ opacity: pOpacity, willChange: "opacity" }}
          />
          {/* Nappe lisibilité */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_45%,transparent_70%)]"
            style={{ opacity: overlayOpacity }}
          />
        </div>

        {/* ===== CARDS ===== */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 md:px-8 lg:px-12">
          {/* Paper */}
          <motion.aside
            style={{ y: pCardY, opacity: pCardOpacity, x: CARD_SHIFT_PX }}
            className="absolute left-0 z-30 w-[min(90vw,420px)] rounded-2xl border border-white/15 bg-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)] ring-1 ring-black/25 p-5 md:p-6"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo-kpwg.webp"
                alt="Paper Wallet Generator"
                width={140}
                height={40}
                className="h-10 w-auto md:h-12"
              />
              <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]">
                Paper Wallet Generator <span aria-hidden>↗</span>
              </h3>
            </div>
            <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
              Générateur de paper wallet Kaspa : entropie utilisateur, seed
              12/24 mots, QR, mise en page imprimable.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Demo
              </a>
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Repo
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["React", "WASM", "QR", "Print"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[var(--ink)]/90"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.aside>

          {/* KODEX */}
          <motion.aside
            style={{ y: kCardY, opacity: kCardOpacity, x: CARD_SHIFT_PX }}
            className="absolute left-0 z-20 w-[min(90vw,420px)] rounded-2xl border border-white/15 bg-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)] ring-1 ring-black/25 p-5 md:p-6"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo-kodex.webp"
                alt="KODEX"
                width={140}
                height={40}
                className="h-10 w-auto md:h-12"
              />
              <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]">
                KODEX <span aria-hidden>↗</span>
              </h3>
            </div>
            <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
              Design System & starter pour sites/apps : composants UI, thèmes,
              animations et accessibilité.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Demo
              </a>
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Docs
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Tailwind", "Framer Motion"].map(
                (t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[var(--ink)]/90"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </motion.aside>

          {/* MARTY80 — card se "lock" à 50vh */}
          <motion.aside
            style={{ y: mCardY, opacity: mCardOpacity, x: CARD_SHIFT_PX }}
            className="absolute left-0 z-10 w-[min(90vw,420px)] rounded-2xl border border-white/15 bg-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)] ring-1 ring-black/25 p-5 md:p-6"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo-marty.webp"
                alt="MARTY80"
                width={140}
                height={40}
                className="h-10 w-auto md:h-12"
              />
              <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]">
                MARTY80 <span aria-hidden>↗</span>
              </h3>
            </div>
            <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
              Site interactif & outils autour du token KRC-20 MARTY80 sur Kaspa.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Website
              </a>
              <a
                className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                href="#"
              >
                <span aria-hidden>🔗</span> Explorer
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["React", "Kaspa", "KRC-20", "UI/FX"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[var(--ink)]/90"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

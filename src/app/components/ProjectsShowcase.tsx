"use client";

import Image from "next/image";
import { useRef, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

export default function ProjectsShowcase() {
  const ref = useRef<HTMLElement | null>(null);

  // === Réglages card & vidéo (grande card) ===
  const CARD_MAXW = 1500; // largeur max (px)
  const CARD_VW = 96; // largeur en % du viewport
  const CARD_VH = 84; // hauteur en vh
  const CARD_RIGHT_GUTTER = 40; // espace à droite (px)
  const VIDEO_CLASS =
    "absolute inset-0 w-full h-full object-contain object-center bg-black"; // ratio préservé, 0 troncature

  // === Réglages des petites cards (Paper/Kodex/Marty) ===
  const IC_SHIFT_X = 32; // + droite / - gauche (px)
  const IC_SHIFT_Y = -8; // + bas    / - haut  (px)
  const IC_MAXW = 360; // largeur max (px)
  const IC_VW = 86; // largeur relative (pour mobile)
  const IC_BG_CLASS = "bg-black/60 backdrop-blur-sm"; // fond lisible
  const IC_BORDER_CLASS = "border-white/20"; // bordure

  // Timeline strictement bornée à la vie du sticky (pin => release)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // ==== TIMELINE (0 → 1) ====
  const P_CARD_START = 0.1;
  const P_CARD_CENTER = 0.24;
  const P_CARD_EXIT = 0.36;

  const X1_START = P_CARD_EXIT; // 0.36
  const X1_END = X1_START + 0.06; // 0.42

  const K_CARD_START = X1_START + 0.02; // 0.38
  const K_CARD_CENTER = K_CARD_START + 0.18; // 0.56
  const K_CARD_EXIT = 0.66;

  const X2_START = K_CARD_EXIT; // 0.66
  const X2_END = X2_START + 0.06; // 0.72

  const M_CARD_START = X2_START + 0.02; // 0.68
  const M_CARD_CENTER = M_CARD_START + 0.18; // 0.86
  const M_CARD_LOCK = 0.94;

  // ==== VIDÉOS (opacités animées) ====
  const pOpacity = useTransform(
    scrollYProgress,
    [0, X1_START, X1_END],
    [1, 1, 0]
  );
  const kOpacity = useTransform(
    scrollYProgress,
    [X1_START, X1_END, X2_START, X2_END],
    [0, 1, 1, 0]
  );
  const mOpacity = useTransform(
    scrollYProgress,
    [X2_START, X2_END, 1],
    [0, 1, 1]
  );

  // ==== CARDS (positions/opacités) ====
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

  // ==== CONTROLE DE LECTURE (play/pause selon la timeline) ====
  const pRef = useRef<HTMLVideoElement>(null);
  const kRef = useRef<HTMLVideoElement>(null);
  const mRef = useRef<HTMLVideoElement>(null);

  // Petite hystérésis pour éviter le flapping à la frontière
  const HYST = 0.01;
  type Key = "p" | "k" | "m" | null;
  const activeKeyRef = useRef<Key>(null);

  const pause = useCallback((el?: HTMLVideoElement | null) => {
    if (!el) return;
    try {
      el.pause();
    } catch {}
  }, []);

  const play = useCallback((el?: HTMLVideoElement | null) => {
    if (!el) return;
    const p = el.play();
    // Évite l'unhandled rejection sur iOS/Safari
    // (mute + playsInline doivent suffire pour autoriser l'autoplay programmatique)
    if (p && typeof (p as any).catch === "function")
      (p as Promise<void>).catch(() => {});
  }, []);

  const setActive = useCallback(
    (key: Key) => {
      if (activeKeyRef.current === key) return;
      activeKeyRef.current = key;
      switch (key) {
        case "p":
          play(pRef.current);
          pause(kRef.current);
          pause(mRef.current);
          break;
        case "k":
          pause(pRef.current);
          play(kRef.current);
          pause(mRef.current);
          break;
        case "m":
          pause(pRef.current);
          pause(kRef.current);
          play(mRef.current);
          break;
        default:
          pause(pRef.current);
          pause(kRef.current);
          pause(mRef.current);
      }
    },
    [pause, play]
  );

  const resolveActiveFrom = useCallback(
    (v: number): Key => {
      if (v < X1_END - HYST) return "p"; // Paper visible
      if (v >= X1_START - HYST && v < X2_END + HYST) return "k"; // Kodex visible
      if (v >= X2_START - HYST) return "m"; // Marty visible
      return null;
    },
    [HYST]
  );

  // 1) Init à l'arrivée sur la section
  useEffect(() => {
    setActive(resolveActiveFrom(scrollYProgress.get()));
    // Pause sécurité au démontage
    return () => {
      try {
        pRef.current?.pause();
      } catch {}
      try {
        kRef.current?.pause();
      } catch {}
      try {
        mRef.current?.pause();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Suivi du scroll : bascule play/pause quand on change de vidéo active
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(resolveActiveFrom(v));
  });

  // Nappe de lisibilité
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);

  // (ancien léger décalage des cards internes — on laisse à 0 maintenant)
  const CARD_SHIFT_PX = 0;

  return (
    <section ref={ref} id="projects" className="relative h-[560svh] w-full">
      <div className="sticky top-0 h-[100svh] w-full">
        {/* Conteneur flex pour centrer verticalement et pousser à droite */}
        <div
          className="h-full flex items-center"
          style={{ paddingRight: CARD_RIGHT_GUTTER }}
        >
          {/* === Grande card responsive (ratio conservé, 0 troncature) === */}
          <div
            className="
              relative overflow-hidden
              rounded-2xl border border-white/10
              bg-white/[0.04] backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.25)]
            "
            style={{
              width: `min(${CARD_VW}vw, ${CARD_MAXW}px)`,
              height: `${CARD_VH}vh`,
              marginLeft: "auto",
            }}
          >
            {/* ===== VIDÉOS : plein cadre, object-contain ===== */}
            <div className="absolute inset-0">
              {/* IMPORTANT: pas d'autoplay ici, on gère via JS + scroll */}
              <motion.video
                ref={mRef}
                className={VIDEO_CLASS}
                src="/marty-video.mp4"
                muted
                playsInline
                loop
                preload="metadata"
                style={{ opacity: mOpacity, willChange: "opacity" }}
                disablePictureInPicture
                controls={false}
              />
              <motion.video
                ref={kRef}
                className={VIDEO_CLASS}
                src="/kodex-video.mp4"
                muted
                playsInline
                loop
                preload="metadata"
                style={{ opacity: kOpacity, willChange: "opacity" }}
                disablePictureInPicture
                controls={false}
              />
              <motion.video
                ref={pRef}
                className={VIDEO_CLASS}
                src="/paper-video.mp4"
                muted
                playsInline
                loop
                preload="metadata"
                style={{ opacity: pOpacity, willChange: "opacity" }}
                disablePictureInPicture
                controls={false}
              />
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_45%,transparent_70%)]"
                style={{ opacity: overlayOpacity }}
              />
            </div>

            {/* ===== CONTENU (cards) ===== */}
            <div className="relative z-10 flex h-full w-full items-center px-5 md:px-8 lg:px-12">
              {/* PAPER */}
              <div
                className="absolute left-0 top-0 z-30"
                style={{
                  transform: `translate(${IC_SHIFT_X}px, ${IC_SHIFT_Y}px)`,
                }}
              >
                <motion.aside
                  style={{
                    y: pCardY,
                    opacity: pCardOpacity,
                    width: `min(${IC_VW}vw, ${IC_MAXW}px)`,
                  }}
                  className={`rounded-2xl border ${IC_BORDER_CLASS} ${IC_BG_CLASS}
                    shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)]
                    ring-1 ring-black/25 p-5 md:p-6`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo-kpwg.webp"
                      alt="Paper Wallet Generator"
                      width={140}
                      height={40}
                      className="h-10 w-auto md:h-12"
                    />
                    <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]"></h3>
                  </div>
                  <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
                    Générateur de paper wallet Kaspa : entropie utilisateur,
                    seed 12/24 mots, QR, mise en page imprimable.
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
              </div>

              {/* KODEX */}
              <div
                className="absolute left-0 top-0 z-20"
                style={{
                  transform: `translate(${IC_SHIFT_X}px, ${IC_SHIFT_Y}px)`,
                }}
              >
                <motion.aside
                  style={{
                    y: kCardY,
                    opacity: kCardOpacity,
                    width: `min(${IC_VW}vw, ${IC_MAXW}px)`,
                  }}
                  className={`rounded-2xl border ${IC_BORDER_CLASS} ${IC_BG_CLASS}
                    shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)]
                    ring-1 ring-black/25 p-5 md:p-6`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo-kodex.webp"
                      alt="KODEX"
                      width={140}
                      height={40}
                      className="h-10 w-auto md:h-12"
                    />
                    <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]"></h3>
                  </div>
                  <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
                    Design System & starter pour sites/apps : composants UI,
                    thèmes, animations et accessibilité.
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
              </div>

              {/* MARTY80 */}
              <div
                className="absolute left-0 top-0 z-10"
                style={{
                  transform: `translate(${IC_SHIFT_X}px, ${IC_SHIFT_Y}px)`,
                }}
              >
                <motion.aside
                  style={{
                    y: mCardY,
                    opacity: mCardOpacity,
                    width: `min(${IC_VW}vw, ${IC_MAXW}px)`,
                  }}
                  className={`rounded-2xl border ${IC_BORDER_CLASS} ${IC_BG_CLASS}
                    shadow-[0_18px_60px_rgba(0,0,0,0.65),0_4px_14px_rgba(0,0,0,0.55)]
                    ring-1 ring-black/25 p-5 md:p-6`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo-marty.webp"
                      alt="MARTY80"
                      width={140}
                      height={40}
                      className="h-10 w-auto md:h-12"
                    />
                    <h3 className="text-base md:text-lg font-semibold text-[var(--ink)]"></h3>
                  </div>
                  <p className="mt-3 text-sm md:text-base text-[var(--muted)]">
                    Site interactif & outils autour du token KRC-20 MARTY80 sur
                    Kaspa.
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
          </div>
        </div>
      </div>
    </section>
  );
}

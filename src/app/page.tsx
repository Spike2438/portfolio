"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Skills from "./components/Skills";
import ProjectsShowcase from "./components/ProjectsShowcase";
import InfoCard from "./components/InfoCard";

type ThemeMode = "dark" | "light";

const THEMES: Record<ThemeMode, Record<string, string>> = {
  dark: {
    "--bg": "#071633",
    "--ink": "#e6edf7",
    "--muted": "#a5b4c3",
    "--glow": "rgba(90, 190, 255, 0.10)",
    "--glow-blend": "screen",
  },
  light: {
    "--bg": "#f6f8ff",
    "--ink": "#0b1220",
    "--muted": "#445065",
    "--glow": "rgba(7, 22, 51, 0.38)",
    "--glow-blend": "multiply",
  },
};

const PHOTO_DELAY_MS = 1000;
const PAGE_FADE_MS = 1600;
const PROX_RADIUS = 140;
const GLITCH_INTERVAL_MS = 2000;
const GLITCH_DURATION_MS = 900;

// Scroll / placement
const COMPACT_SCALE = 0.5; // scale du titre compacté
const SCROLL_DIST = 160; // distance pour atteindre l'état compact
const GAP_ABOVE_CARD = 20; // espace au-dessus de l'InfoCard pour le titre

// Offsets fins (ajustables)
const INFOCARD_LIFT = 16; // ↑ remonte la carte (crée de l'espace sous la carte)
const MENU_LIFT = 20; // ↑ remonte le menu (crée de l'espace sous le menu)
const TITLE_DX = 50; // → décale le titre ( + droite / - gauche )
const TITLE_DY = -30; // ↑ remonte le titre ( - vers le haut / + vers le bas )

export default function Page() {
  const [ready, setReady] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // glitch
  const [glitchOn, setGlitchOn] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const nearRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // menu & sections
  const [showSideNav, setShowSideNav] = useState(false);
  const [active, setActive] = useState<"about" | "skills" | "projects">(
    "about"
  );
  const sections = ["about", "skills", "projects"] as const;
  const navRef = useRef<HTMLElement | null>(null);

  // ref InfoCard pour centrer le titre au-dessus
  const infoRef = useRef<HTMLDivElement | null>(null);

  // Titre overlay
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [measured, setMeasured] = useState(false);
  const [orig, setOrig] = useState({ left: 0, top: 0, height: 0, width: 0 });
  const [target, setTarget] = useState({ left: 0, top: 0 });
  const [t, setT] = useState(0);

  // Fade-ins
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    const timer = setTimeout(() => setShowPhoto(true), PHOTO_DELAY_MS);
    const menuTimer = setTimeout(() => setShowSideNav(true), 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(menuTimer);
    };
  }, []);

  // Thème
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () =>
    setTheme((tt) => (tt === "dark" ? "light" : "dark"));

  // Glitch à proximité du toggle
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = toggleRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const near = Math.hypot(e.clientX - cx, e.clientY - cy) <= PROX_RADIUS;

      if (near !== nearRef.current) {
        nearRef.current = near;
        if (near) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = window.setInterval(() => {
            const btn = toggleRef.current;
            if (btn) {
              btn.classList.add("toggle-glitch");
              setTimeout(
                () => btn.classList.remove("toggle-glitch"),
                GLITCH_DURATION_MS
              );
            }
            setGlitchOn(true);
            setTimeout(() => setGlitchOn(false), GLITCH_DURATION_MS);
          }, GLITCH_INTERVAL_MS) as unknown as number;
        } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ===== Section active — méthode "centre de l'écran" (ultra stable) =====
  useEffect(() => {
    const ids = ["about", "skills", "projects"] as const;

    const updateActiveByCenter = () => {
      const mid = window.innerHeight / 2;
      let bestId: (typeof ids)[number] = ids[0];
      let bestDist = Infinity;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }
      setActive(bestId);
    };

    updateActiveByCenter();
    window.addEventListener("scroll", updateActiveByCenter, { passive: true });
    window.addEventListener("resize", updateActiveByCenter);
    return () => {
      window.removeEventListener("scroll", updateActiveByCenter);
      window.removeEventListener("resize", updateActiveByCenter);
    };
  }, []);

  // Mesures : origine (titre) → cible (au-dessus de la carte, centré)
  const measure = () => {
    const tr = titleRef.current?.getBoundingClientRect();
    const ir = infoRef.current?.getBoundingClientRect();
    if (!tr || !ir) return;

    const h = tr.height;
    const w = tr.width;

    const targetLeft = ir.left + (ir.width - w * COMPACT_SCALE) / 2 + TITLE_DX;
    const targetTop = ir.top - h * COMPACT_SCALE - GAP_ABOVE_CARD + TITLE_DY;

    setOrig({ left: tr.left, top: tr.top, height: h, width: w });
    setTarget({ left: targetLeft, top: targetTop });
    setMeasured(true);
  };

  useEffect(() => {
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [showSideNav]);

  // Progression scroll
  useEffect(() => {
    const onScroll = () => setT(Math.min(1, window.scrollY / SCROLL_DIST));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lerp
  const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
  const curLeft = lerp(orig.left, target.left, t);
  const curTop = lerp(orig.top, target.top, t);
  const curScale = lerp(1, COMPACT_SCALE, t);

  const label = theme === "dark" ? "☀️ Light" : "🌙 Dark";

  return (
    <main
      className="min-h-dvh transition-opacity ease-out"
      style={{
        transitionDuration: `${PAGE_FADE_MS}ms`,
        opacity: ready ? 1 : 0,
      }}
    >
      {/* overlay glitch */}
      <div
        aria-hidden
        className={`fixed inset-0 pointer-events-none z-40 page-glitch ${
          glitchOn ? "is-on" : ""
        }`}
      />

      {/* Toggle */}
      <button
        ref={toggleRef}
        onClick={toggleTheme}
        aria-label={label}
        title={
          theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
        }
        className="fixed top-4 right-4 z-50 rounded-full px-3 py-2 text-sm transition-colors backdrop-blur border border-white/10 bg-white/10 hover:bg-white/15 text-[var(--ink)] theme-toggle"
      >
        {label}
      </button>

      {/* ====== ASIDE FIXE (bas gauche) : InfoCard au-dessus du menu ====== */}
      <div
        className={`fixed left-4 md:left-8 top-24 bottom-6 z-30
                    w-[min(92vw,320px)]
                    flex flex-col justify-end gap-4
                    transition-all duration-700 ease-out
                    ${
                      showSideNav
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-6"
                    }`}
        aria-hidden={!showSideNav}
      >
        {/* InfoCard avec ref & lift */}
        <div ref={infoRef} style={{ marginBottom: INFOCARD_LIFT }}>
          <InfoCard />
        </div>

        {/* Menu (lift) */}
        <nav
          ref={navRef}
          aria-label="Sections"
          style={{ marginBottom: MENU_LIFT }}
        >
          <ul className="flex flex-col gap-4 select-none">
            {sections.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`group flex items-center gap-3 uppercase tracking-[0.18em] font-semibold text-xs md:text-sm ${
                    active === id ? "text-[var(--ink)]" : "text-[var(--muted)]"
                  } transition-colors`}
                >
                  <span
                    className={`h-[2px] w-10 rounded bg-white/30 origin-left transition-all ${
                      active === id ? "w-14 bg-white/80" : "w-10"
                    }`}
                  />
                  <span>
                    {id === "about"
                      ? "ABOUT"
                      : id === "skills"
                      ? "SKILLS"
                      : "PROJECTS"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ABOUT / HERO */}
      <section
        id="about"
        className="px-5 md:px-8 lg:px-12 pt-20 md:pt-28 pb-10 md:pb-12 max-w-6xl mx-auto mt-8 md:mt-12"
      >
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-10">
          <div className="flex-1">
            {/* Titre source (invisible après mesure) */}
            <h1
              ref={titleRef}
              className={`text-4xl md:text-6xl font-semibold leading-tight ${
                measured ? "invisible" : ""
              }`}
            >
              Anthony <span className="text-sky-300">Edon</span>
            </h1>

            <p
              style={{ opacity: 1 - t, transition: "opacity 200ms linear" }}
              className="mt-4 text-base md:text-lg text-[var(--muted)] max-w-2xl"
            >
              I’m a developer passionate about crafting accessible,
              pixel-perfect user interfaces that blend thoughtful design with
              robust engineering…
            </p>
          </div>

          {/* PHOTO */}
          <div className="w-full md:w-auto md:flex-shrink-0">
            <Image
              src="/moi.webp"
              alt="Photo de Anthony Edon"
              width={320}
              height={320}
              style={{
                opacity: (showPhoto ? 1 : 0) * (1 - t),
                transition: "opacity 200ms linear",
              }}
              className={`mx-auto rounded-full ${
                showPhoto ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </section>

      {/* Titre overlay — centré au-dessus de l’InfoCard */}
      {measured && (
        <div
          aria-hidden
          className="fixed left-0 top-0 z-40 pointer-events-none"
          style={{
            transform: `translate(${curLeft}px, ${curTop}px) scale(${curScale})`,
            transformOrigin: "left top",
          }}
        >
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-center">
            Anthony <span className="text-sky-300">Edon</span>
          </h1>
        </div>
      )}

      {/* SKILLS */}
      <section
        id="skills"
        className="px-5 md:px-8 lg:px-12 pt-16 md:pt-24 pb-6 max-w-6xl mx-auto scroll-mt-28 md:scroll-mt-40 min-h-[40vh]"
      >
        <h2 className="sr-only">Skills</h2>
        <Skills />
      </section>

      {/* PROJECTS */}
      <section
        id="projects"
        className="px-5 md:px-8 lg:px-12 pt-16 md:pt-24 pb-6 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-semibold">Projets</h2>
      </section>
      <ProjectsShowcase />

      {/* Styles glitch */}
      <style jsx>{`
        .theme-toggle {
          overflow: visible;
        }
        .theme-toggle.toggle-glitch::after {
          --move1: inset(50% 50% 50% 50%);
          --move2: inset(31% 0 40% 0);
          --move3: inset(39% 0 15% 0);
          --move4: inset(45% 0 40% 0);
          --move5: inset(45% 0 6% 0);
          --move6: inset(14% 0 61% 0);
          content: attr(aria-label);
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          clip-path: var(--move1);
          animation: glitch_btn ${GLITCH_DURATION_MS}ms steps(2, end);
          pointer-events: none;
        }
        @keyframes glitch_btn {
          0% {
            clip-path: var(--move1);
            transform: translate(0, -10px);
          }
          10% {
            clip-path: var(--move2);
            transform: translate(-10px, 10px);
          }
          20% {
            clip-path: var(--move3);
            transform: translate(10px, 0);
          }
          30% {
            clip-path: var(--move4);
            transform: translate(-10px, 10px);
          }
          40% {
            clip-path: var(--move5);
            transform: translate(10px, -10px);
          }
          50% {
            clip-path: var(--move6);
            transform: translate(-10px, 10px);
          }
          60% {
            clip-path: var(--move1);
            transform: translate(10px, -10px);
          }
          70% {
            clip-path: var(--move3);
            transform: translate(-10px, 10px);
          }
          80% {
            clip-path: var(--move2);
            transform: translate(10px, -10px);
          }
          90% {
            clip-path: var(--move4);
            transform: translate(-10px, 10px);
          }
          100% {
            clip-path: var(--move1);
            transform: translate(0, 0);
          }
        }

        .page-glitch {
          opacity: 0;
        }
        .page-glitch.is-on {
          opacity: 1;
        }
        .page-glitch.is-on::before,
        .page-glitch.is-on::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          backdrop-filter: invert(1) saturate(1.08);
          -webkit-backdrop-filter: invert(1) saturate(1.08);
          animation-duration: ${GLITCH_DURATION_MS}ms;
          animation-timing-function: steps(2, end);
        }
        .page-glitch.is-on::before {
          --move1: inset(50% 50% 50% 50%);
          --move2: inset(31% 0 40% 0);
          --move3: inset(39% 0 15% 0);
          --move4: inset(45% 0 40% 0);
          --move5: inset(45% 0 6% 0);
          --move6: inset(14% 0 61% 0);
          clip-path: var(--move1);
          animation-name: glitch_full_a;
        }
        .page-glitch.is-on::after {
          --move1: inset(50% 50% 50% 50%);
          --move2: inset(40% 0 20% 0);
          --move3: inset(10% 0 60% 0);
          --move4: inset(55% 0 25% 0);
          --move5: inset(20% 0 55% 0);
          --move6: inset(5% 0 70% 0);
          clip-path: var(--move1);
          animation-name: glitch_full_b;
        }
        @keyframes glitch_full_a {
          0% {
            clip-path: var(--move1);
            transform: translate(0, -10px);
          }
          20% {
            clip-path: var(--move2);
            transform: translate(-10px, 10px);
          }
          40% {
            clip-path: var(--move3);
            transform: translate(10px, 0);
          }
          60% {
            clip-path: var(--move4);
            transform: translate(-10px, 10px);
          }
          80% {
            clip-path: var(--move5);
            transform: translate(10px, -10px);
          }
          100% {
            clip-path: var(--move1);
            transform: translate(0, 0);
          }
        }
        @keyframes glitch_full_b {
          0% {
            clip-path: var(--move1);
            transform: translate(0, 8px);
          }
          20% {
            clip-path: var(--move2);
            transform: translate(8px, -8px);
          }
          40% {
            clip-path: var(--move3);
            transform: translate(-8px, 0);
          }
          60% {
            clip-path: var(--move4);
            transform: translate(8px, -8px);
          }
          80% {
            clip-path: var(--move5);
            transform: translate(-8px, 8px);
          }
          100% {
            clip-path: var(--move1);
            transform: translate(0, 0);
          }
        }
      `}</style>
    </main>
  );
}

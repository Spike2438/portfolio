"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Skills from "./components/Skills";
import ProjectsShowcase from "./components/ProjectsShowcase";
import InfoCard from "./components/InfoCard";
import ThemeSwitch from "./components/ThemeSwitch";

type ThemeMode = "dark" | "light";
type SkillItem = { name: string; image: string; desc?: string };

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

// Scroll / placement
const COMPACT_SCALE = 0.5;
const SCROLL_DIST = 160;
const GAP_ABOVE_CARD = 20;

// Offsets fins
const INFOCARD_LIFT = 16;
const MENU_LIFT = 20;
const TITLE_DX = 50;
const TITLE_DY = -30;

export default function Page() {
  const [ready, setReady] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // viewport
  const [isMdUp, setIsMdUp] = useState(true);

  // menu & sections
  const [showSideNav, setShowSideNav] = useState(false);
  const [active, setActive] = useState<"about" | "skills" | "projects">(
    "about"
  );
  const sections = ["about", "skills", "projects"] as const;
  const navRef = useRef<HTMLElement | null>(null);

  // InfoCard refs (pour positionner le titre overlay en desktop)
  const infoRef = useRef<HTMLDivElement | null>(null);

  // Titre overlay (desktop only)
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [measured, setMeasured] = useState(false);
  const [orig, setOrig] = useState({ left: 0, top: 0, height: 0, width: 0 });
  const [target, setTarget] = useState({ left: 0, top: 0 });
  const [t, setT] = useState(0);

  // Données pour la liste simple de Skills (mobile)
  const [simpleSkills, setSimpleSkills] = useState<SkillItem[]>([]);

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

  // Breakpoint watcher (desktop/mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = (m: MediaQueryList | MediaQueryListEvent) =>
      setIsMdUp("matches" in m ? m.matches : (m as MediaQueryList).matches);
    apply(mq);
    const onChange = (e: MediaQueryListEvent) => apply(e);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as unknown as () => void);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as unknown as () => void);
    };
  }, []);

  // Section active — méthode "centre de l'écran"
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

  // Récupération des données de Skills (nom + image + desc) pour la liste mobile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod: any = await import("./components/Skills");
        const candidates = [
          mod.SKILLS,
          mod.skills,
          mod.DATA,
          mod.items,
          mod.default?.SKILLS,
          mod.default?.skills,
        ].filter(Array.isArray);

        if (!cancelled && candidates.length > 0) {
          const raw = candidates[0] as any[];
          const norm: SkillItem[] = raw
            .map((it) => {
              if (it && typeof it === "object") {
                const name = it.name || it.title || it.label;
                let image =
                  it.image || it.img || it.icon || it.src || it.logo || "";
                const desc = it.desc || it.description || it.details || "";
                if (!name) return null;
                if (
                  image &&
                  !/^https?:\/\//.test(image) &&
                  !image.startsWith("/")
                ) {
                  image = `/${image}`;
                }
                return { name, image, desc } as SkillItem;
              }
              if (typeof it === "string") {
                const base = it.replace(/\.(webp|png|jpe?g|svg)$/i, "");
                const image = `/${base}.webp`;
                return { name: it, image };
              }
              return null;
            })
            .filter(Boolean) as SkillItem[];

          if (norm.length > 0) setSimpleSkills(norm);
        }
      } catch {
        // on laisse simpleSkills vide si rien n'est exporté
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mesures : origine (titre) → cible (au-dessus de l’InfoCard) — desktop only
  const measure = () => {
    if (!isMdUp) return;
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
    if (!isMdUp) {
      setMeasured(false);
      return;
    }
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [showSideNav, isMdUp]);

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

  const switchTitle =
    theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <main
      className="min-h-dvh transition-opacity ease-out"
      style={{
        transitionDuration: `${PAGE_FADE_MS}ms`,
        opacity: ready ? 1 : 0,
      }}
    >
      {/* Toggle (ThemeSwitch) */}
      <ThemeSwitch
        className="fixed top-4 right-4 z-50"
        size={32} // ← ajuste ici (ex: 28, 32, 36, 40…)
        checked={theme === "dark"}
        onChange={(isLight) => setTheme(isLight ? "dark" : "light")}
        title={switchTitle}
      />

      {/* ====== ASIDE FIXE (Desktop) : InfoCard au-dessus du menu ====== */}
      <div
        className={`hidden md:flex fixed left-4 md:left-8 top-24 bottom-6 z-30
                    w-[min(92vw,320px)]
                    flex-col justify-end gap-4
                    transition-all duration-700 ease-out
                    ${
                      showSideNav
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-6"
                    }`}
        aria-hidden={!showSideNav}
      >
        {/* InfoCard */}
        <div ref={infoRef} style={{ marginBottom: INFOCARD_LIFT }}>
          <InfoCard />
        </div>

        {/* Menu */}
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

      {/* ====== ABOUT / HERO ====== */}
      <section
        id="about"
        className="px-5 md:px-8 lg:px-12 pt-20 md:pt-28 pb-10 md:pb-12 max-w-6xl mx-auto mt-6 md:mt-12"
      >
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-8 md:gap-10">
          <div className="flex-1">
            {/* Titre source (invisible après mesure desktop) */}
            <h1
              ref={titleRef}
              className={`text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight ${
                isMdUp && measured ? "invisible" : ""
              }`}
            >
              Anthony <span className="text-sky-300">Edon</span>
            </h1>

            <p
              style={{ opacity: 1 - t, transition: "opacity 200ms linear" }}
              className="mt-3 sm:mt-4 text-[15px] sm:text-base md:text-lg text-[var(--muted)] max-w-2xl"
            >
              I’m a developer passionate about crafting accessible,
              pixel-perfect user interfaces that blend thoughtful design with
              robust engineering…
            </p>

            {/* InfoCard en petit écran : sous le nom */}
            {!isMdUp && (
              <div className="mt-6">
                <InfoCard />
              </div>
            )}
          </div>

          {/* PHOTO */}
          <div className="w-full md:w-auto md:flex-shrink-0">
            <Image
              src="/moi.webp"
              alt="Photo de Anthony Edon"
              width={isMdUp ? 320 : 220}
              height={isMdUp ? 320 : 220}
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

      {/* Titre overlay — centré au-dessus de l’InfoCard (desktop only) */}
      {isMdUp && measured && (
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

      {/* ====== SKILLS ====== */}
      <section
        id="skills"
        className="px-5 md:px-8 lg:px-12 pt-12 md:pt-24 pb-6 max-w-6xl mx-auto scroll-mt-24 md:scroll-mt-40 min-h-[40vh]"
      >
        <h2 className="sr-only">Skills</h2>

        {isMdUp ? (
          // Desktop : composant complet intact
          <Skills />
        ) : (
          // Mobile : liste simple avec images (img natif pour compat)
          <ul className="rounded-xl border border-white/10 bg-white/5 backdrop-blur divide-y divide-white/10">
            {simpleSkills.map((s, i) => (
              <li key={`${s.name}-${i}`} className="p-3">
                <div className="flex items-start gap-3">
                  <img
                    src={s.image || ""}
                    alt={s.name}
                    width={32}
                    height={32}
                    loading="lazy"
                    className="w-8 h-8 rounded-md object-contain bg-white/10 flex-shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility =
                        "hidden";
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-[var(--ink)] font-medium">
                      {s.name}
                    </div>
                    {s.desc ? (
                      <div className="text-[13px] text-[var(--muted)] mt-1 whitespace-pre-line">
                        {s.desc}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ====== PROJECTS ====== */}
      <section
        id="projects"
        className="px-5 md:px-8 lg:px-12 pt-12 md:pt-24 pb-24 md:pb-6 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-semibold">Projets</h2>
      </section>

      {/* ⬇️ Centre uniquement sur très grand écran, sinon inchangé */}
      <CenterUltraWide max={1600} minWidth={2200}>
        <ProjectsShowcase />
      </CenterUltraWide>
    </main>
  );
}

/** Centre les enfants uniquement au-delà d’un certain seuil de largeur (ultrawide). */
function CenterUltraWide({
  children,
  max = 1600, // largeur max du bloc centré
  minWidth = 2200, // seuil "ultrawide"
}: {
  children: ReactNode;
  max?: number;
  minWidth?: number;
}) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const update = () => setWide(window.innerWidth >= minWidth);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [minWidth]);

  if (!wide) {
    // En-dessous du seuil: on ne touche à rien
    return <>{children}</>;
  }

  // Au-delà du seuil: on centre sans altérer le layout interne
  return (
    <div style={{ width: "100%" }}>
      <div style={{ maxWidth: `${max}px`, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

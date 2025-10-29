"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ThemeMode = "dark" | "light";

const THEMES: Record<ThemeMode, Record<string, string>> = {
  dark: {
    "--bg": "#071633",
    "--ink": "#e6edf7",
    "--muted": "#a5b4c3",
    "--glow": "rgba(90, 190, 255, 0.10)",
    "--glow-blend": "screen", // parfait sur fond sombre
  },
  light: {
    "--bg": "#f6f8ff",
    "--ink": "#0b1220",
    "--muted": "#445065",
    // halo BLEU NUIT plus prononcé sur clair
    "--glow": "rgba(7, 22, 51, 0.38)", // bleu nuit + fort
    "--glow-blend": "multiply", // fonce élégamment sur fond clair
  },
};

export default function Page() {
  const [ready, setReady] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // Fade-ins
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true)); // fondu global
    const timer = setTimeout(() => setShowPhoto(true), 1000); // photo 1s après
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  // Charger thème depuis localStorage (si dispo)
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  // Appliquer le thème via variables CSS
  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <main
      className={`min-h-dvh transition-opacity duration-[1600ms] ease-out ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Toggle sombre/clair */}
      <button
        onClick={toggleTheme}
        title={
          theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
        }
        className="fixed top-4 right-4 z-50 rounded-full px-3 py-2 text-sm transition-colors backdrop-blur
                   border border-white/10 bg-white/10 hover:bg-white/15
                   text-[color:var(--ink)]"
        aria-label="Basculer le thème"
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* HERO */}
      <section className="px-5 md:px-8 lg:px-12 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              Anthony <span className="text-sky-300">Edon</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[color:var(--muted)] max-w-2xl">
              I’m a developer passionate about crafting accessible,
              pixel-perfect user interfaces that blend thoughtful design with
              robust engineering. My favorite work lies at the intersection of
              design and development, creating experiences that not only look
              great but are meticulously built for performance and usability.
              Currently, I'm a Senior Front-End Engineer at Klaviyo,
              specializing in accessibility. I contribute to the creation and
              maintenance of UI components that power Klaviyo’s frontend,
              ensuring our platform meets web accessibility standards and best
              practices to deliver an inclusive user experience. In the past,
              I've had the opportunity to develop software across a variety of
              settings — from advertising agencies and large corporations to
              start-ups and small digital product studios. Additionally, I also
              released a comprehensive video course a few years ago, guiding
              learners through building a web app with the Spotify API. In my
              spare time, I’m usually climbing, playing tennis, hanging out with
              my wife and two cats, or running around Hyrule searching for Korok
              seeds K o r o k s e e d s .
            </p>
            <a
              href="#skills"
              className="mt-8 inline-block rounded-xl bg-white/10 hover:bg-white/15 text-sm md:text-base px-5 py-3 border border-white/10"
            >
              Voir mes skills
            </a>
          </div>

          {/* PHOTO — fade-in 1s après, ronde et sans cadre */}
          <div className="w-full md:w-auto md:flex-shrink-0">
            <Image
              src="/moi.webp"
              alt="Photo de Anthony Edon"
              width={320}
              height={320}
              className={`mx-auto rounded-full transition-opacity duration-700 ease-out ${
                showPhoto ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section
        id="skills"
        className="px-5 md:px-8 lg:px-12 py-16 md:py-24 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">Skills</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "React",
            "Next.js",
            "React Native",
            "Expo",
            "Node.js",
            "Express",
          ].map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm md:text-base"
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS (placeholder) */}
      <section
        id="projects"
        className="px-5 md:px-8 lg:px-12 py-16 md:py-24 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">Projets</h2>
        <p className="text-[color:var(--muted)]">
          À compléter avec tes projets.
        </p>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="px-5 md:px-8 lg:px-12 py-16 md:py-24 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Contact</h2>
        <a
          href="mailto:ton@email"
          className="rounded-xl bg-white/10 hover:bg-white/15 text-sm md:text-base px-5 py-3 border border-white/10 inline-block"
        >
          Me contacter
        </a>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-8 lg:px-12 py-10 border-t border-white/10 text-sm text-[color:var(--muted)]">
        <div className="max-w-6xl mx-auto">
          &copy; {new Date().getFullYear()} Antho
        </div>
      </footer>
    </main>
  );
}

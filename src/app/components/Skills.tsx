"use client";

import React from "react";
import OrbitToken from "./OrbitToken";

type SkillsProps = {
  id?: string;
  /** Laisse undefined pour ne pas afficher de titre */
  title?: string;
};

/** ====== IMAGES (noms exacts dans /public, casse incluse) ====== */
const TOKEN_IMAGES = [
  "/Css3.webp",
  "/Docker.webp",
  "/Dokploy.webp",
  "/Expo.webp",
  "/ExpressJS.webp",
  "/Github.webp",
  "/Html5.webp",
  "/JS.webp",
  "/Kaspa.webp",
  "/Kasware.webp",
  "/MongoDB.webp",
  "/NextJS.webp",
  "/NodeJS.webp",
  "/Portainer.webp",
  "/Qnap.webp",
  "/React.webp",
  "/ReactNative.webp",
  "/Synology.webp",
  "/Vercel.webp",
  "/VmwareWorkstation.webp",
  "/Render.webp",
] as const;

/** ====== Affichages “propres” pour certains noms ====== */
const DISPLAY_NAMES: Record<string, string> = {
  Css3: "CSS3",
  Html5: "HTML5",
  JS: "JavaScript",
  NextJS: "Next.js",
  NodeJS: "Node.js",
  ReactNative: "React Native",
  VmwareWorkstation: "VMware Workstation",
  ExpressJS: "Express.js",
  Github: "GitHub",
  Qnap: "QNAP",
};

/** ====== Descriptions courtes (2 lignes max) ====== */
const DESCRIPTIONS: Record<string, string> = {
  css3: "Styles modernes, Grid/Flex.\nAnimations fluides.",
  docker: "Images & Compose.\nEnvironnements reproductibles.",
  dokploy: "PaaS self-hosted.\nCI/CD simplifiée.",
  expo: "Tooling React Native.\nBuild & OTA updates.",
  expressjs: "APIs REST.\nMiddleware & routing.",
  github: "Git flow, PR/Issues.\nActions pour CI.",
  html5: "Sémantique & a11y.\nMedia, Canvas.",
  javascript: "ES6+, async/await.\nPatterns front/back.",
  kaspa: "KRC-20 & tooling.\nIntégrations front.",
  kasware: "Wallet connect.\nBalances & actions.",
  mongodb: "Modèle documents.\nIndex & aggregations.",
  nextjs: "App Router, ISR/SSG.\nAPI routes.",
  nodejs: "Services & workers.\nStreams, CLI.",
  portainer: "Gestion Docker.\nStacks & registries.",
  qnap: "NAS & services.\nSauvegardes/containers.",
  react: "Hooks & context.\nPerf & state mgmt.",
  "react native": "Navigation & OTA.\nModules natifs.",
  synology: "DSM, reverse proxy.\nSauvegardes.",
  vercel: "Edge/ISR.\nPreviews & env.",
  vmwareworkstation: "VM dev/test.\nRéseaux virtuels.",
  render: "PaaS déploiements.\nJobs & services.",
};

/** ====== Types & util ====== */
export type SkillItem = { name: string; image: string; desc?: string };

function prettyNameFromPath(src: string): string {
  const base = src.replace(/^\//, "").replace(/\.webp$/i, "");
  // Nom affiché prioritaire depuis DISPLAY_NAMES
  if (DISPLAY_NAMES[base]) return DISPLAY_NAMES[base];
  // Par défaut : remplacer _/- par espace et capitaliser les mots
  return base.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function keyForDescription(nameOrBase: string): string {
  return nameOrBase.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
}

/** ====== Export public : SKILLS (nom + image + détails) ======
 * Permet à la page d’afficher une version LISTE en mobile (noms + images + détails)
 * sans toucher au rendu OrbitToken en desktop.
 */
export const SKILLS: SkillItem[] = (TOKEN_IMAGES as readonly string[]).map(
  (src) => {
    const base = src.replace(/^\//, "").replace(/\.webp$/i, "");
    const name = prettyNameFromPath(src);

    // Tentatives de clés pour matcher les descriptions
    const candidates = [
      keyForDescription(base),
      keyForDescription(name),
      keyForDescription(name.replace(/\s+js$/i, "js")), // ex: "Express js" → "expressjs"
    ];

    const desc =
      DESCRIPTIONS[candidates[0]] ??
      DESCRIPTIONS[candidates[1]] ??
      DESCRIPTIONS[candidates[2]] ??
      undefined;

    return { name, image: src, desc };
  }
);

/** ====== Composant (OrbitToken) ====== */
export default function Skills({ id = "skills", title }: SkillsProps) {
  return (
    <section
      id={id}
      className="px-5 md:px-8 lg:px-12 py-16 md:py-24 max-w-6xl mx-auto"
    >
      {title ? (
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">{title}</h2>
      ) : null}

      <div className="grid place-items-center">
        <OrbitToken
          images={SKILLS.map((s) => s.image)} // rendu identique, basé sur SKILLS
          gap={200}
          radius={240}
          ringPad={200}
          tokenSize={80}
          orbitSec={24}
          centerSize={220}
          centerSpeedSec={8}
        />
      </div>
    </section>
  );
}

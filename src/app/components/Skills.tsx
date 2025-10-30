"use client";

import React from "react";
import OrbitToken from "./OrbitToken";

type SkillsProps = {
  id?: string;
  /** Laisse undefined pour ne pas afficher de titre */
  title?: string;
};

// <= NOMS EXACTS dans /public (casse incluse)
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
  "/VmwareWorkstation.webp", // <— vérifie bien l’orthographe du fichier
] as const;

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
          images={TOKEN_IMAGES}
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

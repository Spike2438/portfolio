"use client";

import React, { useMemo, useRef, useState } from "react";
import Token from "./Token";

type OrbitTokenProps = {
  images: ReadonlyArray<string> | string[];
  radius?: number; // utilisé seulement si gap est undefined (compat)
  ringPad?: number; // idem (compat)
  tokenSize?: number;
  orbitSec?: number;
  activateAt?: number; // distance d'activation
  centerSize?: number;
  centerSpeedSec?: number;
  /** Espace entre SKILLS et le bord d’un token (px) — garantit même écart des 2 côtés */
  gap?: number;
};

// Détails courts (1–2 lignes)
const DESCRIPTIONS: Record<string, string> = {
  css3: "Styles modernes, Grid/Flex.\nAnimations fluides.",
  docker: "Images & Compose.\nEnvironnements reproductibles.",
  dokploy: "PaaS self-hosted.\nCI/CD simplifiée.",
  expo: "Tooling React Native.\nBuild, OTA updates.",
  "express js": "APIs REST rapides.\nMiddleware léger.",
  github: "Git, PR, Actions CI.\nWorkflows.",
  html5: "Structure sémantique.\nAccessibilité.",
  js: "ESNext, modules.\nDOM & tooling.",
  kaspa: "Blockchain PoW DAG.\nTx rapides.",
  kasware: "Wallet Kaspa.\nIntégration dApp.",
  mongodb: "NoSQL par documents.\nIndex & agrégations.",
  "next js": "App Router, SSR/ISR.\nServer Actions.",
  "node js": "Runtime serveur JS.\nStreams & perf.",
  portainer: "UI Docker.\nStacks & registries.",
  qnap: "NAS & services.\nSauvegarde/VM.",
  react: "Hooks & context.\nComposants.",
  "react native": "Apps iOS/Android.\nBridge natif.",
  synology: "NAS & backup.\nServices maison.",
  vercel: "Edge/serverless.\nPréviews & analytics.",
  "vmware workstation": "Virtualisation desktop.\nLabs, snapshots, réseaux.",
  render: "Cloud backend\nLabs, snapshots, réseaux.",
};

export default function OrbitToken({
  images,
  radius = 240, // compat si gap est undefined
  ringPad = 40, // compat si gap est undefined
  tokenSize = 64,
  orbitSec = 24,
  activateAt,
  centerSize = 200,
  centerSpeedSec = 8,
  gap = 32, // <-- par défaut: écart symétrique contrôlé
}: OrbitTokenProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const imgs = useMemo(() => images, [images]);

  // Rayon effectif : géométrique (gap) sinon compat (radius+ringPad)
  const ringR =
    gap !== undefined ? centerSize / 2 + gap + tokenSize / 2 : radius + ringPad;

  const threshold = activateAt ?? ringR + 120;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const box = hostRef.current?.getBoundingClientRect();
    if (!box) return;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    setOn(dist <= threshold);
  }
  function handleLeave() {
    setOn(false);
    setHoverIdx(null);
  }

  const labelOf = (path: string) => {
    const base = decodeURIComponent(path.split("/").pop() || path).replace(
      /\.[^.]+$/,
      ""
    );
    const withSpaces = base
      .replace(/[_-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
    return withSpaces.trim();
  };
  const keyOf = (label: string) => label.toLowerCase();

  return (
    <div
      ref={hostRef}
      className="orbitHost"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        minWidth: ringR * 2 + centerSize,
        minHeight: ringR * 2 + centerSize,
      }}
    >
      {/* Anneau */}
      <div
        className={`orbit ${on ? "on" : ""} ${
          hoverIdx !== null ? "paused" : ""
        }`}
        style={
          {
            ["--R" as any]: `${ringR}px`,
            ["--sec" as any]: `${orbitSec}s`,
          } as React.CSSProperties
        }
      >
        <div className="ring">
          {imgs.map((src, i) => {
            const deg = (360 / imgs.length) * i;
            const delay = `${Math.round(i * 18)}ms`;
            const isHovered = hoverIdx === i;

            const label = labelOf(src);
            const desc = DESCRIPTIONS[keyOf(label)] ?? "";

            return (
              <div
                key={i}
                className={`item ${isHovered ? "hovered" : ""}`}
                style={
                  on
                    ? {
                        // pivot au CENTRE: plus de translate(-50%,-50%)
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translate(var(--R)) rotate(${-deg}deg)`,
                        transitionDelay: delay,
                        width: tokenSize,
                        height: tokenSize,
                      }
                    : {
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translate(0px) rotate(${-deg}deg)`,
                        transitionDelay: "0ms",
                        width: tokenSize,
                        height: tokenSize,
                      }
                }
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx((h) => (h === i ? null : h))}
              >
                <span className="hitbox" />
                <div className="scaleWrap">
                  <Token
                    size={tokenSize}
                    speedSec={7}
                    imgSrc={src}
                    spin={!isHovered}
                    angleDeg={isHovered ? 90 : undefined}
                  />
                </div>

                <div className="tooltip">
                  <strong className="tt-title">{label}</strong>
                  {desc ? (
                    <div className="tt-desc">
                      {desc.split("\n").map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Token central */}
      <div className="center">
        <Token
          size={centerSize}
          speedSec={centerSpeedSec}
          label="SKILLS"
          spin={!on}
          angleDeg={on ? 90 : undefined}
        />
      </div>

      <style jsx>{`
        .orbitHost {
          position: relative;
          display: grid;
          place-items: center;
        }
        .center {
          position: relative;
          z-index: 2;
        }

        .orbit {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          z-index: 1;
        }
        .ring {
          position: relative;
          width: 0;
          height: 0;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 320ms ease, transform 320ms ease;
          animation: spin var(--sec, 24s) linear infinite;
          animation-play-state: paused;
        }
        .orbit.on .ring {
          opacity: 1;
          transform: scale(1);
          animation-play-state: running;
        }
        .orbit.paused .ring {
          animation-play-state: paused;
        }

        .item {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: 50% 50%; /* pivot AU CENTRE */
          transition: transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
          pointer-events: auto;
          display: grid;
          place-items: center;
          z-index: 1;
        }

        .hitbox {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: transparent;
        }
        .scaleWrap {
          transform: scale(1);
          transition: transform 160ms ease, filter 160ms ease;
        }
        .item.hovered {
          z-index: 60;
        }
        .item.hovered .scaleWrap {
          transform: scale(1.35);
          filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.45));
        }

        .tooltip {
          position: absolute;
          left: 50%;
          top: -16px;
          transform: translate(-50%, -100%);
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(7, 19, 30, 0.92);
          color: #e8f6ff;
          font-size: 12px;
          line-height: 1.25;
          max-width: 220px;
          white-space: normal;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          opacity: 0;
          translate: 0 6px;
          pointer-events: none;
          transition: opacity 160ms ease, translate 160ms ease;
          text-align: center;
        }
        .tooltip::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -6px;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(7, 19, 30, 0.92);
        }
        .tt-title {
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
        }
        .tt-desc {
          opacity: 0.92;
          font-size: 11px;
        }

        .item.hovered .tooltip {
          opacity: 1;
          translate: 0 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SkillsDetailProps = {
  tokens?: string[];
  radius?: number;
  tokenSize?: number;
  ringSpeedSec?: number;
  spinSpeedSec?: number;
  /** Active/visible forcé (quand on contrôle depuis le laptop) */
  active?: boolean;
  /** Si true, on ignore la proximité souris et on suit strictement `active` */
  controlled?: boolean;
};

export default function SkillsDetail({
  tokens = [
    "KASPA",
    "MARTY",
    "REACT",
    "NEXT",
    "TS",
    "NODE",
    "EXPO",
    "RN",
    "CSS",
    "SASS",
    "TAILWIND",
    "THREE",
    "PRISMA",
    "SQL",
    "REDUX",
    "ZUSTAND",
    "JEST",
    "VITE",
    "WEBGL",
  ],
  radius = 180,
  tokenSize = 64,
  ringSpeedSec = 18,
  spinSpeedSec = 6,
  active = false,
  controlled = false,
}: SkillsDetailProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const isOn = controlled ? active : near;
  const ringPaused = hoverIdx !== null;

  const angles = useMemo(() => {
    const n = tokens.length;
    const step = 360 / n;
    return Array.from({ length: n }, (_, i) => i * step);
  }, [tokens.length]);

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCenter({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (controlled) return; // le parent pilote `isOn`
    const onMove = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - center.x, e.clientY - center.y);
      const threshold = radius + tokenSize * 1.2;
      setNear(dist < threshold);
    };
    const onLeave = () => {
      setNear(false);
      setHoverIdx(null);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [controlled, center.x, center.y, radius, tokenSize]);

  return (
    <div
      ref={boxRef}
      className={`detail ${isOn ? "is-on" : "is-off"}`}
      style={
        {
          // @ts-ignore
          "--R": `${radius}px`,
          "--SZ": `${tokenSize}px`,
          "--RING_SPEED": `${ringSpeedSec}s`,
          "--SPIN_SPEED": `${spinSpeedSec}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={[
          "field",
          isOn ? "is-near" : "is-far",
          ringPaused ? "is-paused" : "is-rotating",
        ].join(" ")}
      >
        <div className="ring">
          {tokens.map((name, i) => (
            <button
              key={i}
              className={"token" + (hoverIdx === i ? " is-hover" : "")}
              style={{ ["--ANGLE" as any]: `${(360 / tokens.length) * i}deg` }}
              onPointerEnter={() => setHoverIdx(i)}
              onPointerLeave={() => setHoverIdx(null)}
              aria-label={name}
            >
              <div className="coin" />
              <span className="label">{name}</span>
            </button>
          ))}
        </div>

        <div className="dot" />
      </div>

      <style jsx>{`
        .detail {
          position: relative;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 320ms ease, transform 320ms ease;
          pointer-events: none; /* le laptop au-dessus reste interactif */
        }
        .detail.is-on {
          opacity: 1;
          transform: scale(1);
          pointer-events: none; /* laisser la souris au laptop; tokens cliquables autour seulement */
        }

        .field {
          position: absolute;
          inset: 0;
          margin: 0 auto;
        }

        .ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          transform: translate(-50%, -50%) rotate(0deg);
          transform-origin: center center;
          animation: ring-rotate var(--RING_SPEED) linear infinite;
          animation-play-state: paused;
        }
        .field.is-rotating .ring {
          animation-play-state: running;
        }
        .field.is-paused .ring {
          animation-play-state: paused;
        }

        @keyframes ring-rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .token {
          position: absolute;
          left: 0;
          top: 0;
          width: var(--SZ);
          height: var(--SZ);
          border: none;
          padding: 0;
          border-radius: 9999px;
          background: transparent;
          cursor: default; /* tokens derrière, on évite le piège */
          transform: rotate(var(--ANGLE)) translate(var(--r, 0px))
            rotate(calc(-1 * var(--ANGLE)));
          transform-origin: center center;
          transition: transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .coin {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25),
            inset 0 0 0 2px rgba(0, 0, 0, 0.06);
          transform-style: preserve-3d;
          animation: coin-spin var(--SPIN_SPEED) linear infinite;
          animation-play-state: paused;
        }
        .field.is-near .coin {
          animation-play-state: running;
        }

        .label {
          position: absolute;
          left: 50%;
          top: calc(100% + 10px);
          transform: translateX(-50%);
          pointer-events: none;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px 8px;
          border-radius: 8px;
          opacity: 0;
          transition: opacity 160ms ease, transform 160ms ease;
          backdrop-filter: blur(6px);
        }
        .token.is-hover .label {
          opacity: 1;
          transform: translateX(-50%) translateY(-2px);
        }

        .field.is-near .token {
          --r: var(--R);
        }
        .field.is-far .token {
          --r: 0px;
        }

        @keyframes coin-spin {
          to {
            transform: rotateY(360deg);
          }
        }

        .dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 10px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: #fff;
          opacity: 0.35;
        }
      `}</style>
    </div>
  );
}

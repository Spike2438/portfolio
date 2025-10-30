"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Laptop from "./Laptop";
import Token from "./Token";

type LaptopOrbitProps = React.ComponentProps<typeof Laptop> & {
  images: string[]; // 19 images max
  radius?: number; // rayon de l’anneau (px)
  tokenSize?: number; // taille d’un token (px)
  orbitSec?: number; // secondes par tour
  forceOn?: boolean; // bypass détection .opened (debug)
};

export default function LaptopOrbit({
  images,
  radius = 240,
  tokenSize = 64,
  orbitSec = 24,
  forceOn = false,
  ...laptopProps
}: LaptopOrbitProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Active l’anneau quand <Laptop> a .opened (ou forceOn = true)
  useEffect(() => {
    if (forceOn) {
      setIsOpen(true);
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    const check = () => setIsOpen(!!host.querySelector(".opened"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(host, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, [forceOn]);

  const imgs = useMemo(() => images.slice(0, 19), [images]);

  return (
    <div className="orbitHost" ref={hostRef}>
      {/* Anneau de tokens */}
      <div
        className={`orbit ${isOpen ? "on" : ""}`}
        style={{
          ["--R" as any]: `${radius}px`,
          ["--sec" as any]: `${orbitSec}s`,
        }}
      >
        <div className="ring">
          {imgs.map((src, i) => {
            const deg = (360 / imgs.length) * i;
            return (
              <div
                key={i}
                className="item"
                style={{
                  transform: `rotate(${deg}deg) translate(var(--R)) rotate(${-deg}deg)`,
                }}
              >
                <Token size={tokenSize} speedSec={7} imgSrc={src} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Ton laptop */}
      <Laptop {...laptopProps} />

      <style jsx>{`
        .orbitHost {
          position: relative;
          display: inline-block;
        }
        .orbit {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          z-index: 5;
        }
        .ring {
          position: relative;
          width: 0;
          height: 0;
          transform: scale(0.85);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
        .orbit.on .ring {
          opacity: 1;
          transform: scale(1);
          animation: spin var(--sec, 24s) linear infinite;
        }
        .item {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: 0 0;
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

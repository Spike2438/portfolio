"use client";

import React from "react";

type TokenProps = {
  size?: number;
  speedSec?: number;
  className?: string;
  /** Image sur la face (pour les tokens orbitaux) */
  imgSrc?: string;
  /** Texte centré (ex: "SKILLS") */
  label?: string;
  labelColor?: string;
  rimA?: string; // couleur tranche haut
  rimB?: string; // couleur tranche bas
  faceColor?: string; // couleur de fond si pas d'image

  /** true = rotation Y continue ; false = stop */
  spin?: boolean;
  /** angle Y fixe quand spin=false (ex: 90 = face avant) */
  angleDeg?: number;
};

export default function Token({
  size = 200,
  speedSec = 7,
  className,
  imgSrc,
  label,
  labelColor = "#fff",
  rimA = "#70cef8",
  rimB = "#0f2330",
  faceColor = "#70cef8",
  spin = true,
  angleDeg,
}: TokenProps) {
  const styleVars = {
    ["--size" as any]: `${size}px`,
    ["--speed" as any]: `${speedSec}s`,
    ["--rimA" as any]: rimA,
    ["--rimB" as any]: rimB,
    ["--labelColor" as any]: labelColor,
    ["--faceColor" as any]: faceColor,
    ...(angleDeg !== undefined ? { ["--angle" as any]: `${angleDeg}deg` } : {}),
  } as React.CSSProperties;

  return (
    <div
      className={`coin ${spin ? "spin" : "no-spin"} ${className ?? ""}`}
      style={styleVars}
      aria-hidden="true"
    >
      {/* FACE AVANT */}
      <div className="side heads">
        {imgSrc ? (
          <img className="face-img" src={imgSrc} alt="" />
        ) : (
          <div className="face-bg" />
        )}
        {label ? <span className="face-label">{label}</span> : null}
      </div>

      {/* FACE ARRIÈRE */}
      <div className="side tails">
        {imgSrc ? (
          <img className="face-img" src={imgSrc} alt="" />
        ) : (
          <div className="face-bg" />
        )}
        {label ? <span className="face-label">{label}</span> : null}
      </div>

      <style jsx>{`
        .coin {
          font-size: var(--size, 200px); /* 1em = diamètre */
          width: 0.1em;
          height: 1em;
          background: linear-gradient(
            var(--rimA, #70cef8),
            var(--rimB, #0f2330)
          ); /* tranche */
          margin: auto;
          position: relative;
          transform-style: preserve-3d;
          will-change: transform;
          /* si spin=false on fige l'angle */
          transform: rotateY(var(--angle, 0deg));
        }
        .coin.spin {
          animation: rotateY360 var(--speed, 7s) linear infinite;
        }
        .coin.no-spin {
          animation: none;
        }

        .side,
        .coin::before,
        .coin::after {
          position: absolute;
          width: 1em;
          height: 1em;
          overflow: hidden;
          border-radius: 50%;
          right: -0.4em;
          text-align: center;
          line-height: 1;
          transform: rotateY(-90deg);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .tails,
        .coin::after {
          left: -0.4em;
          transform: rotateY(90deg);
        }
        .coin::before,
        .coin::after {
          content: "";
          background: linear-gradient(
            var(--rimA, #70cef8),
            var(--rimB, #0f2330)
          );
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: rotateY(90deg);
        }
        .coin::after {
          transform: rotateY(-90deg);
        }
        @keyframes rotateY360 {
          to {
            transform: rotateY(360deg);
          }
        }

        /* Fond simple si pas d'image */
        .face-bg {
          width: 100%;
          height: 100%;
          background: radial-gradient(
              ellipse at 35% 30%,
              rgba(255, 255, 255, 0.25),
              transparent 60%
            ),
            var(--faceColor, #70cef8);
        }

        .face-img {
          display: block;
          width: 90%;
          height: 90%;
          object-fit: cover;
          border-radius: 50%;
          margin: 5%;
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.25));
          pointer-events: none;
          background: #0b1a26;
        }
        .face-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: var(--labelColor, #fff);
          font-size: 0.24em; /* ~24% du diamètre */
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
}

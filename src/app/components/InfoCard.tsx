"use client";

import React from "react";

export default function InfoCard() {
  return (
    <aside
      className="
        w-[min(92vw,320px)]
        rounded-2xl border border-white/10 bg-white/5
        backdrop-blur px-4 py-5
        shadow-[0_8px_30px_rgba(0,0,0,0.25)]
        text-[var(--ink)]
        select-text
      "
    >
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] opacity-80">
        Contact
      </h3>

      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <PhoneIcon className="mt-0.5 h-4 w-4 opacity-70" />
          <a href="tel:+33647619693" className="hover:underline">
            06 47 61 96 93
          </a>
        </li>
        <li className="flex items-start gap-3">
          <PinIcon className="mt-0.5 h-4 w-4 opacity-70" />
          <span>06130 Grasse</span>
        </li>
        <li className="flex items-start gap-3">
          <MailIcon className="mt-0.5 h-4 w-4 opacity-70" />
          <a
            href="mailto:anthony.edon@gmail.com"
            className="break-all hover:underline"
          >
            anthony.edon@gmail.com
          </a>
        </li>
        <li className="flex items-start gap-3">
          <GitIcon className="mt-0.5 h-4 w-4 opacity-70" />
          <a
            href="https://github.com/Anto2438"
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
            title="github.com/Anto2438"
          >
            github.com/Anto2438
          </a>
        </li>
        <li className="flex items-start gap-3">
          <CheckIcon className="mt-0.5 h-4 w-4 opacity-70" />
          <span>Permis B</span>
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.14em] opacity-80">
        Formations
      </h3>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed opacity-90">
        <li>
          <strong>2025</strong> — RNCP niveau 6, Bootcamp “La Capsule” —
          Développeur apps web & mobile
        </li>
        <li>
          <strong>2023</strong> — Certificat pro. AFPA — Maintenance dépannage
          climatisation
        </li>
        <li>
          <strong>2009</strong> — Certificat pro. AFPA (niv. V) — Électricien
          d’équipement
        </li>
        <li>
          <strong>1998</strong> — BAC PRO Maintenance réseau informatique
        </li>
        <li>
          <strong>1996</strong> — BEP Électronique — CAP ECC
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.14em] opacity-80">
        Skills
      </h3>

      <div className="mt-3 text-xs opacity-90">
        <p className="underline">Languages :</p>
        <p className="mt-1">HTML, CSS, JS, TypeScript</p>

        <p className="mt-3 underline">Frameworks / Libraries :</p>
        <p className="mt-1">
          Node.js, Express, MongoDB, React, React Native, Next.js
        </p>
      </div>
    </aside>
  );
}

/* ===== Icônes SVG mini (inline) ===== */
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 5.5c0 8.56 6.94 15.5 15.5 15.5 1.2 0 2.3-.47 3.13-1.3a1.8 1.8 0 0 0 0-2.55l-2.2-2.2a1.7 1.7 0 0 0-2.08-.26l-1.65.92a2.4 2.4 0 0 1-2.45-.1 18.9 18.9 0 0 1-6.15-6.15 2.4 2.4 0 0 1-.1-2.45l.92-1.65c.4-.7.3-1.58-.26-2.08L4.85 2.37A1.8 1.8 0 0 0 2.3 2.3C1.47 3.13 1 4.3 1 5.5"
      />
    </svg>
  );
}
function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s7-6.06 7-12a7 7 0 0 0-14 0c0 5.94 7 12 7 12Z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Z"
      />
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7 8 5 8-5"
      />
    </svg>
  );
}
function GitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.43c.58.11.79-.25.79-.55l-.02-2.02c-3.21.7-3.89-1.55-3.89-1.55-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.26 3.4.96.11-.76.41-1.26.75-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.52.11-3.17 0 0 .98-.31 3.2 1.19a11.07 11.07 0 0 1 5.83 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.65.23 2.87.12 3.17.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.26 5.69.43.37.8 1.1.8 2.22l-.01 3.29c0 .3.2.66.8.55A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 13 4 4L19 7"
      />
    </svg>
  );
}

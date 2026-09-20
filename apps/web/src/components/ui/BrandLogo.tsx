"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showSubtitle = true,
  href = "/",
  className = "",
}: BrandLogoProps) {
  // Sizing matrix for emblem & typography
  const config = {
    sm: {
      emblemBox: "h-7 w-7",
      titleText: "text-sm",
      badgeText: "text-[8px] px-1 py-0.2",
      subtitleText: "text-[8.5px]",
      gap: "gap-2",
    },
    md: {
      emblemBox: "h-8 w-8 sm:h-9 sm:w-9",
      titleText: "text-base sm:text-lg",
      badgeText: "text-[8px] sm:text-[9px] px-1.5 py-0.5",
      subtitleText: "text-[9px] sm:text-[9.5px]",
      gap: "gap-2 sm:gap-2.5",
    },
    lg: {
      emblemBox: "h-10 w-10 sm:h-12 sm:w-12",
      titleText: "text-xl sm:text-2xl",
      badgeText: "text-[9px] sm:text-[10px] px-2 py-0.5",
      subtitleText: "text-xs",
      gap: "gap-3",
    },
  }[size];

  const content = (
    <div className={`group inline-flex items-center ${config.gap} ${className} select-none cursor-pointer`}>
      {/* 1. Iconic Aerodynamic Shuttlecock Shield Emblem */}
      <div
        className={`relative ${config.emblemBox} shrink-0 rounded-2xl bg-gradient-to-br from-[#06241a] via-[#021811] to-[#010c08] p-0.5 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30 transition-all duration-300 group-hover:scale-105 group-hover:ring-emerald-400 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            {/* Emerald Wing Gradient */}
            <linearGradient id="clvlWingTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Radiant White Center Blade */}
            <linearGradient id="clvlWingCenter" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Cyan/Teal Wing Gradient */}
            <linearGradient id="clvlWingBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Golden Cork Head Gradient */}
            <linearGradient id="clvlCorkGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Speed Slash Glow */}
            <filter id="clvlGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Internal Geometric Guide Rays (Nét Chuyển Động Khí Động Học) */}
          <path
            d="M9 39L39 9"
            stroke="rgba(52, 211, 153, 0.18)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
          <circle cx="34" cy="18" r="8" fill="rgba(16, 185, 129, 0.12)" filter="blur(3px)" />

          {/* Core Soaring Shuttlecock Geometry (Biểu Tượng Cánh Cầu Bay Vút) */}
          <g filter="url(#clvlGlow)">
            {/* Wing 1: Top Dynamic Feather */}
            <path
              d="M13 30C15 21 22 16 31 16C26 20 23 24 20 29Z"
              fill="url(#clvlWingTop)"
            />

            {/* Wing 2: Center Main Blade (Pure White Core) */}
            <path
              d="M10 33C13 22 23 17 34 19C27 24 21 28 16 34Z"
              fill="url(#clvlWingCenter)"
            />

            {/* Wing 3: Bottom Stabilizer Feather */}
            <path
              d="M13.5 35.5C18 30.5 25 27.5 32 28.5C26 32.5 21 34.5 17 36.5Z"
              fill="url(#clvlWingBottom)"
            />

            {/* Iconic Red Ribbon Collar Tape (Điểm Nhấn Đỏ Thể Thao) */}
            <path
              d="M31.2 15.5L34.2 18.5L32.2 21L29.2 18Z"
              fill="#f43f5e"
            />

            {/* Golden Cork Head (Đầu Bần Vàng Ánh Kim) */}
            <ellipse
              cx="35.5"
              cy="17.5"
              rx="4.6"
              ry="4.6"
              fill="url(#clvlCorkGold)"
            />
            {/* Diamond Glint */}
            <circle cx="36.8" cy="16.2" r="1.3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* 2. Athletic Sports Wordmark */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-slate-900 ${config.titleText} leading-none group-hover:text-emerald-700 transition-colors font-sans`}
          >
            CLVL
          </span>
          <span
            className={`rounded-full bg-emerald-100/90 border border-emerald-300/80 font-black uppercase text-emerald-800 ${config.badgeText} leading-tight tracking-wider`}
          >
            SPORTS
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`hidden sm:block font-black uppercase tracking-[0.16em] text-slate-400 ${config.subtitleText} mt-0.5 leading-none group-hover:text-slate-600 transition-colors`}
          >
            Cầu Lông Việt Nam
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href as any} className="outline-none inline-block">
      {content}
    </Link>
  );
}


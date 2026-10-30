"use client";

import React, { useId } from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

/**
 * Biểu tượng quả cầu tối giản (Concept A) — dùng chung cho Navbar, Footer, v.v.
 * Đồng bộ với app/icon.svg, favicon.ico, apple-icon.png và icon PWA.
 */
export function BrandEmblem({ className = "h-8 w-8" }: { className?: string }) {
  const gradId = `dclBg-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradId})`} />
      <g transform="rotate(225 256 256) translate(256 256) scale(0.9) translate(-256 -250)">
        {/* Thân cầu (lông vũ) */}
        <path d="M150 118 Q256 96 362 118 L310 318 L202 318 Z" fill="#ffffff" />
        <g stroke="#059669" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M256 310 L256 116" />
          <path d="M229 310 L192 124" />
          <path d="M283 310 L320 124" />
          <path d="M178 200 Q256 186 334 200" strokeWidth="7" />
        </g>
        {/* Băng cổ cầu */}
        <rect x="198" y="310" width="116" height="24" rx="5" fill="#065f46" />
        {/* Đầu cầu vàng */}
        <path d="M198 334 H314 V340 A58 58 0 0 1 198 340 Z" fill="#fbbf24" />
      </g>
    </svg>
  );
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
      {/* 1. Minimal Shuttlecock Emblem */}
      <div
        className={`relative ${config.emblemBox} shrink-0 rounded-[22%] shadow-sm shadow-emerald-900/20 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6`}
      >
        <BrandEmblem className="h-full w-full" />
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

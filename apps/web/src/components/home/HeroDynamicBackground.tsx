"use client";

import React, { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
};

export function HeroDynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse Parallax tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Canvas Particle Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Color palette: Emerald, Cyan, Teal, Gold spark
    const colors = [
      "rgba(16, 185, 129, ", // Emerald
      "rgba(52, 211, 153, ", // Mint
      "rgba(6, 182, 212, ",  // Cyan
      "rgba(45, 212, 191, ", // Teal
      "rgba(245, 158, 11, ", // Amber spark
    ];

    const PARTICLE_COUNT = 45;
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2), // float upwards
        baseAlpha: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Oscillate brightness
        p.alpha = p.baseAlpha + Math.sin(tick + i) * 0.2;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = p.size * 5;
        ctx.shadowColor = p.color + "0.8)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Deep Arena Stadium Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#031d16] to-slate-950" />

      {/* 2. Sweeping Aurora Glowing Orbs (CSS Keyframe Animated) */}
      <div
        className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-500/25 blur-[100px] animate-pulse-slow"
        style={{
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      <div
        className="absolute top-1/4 -right-28 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[110px] animate-float-slow"
        style={{
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      <div
        className="absolute -bottom-24 left-1/3 h-[420px] w-[420px] rounded-full bg-teal-400/20 blur-[90px] animate-aurora-breathe"
        style={{
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      <div className="absolute top-1/2 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />

      {/* 3. 3D Perspective Glowing Badminton Court (Bottom Plane) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[380px] opacity-45 overflow-hidden"
        style={{
          perspective: "700px",
          transform: `rotateX(${28 + mousePos.y * 6}deg) rotateY(${mousePos.x * 8}deg)`,
          transformOrigin: "bottom center",
          transition: "transform 0.4s ease-out",
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Neon Green Glow Filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear Gradient for Floor Grid */}
            <linearGradient id="court-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="30%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
            </linearGradient>

            {/* Sweeping Laser Beam Gradient */}
            <linearGradient id="laser-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="50%" stopColor="#67e8f9" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Badminton Court Outer Boundaries (Doubles Court) */}
          <rect
            x="150"
            y="50"
            width="700"
            height="500"
            fill="url(#court-fade)"
            fillOpacity="0.08"
            stroke="url(#court-fade)"
            strokeWidth="2.5"
            filter="url(#neon-glow)"
          />

          {/* Singles Sidelines */}
          <line
            x1="200"
            y1="50"
            x2="200"
            y2="550"
            stroke="#10b981"
            strokeOpacity="0.5"
            strokeWidth="1.8"
            filter="url(#neon-glow)"
          />
          <line
            x1="800"
            y1="50"
            x2="800"
            y2="550"
            stroke="#10b981"
            strokeOpacity="0.5"
            strokeWidth="1.8"
            filter="url(#neon-glow)"
          />

          {/* Center Service Line */}
          <line
            x1="500"
            y1="50"
            x2="500"
            y2="230"
            stroke="#10b981"
            strokeOpacity="0.6"
            strokeWidth="1.8"
            filter="url(#neon-glow)"
          />
          <line
            x1="500"
            y1="370"
            x2="500"
            y2="550"
            stroke="#10b981"
            strokeOpacity="0.6"
            strokeWidth="1.8"
            filter="url(#neon-glow)"
          />

          {/* Short Service Lines */}
          <line
            x1="150"
            y1="230"
            x2="850"
            y2="230"
            stroke="#10b981"
            strokeOpacity="0.6"
            strokeWidth="2"
            filter="url(#neon-glow)"
          />
          <line
            x1="150"
            y1="370"
            x2="850"
            y2="370"
            stroke="#10b981"
            strokeOpacity="0.6"
            strokeWidth="2"
            filter="url(#neon-glow)"
          />

          {/* Long Service Lines for Doubles */}
          <line
            x1="150"
            y1="90"
            x2="850"
            y2="90"
            stroke="#10b981"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <line
            x1="150"
            y1="510"
            x2="850"
            y2="510"
            stroke="#10b981"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />

          {/* Center Net Line with Bright White/Cyan Glow */}
          <line
            x1="120"
            y1="300"
            x2="880"
            y2="300"
            stroke="#67e8f9"
            strokeWidth="3.5"
            filter="url(#neon-glow)"
          />

          {/* Sweeping Laser Scan Line (Simulated Stadium Lighting Sweep) */}
          <line
            x1="100"
            y1="300"
            x2="900"
            y2="300"
            stroke="url(#laser-beam)"
            strokeWidth="6"
            className="animate-laser-sweep"
          />
        </svg>
      </div>

      {/* 4. Canvas Particle Layer (Sparks & Light Orbs) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Floating Glowing 3D Shuttlecock Silhouettes */}
      {/* Shuttlecock 1: Top Right */}
      <div
        className="absolute top-12 right-12 sm:right-24 h-16 w-16 opacity-35 animate-float-slow"
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px) rotate(25deg)`,
          transition: "transform 0.6s ease-out",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]"
        >
          {/* Cork Head */}
          <ellipse cx="32" cy="50" rx="9" ry="7" fill="#34d399" />
          <ellipse cx="32" cy="48" rx="7" ry="5" fill="#a7f3d0" />
          {/* Feather Cone */}
          <path
            d="M23 48L14 16C14 16 22 12 32 12C42 12 50 16 50 16L41 48"
            stroke="#6ee7b7"
            strokeWidth="1.8"
            fill="rgba(16, 185, 129, 0.15)"
          />
          {/* Rib Lines */}
          <line x1="20" y1="26" x2="44" y2="26" stroke="#a7f3d0" strokeWidth="1.2" />
          <line x1="22" y1="36" x2="42" y2="36" stroke="#a7f3d0" strokeWidth="1.2" />
          <line x1="27" y1="14" x2="27" y2="48" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="32" y1="12" x2="32" y2="48" stroke="#34d399" strokeWidth="1.2" />
          <line x1="37" y1="14" x2="37" y2="48" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Shuttlecock 2: Bottom Left (Accent Glow) */}
      <div
        className="absolute bottom-16 left-8 sm:left-20 h-20 w-20 opacity-25 animate-pulse-slow"
        style={{
          transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px) rotate(-35deg)`,
          transition: "transform 0.6s ease-out",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]"
        >
          <ellipse cx="32" cy="50" rx="9" ry="7" fill="#06b6d4" />
          <path
            d="M23 48L14 16C14 16 22 12 32 12C42 12 50 16 50 16L41 48"
            stroke="#67e8f9"
            strokeWidth="1.8"
            fill="rgba(6, 182, 212, 0.15)"
          />
          <line x1="20" y1="26" x2="44" y2="26" stroke="#a5f3fc" strokeWidth="1.2" />
          <line x1="22" y1="36" x2="42" y2="36" stroke="#a5f3fc" strokeWidth="1.2" />
        </svg>
      </div>

      {/* 6. Subtle Hexagonal Tech Stadium Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* 7. Soft Vignette Edge Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

      {/* Custom Styles for Keyframe Animations */}
      <style jsx>{`
        @keyframes laserSweep {
          0% {
            transform: translateY(-200px);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(220px);
            opacity: 0;
          }
        }

        @keyframes auroraBreathe {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.25) translate(30px, -20px);
            opacity: 0.35;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(4deg);
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.45;
          }
        }

        .animate-laser-sweep {
          animation: laserSweep 5s ease-in-out infinite;
        }

        .animate-aurora-breathe {
          animation: auroraBreathe 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: floatSlow 7s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulseSlow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// --- Types for the Cinematic Badminton Engine ---
interface FeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  angle: number;
  rotationSpeed: number;
  swaySpeed: number;
  swayOffset: number;
  alpha: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  speed: number;
  thickness: number;
}

interface SpeedSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface TrailSample {
  x: number;
  y: number;
  angle: number;
  speed: number;
  alpha: number;
}

interface RallyWaypoint {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  arcHeight: number;
  duration: number;
  type: "clear" | "smash" | "drop" | "drive" | "user_smash";
  speedDisplay: number;
  shotName: string;
}

export function HeroDynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Court Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Mouse & Touch tracking for 3D gyro tilt and feather interaction
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: nx, y: ny });
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    mouseRef.current.active = false;
  }, []);

  // Main Canvas Badminton Arena Simulation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    // 1. Realistic BWF Pro Rally Choreography
    const rallyScript: RallyWaypoint[] = [
      {
        // 1. Explosive Jump Smash (426 km/h)
        startX: 0.82,
        startY: 0.28,
        endX: 0.24,
        endY: 0.74,
        arcHeight: 20,
        duration: 32,
        type: "smash",
        speedDisplay: 426,
        shotName: "THUNDER JUMP SMASH",
      },
      {
        // 2. Acrobatic Dive Cross Net Drop (bỏ nhỏ hiểm hóc)
        startX: 0.24,
        startY: 0.74,
        endX: 0.54,
        endY: 0.62,
        arcHeight: -55,
        duration: 52,
        type: "drop",
        speedDisplay: 168,
        shotName: "CROSS NET TUMBLE",
      },
      {
        // 3. Flat Drive Skimming the White Net Tape
        startX: 0.54,
        startY: 0.62,
        endX: 0.18,
        endY: 0.60,
        arcHeight: -25,
        duration: 38,
        type: "drive",
        speedDisplay: 285,
        shotName: "LIGHTNING DRIVE",
      },
      {
        // 4. Moonball Defensive Clear (phông cầu bổng cứu nguy)
        startX: 0.18,
        startY: 0.60,
        endX: 0.84,
        endY: 0.52,
        arcHeight: -230,
        duration: 90,
        type: "clear",
        speedDisplay: 210,
        shotName: "HIGH ARCH CLEAR",
      },
      {
        // 5. Steep Downward Reverse Slice Smash
        startX: 0.84,
        startY: 0.32,
        endX: 0.32,
        endY: 0.78,
        arcHeight: 15,
        duration: 34,
        type: "smash",
        speedDisplay: 442,
        shotName: "REVERSE SLICE SMASH",
      },
      {
        // 6. High Return Lift
        startX: 0.32,
        startY: 0.78,
        endX: 0.82,
        endY: 0.28,
        arcHeight: -220,
        duration: 85,
        type: "clear",
        speedDisplay: 225,
        shotName: "DEFENSIVE LIFT",
      },
    ];

    let shotIdx = 0;
    let shotProgress = 0;
    const trails: TrailSample[] = [];
    const rings: ShockwaveRing[] = [];
    const sparks: SpeedSpark[] = [];

    // 2. Floating Natural Goose Feathers (Lông vũ bay bồng bềnh trong sân)
    const featherCount = 18;
    const feathers: FeatherParticle[] = Array.from({ length: featherCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.45 + 0.25, // gentle float down
      length: Math.random() * 18 + 14,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.45 + 0.2,
    }));

    // Floating Arena Light Motes (Bụi ánh sáng sân đấu)
    const arenaMotes = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.5 + 0.15,
      vy: -(Math.random() * 0.4 + 0.1),
      pulse: Math.random() * Math.PI * 2,
    }));

    // Spawn Impact Ripple on Court Landing
    const triggerImpact = (x: number, y: number, isSmashShot: boolean) => {
      rings.push({
        x,
        y,
        radius: 4,
        maxRadius: isSmashShot ? 85 : 45,
        alpha: 1,
        color: isSmashShot ? "#34d399" : "#38bdf8",
        speed: isSmashShot ? 4.2 : 2.5,
        thickness: isSmashShot ? 3.5 : 2,
      });

      if (isSmashShot) {
        // Outer concentric supersonic ring
        setTimeout(() => {
          rings.push({
            x,
            y,
            radius: 2,
            maxRadius: 65,
            alpha: 0.85,
            color: "#fbbf24",
            speed: 3.2,
            thickness: 2,
          });
        }, 50);
      }

      // Spark particles
      const sparkCount = isSmashShot ? 22 : 10;
      for (let i = 0; i < sparkCount; i++) {
        const rad = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
        const spd = (Math.random() * 3.5 + 2) * (isSmashShot ? 1.6 : 1.0);
        sparks.push({
          x,
          y,
          vx: Math.cos(rad) * spd,
          vy: Math.sin(rad) * spd * 0.65 - (isSmashShot ? 1.4 : 0.4),
          size: Math.random() * 2.5 + 1.2,
          alpha: 1,
          color: isSmashShot
            ? Math.random() > 0.4
              ? "#10b981"
              : "#fef08a"
            : "#67e8f9",
          decay: Math.random() * 0.035 + 0.02,
        });
      }
    };

    // Render Feather Shape
    const drawGooseFeather = (
      c: CanvasRenderingContext2D,
      f: FeatherParticle
    ) => {
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.angle);
      c.globalAlpha = f.alpha;

      const len = f.length;
      const width = len * 0.28;

      // Shaft / Quill (Cuống lông vũ)
      c.strokeStyle = "rgba(255, 255, 255, 0.9)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -len * 0.5);
      c.quadraticCurveTo(width * 0.1, 0, 0, len * 0.5);
      c.stroke();

      // Vane Body (Phiến lông vũ mềm mại)
      const vaneGrad = c.createLinearGradient(-width, 0, width, 0);
      vaneGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      vaneGrad.addColorStop(0.35, "rgba(240, 253, 244, 0.75)");
      vaneGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
      vaneGrad.addColorStop(0.65, "rgba(240, 253, 244, 0.75)");
      vaneGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      c.fillStyle = vaneGrad;
      c.beginPath();
      c.moveTo(0, -len * 0.5);
      c.bezierCurveTo(-width, -len * 0.2, -width, len * 0.25, 0, len * 0.5);
      c.bezierCurveTo(width, len * 0.25, width, -len * 0.2, 0, -len * 0.5);
      c.fill();

      c.restore();
    };

    // Render 3D High-Detail Shuttlecock
    const drawDetailedShuttlecock = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      isSmashShot: boolean
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);

      const scale = isSmashShot ? 1.35 : 1.15;
      c.scale(scale, scale);

      // A. Supersonic Wind Flare (Vệt lửa/khí động học khi smash)
      if (isSmashShot) {
        c.save();
        c.shadowColor = "#34d399";
        c.shadowBlur = 24;
        c.fillStyle = "rgba(52, 211, 153, 0.35)";
        c.beginPath();
        c.arc(0, 0, 18, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // B. 16 Feathers Flared Skirt (Tán lông vũ xòe hình nón)
      const skirtLen = 24;
      const skirtFlare = 16;

      const featherFill = c.createLinearGradient(-skirtLen, 0, 0, 0);
      featherFill.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      featherFill.addColorStop(0.6, "rgba(241, 245, 249, 0.92)");
      featherFill.addColorStop(1, "rgba(226, 232, 240, 0.85)");

      c.fillStyle = featherFill;
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(-skirtLen, -skirtFlare / 2);
      c.quadraticCurveTo(-skirtLen - 3, 0, -skirtLen, skirtFlare / 2);
      c.lineTo(0, 4);
      c.closePath();
      c.fill();

      // Feather skirt edge highlight
      c.strokeStyle = "rgba(255, 255, 255, 0.9)";
      c.lineWidth = 1;
      c.stroke();

      // Individual Feather Stems (Gân lông vũ sắc nét)
      c.strokeStyle = "rgba(148, 163, 184, 0.55)";
      c.lineWidth = 0.7;
      [-6, -3, 0, 3, 6].forEach((offsetY) => {
        c.beginPath();
        c.moveTo(0, offsetY * 0.4);
        c.lineTo(-skirtLen + 1, offsetY);
        c.stroke();
      });

      // Dual Binding Thread Hoops (Hai vòng chỉ buộc chỉ tiêu chuẩn)
      c.strokeStyle = "#38bdf8"; // Cyan primary thread ring
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(-8, 0, 6, -Math.PI / 2, Math.PI / 2);
      c.stroke();

      c.strokeStyle = "rgba(255, 255, 255, 0.85)"; // White secondary thread
      c.lineWidth = 1;
      c.beginPath();
      c.arc(-16, 0, 7.4, -Math.PI / 2, Math.PI / 2);
      c.stroke();

      // C. Cork Collar (Dải băng đỏ thương hiệu Yonex Aerosensa)
      c.fillStyle = "#ef4444";
      c.fillRect(-2, -4, 2.5, 8);

      // D. Cork Base (Đầu bần tự nhiên bo tròn)
      const corkGrad = c.createRadialGradient(2, -1.5, 0.5, 3.5, 0, 7);
      corkGrad.addColorStop(0, "#ffffff");
      corkGrad.addColorStop(0.5, "#fef3c7");
      corkGrad.addColorStop(1, "#d97706");

      c.fillStyle = corkGrad;
      c.beginPath();
      c.arc(3.5, 0, 5, -Math.PI / 2, Math.PI / 2);
      c.closePath();
      c.fill();

      // Specular highlight on the cork nose
      c.fillStyle = "rgba(255, 255, 255, 0.8)";
      c.beginPath();
      c.arc(4.5, -1.5, 1.6, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // Main Animation Loop
    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      const shot = rallyScript[shotIdx];
      const isSmashShot = shot.type === "smash";

      // 1. Update Shot Progress
      shotProgress += 1 / shot.duration;
      const t = Math.min(1, Math.max(0, shotProgress));

      // Ease curves: Smash accelerates into court; Clear floats high
      let easedT = t;
      if (isSmashShot) {
        easedT = Math.pow(t, 1.35); // explosive acceleration
      } else if (shot.type === "clear") {
        easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      const curX = (shot.startX + (shot.endX - shot.startX) * easedT) * width;
      const baseEndY = shot.startY + (shot.endY - shot.startY) * easedT;
      const arcOffset = shot.arcHeight * 4 * t * (1 - t);
      const curY = baseEndY * height + arcOffset;

      // Velocity tangent calculation for cork orientation
      const dt = 0.01;
      const nextT = Math.min(1, t + dt);
      let nextEasedT = nextT;
      if (isSmashShot) nextEasedT = Math.pow(nextT, 1.35);
      else if (shot.type === "clear")
        nextEasedT = nextT < 0.5 ? 2 * nextT * nextT : -1 + (4 - 2 * nextT) * nextT;

      const nextX = (shot.startX + (shot.endX - shot.startX) * nextEasedT) * width;
      const nextBaseEndY = shot.startY + (shot.endY - shot.startY) * nextEasedT;
      const nextArcOffset = shot.arcHeight * 4 * nextT * (1 - nextT);
      const nextY = nextBaseEndY * height + nextArcOffset;

      const vx = nextX - curX;
      const vy = nextY - curY;
      const angle = Math.atan2(vy, vx);
      const currentFlightSpeed = Math.sqrt(vx * vx + vy * vy);

      // Record Trail
      trails.push({
        x: curX,
        y: curY,
        angle,
        speed: currentFlightSpeed,
        alpha: isSmashShot ? 0.95 : 0.6,
      });
      if (trails.length > (isSmashShot ? 26 : 16)) {
        trails.shift();
      }

      // 2. Draw Aerodynamic Plasma Wake Ribbon (Vệt bay ánh sáng)
      if (trails.length > 2) {
        for (let i = 0; i < trails.length - 1; i++) {
          const p1 = trails[i];
          const p2 = trails[i + 1];
          const r = i / trails.length;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          const trailAlpha = r * (isSmashShot ? 0.8 : 0.35);
          ctx.strokeStyle = isSmashShot
            ? `rgba(52, 211, 153, ${trailAlpha})`
            : `rgba(56, 189, 248, ${trailAlpha})`;
          ctx.lineWidth = r * (isSmashShot ? 8.5 : 4);
          ctx.lineCap = "round";
          ctx.stroke();

          // Laser white lightning core for thunder smashes
          if (isSmashShot && r > 0.45) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${trailAlpha * 0.95})`;
            ctx.lineWidth = r * 3;
            ctx.stroke();
          }
        }
      }

      // 3. Draw Floor Impact Rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.radius += ring.speed;
        ring.alpha -= 0.022;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(ring.x, ring.y);
        ctx.scale(1, 0.42); // 3D perspective floor squash
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = ring.thickness;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Impact Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spk = sparks[i];
        spk.x += spk.vx;
        spk.y += spk.vy;
        spk.vy += 0.08;
        spk.alpha -= spk.decay;

        if (spk.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spk.x, spk.y, spk.size, 0, Math.PI * 2);
        ctx.fillStyle = spk.color;
        ctx.globalAlpha = spk.alpha;
        ctx.shadowColor = spk.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 5. Draw Floating Feathers with Cursor Repulsion Physics
      for (let i = 0; i < feathers.length; i++) {
        const f = feathers[i];

        // Cursor avoidance force
        if (mouseRef.current.active) {
          const dx = f.x - mouseRef.current.x;
          const dy = f.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130 && dist > 1) {
            const force = (130 - dist) / 130;
            f.x += (dx / dist) * force * 4.5;
            f.y += (dy / dist) * force * 4.5;
            f.angle += force * 0.05;
          }
        }

        f.x += f.vx + Math.sin(tick * f.swaySpeed + f.swayOffset) * 0.45;
        f.y += f.vy;
        f.angle += f.rotationSpeed;

        // Wrap boundaries
        if (f.y > height + 40) {
          f.y = -40;
          f.x = Math.random() * width;
        }
        if (f.x < -40) f.x = width + 40;
        if (f.x > width + 40) f.x = -40;

        drawGooseFeather(ctx, f);
      }

      // 6. Draw Stadium Dust Motes
      ctx.save();
      for (let i = 0; i < arenaMotes.length; i++) {
        const m = arenaMotes[i];
        m.y += m.vy;
        m.pulse += 0.025;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        const alphaPulse = m.alpha * (0.6 + Math.sin(m.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alphaPulse})`;
        ctx.fill();
      }
      ctx.restore();

      // 7. Draw The Shuttlecock
      drawDetailedShuttlecock(ctx, curX, curY, angle, isSmashShot);

      // 8. Next Shot Transition
      if (shotProgress >= 1) {
        const landingX = shot.endX * width;
        const landingY = shot.endY * height;
        triggerImpact(landingX, landingY, isSmashShot);

        shotProgress = 0;
        trails.length = 0;
        shotIdx = (shotIdx + 1) % rallyScript.length;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Handle Interactive Click to Trigger a subtle pulse animation on the court
  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create immediate ripple effect on click
    const flash = document.createElement("div");
    flash.className =
      "absolute pointer-events-none rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-ping";
    flash.style.left = `${clickX - 30}px`;
    flash.style.top = `${clickY - 30}px`;
    flash.style.width = "60px";
    flash.style.height = "60px";
    containerRef.current.appendChild(flash);

    setTimeout(() => {
      flash.remove();
    }, 800);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleCourtClick}
      className="absolute inset-0 overflow-hidden select-none z-0 cursor-crosshair"
      title="Nhấp vào bất kỳ đâu để thực hiện cú Smash 493 km/h!"
    >
      {/* ========================================================
          1. PRO ARENA STADIUM DOME & VOLUMETRIC FLOODLIGHTS
          Creates the elite night arena atmosphere (All England / BWF Finals)
      ======================================================== */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020d09] via-[#041a12] to-[#010805]" />

      {/* Arena Floodlight Cones (Left & Right) */}
      <div
        className="absolute -top-20 -left-20 w-[750px] h-[650px] opacity-45 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 0%, rgba(52, 211, 153, 0.5) 0%, rgba(16, 185, 129, 0.15) 45%, transparent 70%)",
          transform: `translate(${tilt.x * 25}px, ${tilt.y * 18}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />
      <div
        className="absolute -top-24 -right-24 w-[750px] h-[650px] opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 85% 0%, rgba(56, 189, 248, 0.5) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)",
          transform: `translate(${tilt.x * -25}px, ${tilt.y * 18}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Center God Ray (Tia sáng sân vận động rọi xuống thảm đấu) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] opacity-30 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 42%, rgba(245, 158, 11, 0.15) 48%, rgba(52, 211, 153, 0.35) 50%, rgba(245, 158, 11, 0.15) 52%, transparent 58%)",
          filter: "blur(24px)",
        }}
      />

      {/* ========================================================
          2. 3D GLOSSY BWF TOURNAMENT COURT (THẢM XANH BWF CAO CẤP)
          With realistic specular light reflections, white BWF lines,
          and a realistic 3D woven badminton net
      ======================================================== */}
      <div
        className="absolute inset-x-0 bottom-0 h-[420px] sm:h-[490px] pointer-events-none"
        style={{
          perspective: "900px",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateX(${35 + tilt.y * 5}deg) rotateY(${tilt.x * 6}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 680"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Laser Court Line Glow */}
              <filter id="bwfLineGlow" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Tournament PVC Green Court Gradient with Specular Sheen */}
              <linearGradient id="proBwfCourtMat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#042718" stopOpacity="0.3" />
                <stop offset="30%" stopColor="#064e2d" stopOpacity="0.9" />
                <stop offset="65%" stopColor="#0a693b" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#053e22" stopOpacity="1" />
              </linearGradient>

              {/* Floor Light Reflection Specular Highlight */}
              <linearGradient id="floorReflection" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>

              {/* Red-Brown Outer Run-Off Border Gradient */}
              <linearGradient id="outerFloorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
              </linearGradient>

              {/* Badminton Net Micro Mesh Pattern */}
              <pattern id="netWeave" width="10" height="10" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="10" y2="10" stroke="#475569" strokeWidth="0.75" opacity="0.65" />
                <line x1="10" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="0.75" opacity="0.65" />
              </pattern>
            </defs>

            {/* A. Outer Surrounding Stadium Hall Floor */}
            <polygon
              points="80,70 1120,70 1190,650 10,650"
              fill="url(#outerFloorGrad)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeWidth="1.5"
            />

            {/* B. Official BWF Green Court Mat (13.4m x 6.1m Doubles Court) */}
            <polygon
              points="180,95 1020,95 1090,620 110,620"
              fill="url(#proBwfCourtMat)"
              stroke="#ffffff"
              strokeWidth="3.5"
              filter="url(#bwfLineGlow)"
            />

            {/* Glossy Floor Reflection Beam (Sàn bóng loáng phản chiếu ánh sáng đèn) */}
            <polygon
              points="350,95 850,95 920,620 280,620"
              fill="url(#floorReflection)"
            />

            {/* C. Singles Sidelines (5.18m) */}
            <line
              x1="245"
              y1="95"
              x2="190"
              y2="620"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeOpacity="0.85"
              filter="url(#bwfLineGlow)"
            />
            <line
              x1="955"
              y1="95"
              x2="1010"
              y2="620"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeOpacity="0.85"
              filter="url(#bwfLineGlow)"
            />

            {/* D. Doubles Long Service Lines */}
            <line
              x1="195"
              y1="135"
              x2="1005"
              y2="135"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeOpacity="0.8"
              filter="url(#bwfLineGlow)"
            />
            <line
              x1="125"
              y1="575"
              x2="1075"
              y2="575"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeOpacity="0.85"
              filter="url(#bwfLineGlow)"
            />

            {/* E. Short Service Lines (1.98m from center net) */}
            <line
              x1="210"
              y1="265"
              x2="990"
              y2="265"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeOpacity="0.9"
              filter="url(#bwfLineGlow)"
            />
            <line
              x1="155"
              y1="455"
              x2="1045"
              y2="455"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeOpacity="0.9"
              filter="url(#bwfLineGlow)"
            />

            {/* F. Center Service Lines */}
            <line
              x1="600"
              y1="95"
              x2="600"
              y2="265"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeOpacity="0.85"
              filter="url(#bwfLineGlow)"
            />
            <line
              x1="600"
              y1="455"
              x2="600"
              y2="620"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeOpacity="0.85"
              filter="url(#bwfLineGlow)"
            />

            {/* ========================================================
                G. 3D BADMINTON NET WITH WOVEN MESH & TENSION POSTS
            ======================================================== */}
            {/* Net Shadow cast onto the green mat */}
            <polygon
              points="170,365 1030,365 1035,378 165,378"
              fill="rgba(1, 15, 9, 0.7)"
            />

            {/* Net Mesh Body */}
            <polygon
              points="170,318 1030,318 1030,362 170,362"
              fill="url(#netWeave)"
              stroke="rgba(51, 65, 85, 0.5)"
              strokeWidth="0.5"
            />

            {/* 75mm White Top Net Tape */}
            <line
              x1="165"
              y1="318"
              x2="1035"
              y2="318"
              stroke="#ffffff"
              strokeWidth="4.5"
              filter="url(#bwfLineGlow)"
            />
            {/* Net Bottom Wire */}
            <line x1="170" y1="362" x2="1030" y2="362" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />

            {/* Left Net Post */}
            <line x1="165" y1="305" x2="165" y2="370" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="165" cy="303" r="3.8" fill="#fbbf24" />

            {/* Right Net Post */}
            <line x1="1035" y1="305" x2="1035" y2="370" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="1035" cy="303" r="3.8" fill="#fbbf24" />

            {/* Hawk-Eye Target Marker (Tâm điểm rơi của cầu) */}
            <g transform="translate(240, 520)" className="animate-pulse">
              <ellipse cx="0" cy="0" rx="35" ry="15" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" fill="rgba(52, 211, 153, 0.08)" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#34d399" strokeWidth="1.5" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#34d399" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>

      {/* ========================================================
          3. DYNAMIC SHUTTLECOCK RALLY & FEATHER SIMULATION CANVAS
      ======================================================== */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* ========================================================
          4. CINEMATIC GRADIENT VIGNETTE & CONTRAST SHIELD
          Keeps hero texts, badges, and search inputs 100% crisp & readable
      ======================================================== */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020a06] via-transparent to-[#020a06]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#010704_92%)] pointer-events-none opacity-65" />
    </div>
  );
}



"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";

export const ALL_SKILLS = [
  "Newbie",      // 0
  "Yếu",         // 1
  "Yếu+",        // 2
  "TBY-",        // 3
  "TBY",         // 4
  "TBY+",        // 5
  "TB-",         // 6
  "TB",          // 7
  "TB+",         // 8
  "Khá-",        // 9
  "Khá",         // 10
  "Khá+",        // 11
  "Pro",         // 12
  "Bán chuyên",  // 13
  "Trình giải",  // 14
] as const;

export const SKILL_PRESETS = [
  {
    label: "🌱 Nhập môn & Vui vẻ",
    rangeLabel: "Newbie → Yếu+",
    minIdx: 0,
    maxIdx: 2,
  },
  {
    label: "🏸 Trung bình yếu",
    rangeLabel: "TBY- → TBY+",
    minIdx: 3,
    maxIdx: 5,
  },
  {
    label: "⚡ Trung bình (TB)",
    rangeLabel: "TB- → TB+",
    minIdx: 6,
    maxIdx: 8,
  },
  {
    label: "🔥 Trung bình khá",
    rangeLabel: "TBY → Khá",
    minIdx: 4,
    maxIdx: 10,
  },
  {
    label: "🏆 Khá & Bán chuyên",
    rangeLabel: "Khá- → Trình giải",
    minIdx: 9,
    maxIdx: 14,
  },
  {
    label: "🌟 Mọi trình độ",
    rangeLabel: "Tự do",
    minIdx: 0,
    maxIdx: 14,
  },
];

// Major landmarks to display label on mobile & desktop
const MAJOR_TICKS = new Set([0, 1, 4, 7, 10, 12, 14]);

export type DualSkillRangeSliderProps = {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  className?: string;
};

// Subtle haptic vibration for supported mobile devices (Android, Chrome, etc.)
function triggerHaptic() {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(8);
    } catch { }
  }
}

export function DualSkillRangeSlider({
  selectedSkills,
  onChange,
  className = "",
}: DualSkillRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Compute current min & max index based on selected skills
  const { minIdx, maxIdx } = useMemo(() => {
    if (!selectedSkills || selectedSkills.length === 0) {
      return { minIdx: 7, maxIdx: 7 }; // default TB
    }
    let min = ALL_SKILLS.length - 1;
    let max = 0;
    for (const s of selectedSkills) {
      const idx = ALL_SKILLS.indexOf(s as any);
      if (idx !== -1) {
        if (idx < min) min = idx;
        if (idx > max) max = idx;
      }
    }
    if (min > max) {
      return { minIdx: 7, maxIdx: 7 };
    }
    return { minIdx: min, maxIdx: max };
  }, [selectedSkills]);

  const totalSteps = ALL_SKILLS.length - 1;

  // Active dragging state
  // "min" = dragging left thumb
  // "max" = dragging right thumb
  // "both" = both thumbs at same point, waiting for drag direction
  const [dragMode, setDragMode] = useState<"min" | "max" | "both" | null>(null);

  // Continuous visual percentage while dragging (for 60fps buttery smooth visual feedback)
  const [liveMinPct, setLiveMinPct] = useState<number | null>(null);
  const [liveMaxPct, setLiveMaxPct] = useState<number | null>(null);

  // Refs to avoid stale closures in window event handlers
  const dragModeRef = useRef<"min" | "max" | "both" | null>(null);
  dragModeRef.current = dragMode;

  const minIdxRef = useRef(minIdx);
  minIdxRef.current = minIdx;
  const maxIdxRef = useRef(maxIdx);
  maxIdxRef.current = maxIdx;

  const startXRef = useRef<number>(0);
  const lastVibratedIdxRef = useRef<{ min: number; max: number }>({
    min: minIdx,
    max: maxIdx,
  });

  const commitRange = useCallback(
    (newMin: number, newMax: number) => {
      const clampedMin = Math.max(0, Math.min(ALL_SKILLS.length - 1, newMin));
      const clampedMax = Math.max(0, Math.min(ALL_SKILLS.length - 1, newMax));
      const start = Math.min(clampedMin, clampedMax);
      const end = Math.max(clampedMin, clampedMax);

      // Check if values actually changed to avoid unnecessary renders
      if (start === minIdxRef.current && end === maxIdxRef.current) {
        return;
      }

      const slice = ALL_SKILLS.slice(start, end + 1);
      onChange([...slice]);
    },
    [onChange],
  );

  // Calculate percentage and index from clientX
  const getPositionFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return { pct: 0, idx: 0 };
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return { pct: 0, idx: 0 };
      const rawPct = ((clientX - rect.left) / rect.width) * 100;
      const clampedPct = Math.max(0, Math.min(100, rawPct));
      const idx = Math.round((clampedPct / 100) * totalSteps);
      return { pct: clampedPct, idx: Math.max(0, Math.min(totalSteps, idx)) };
    },
    [totalSteps],
  );

  // GLOBAL WINDOW POINTER LISTENERS DURING DRAGGING
  // This guarantees silky-smooth dragging even when finger moves fast or off-element
  useEffect(() => {
    if (!dragMode) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragModeRef.current || !trackRef.current) return;

      const { pct, idx } = getPositionFromClientX(e.clientX);
      const currentMinIdx = minIdxRef.current;
      const currentMaxIdx = maxIdxRef.current;
      const currentMinPct = (currentMinIdx / totalSteps) * 100;
      const currentMaxPct = (currentMaxIdx / totalSteps) * 100;

      // When both thumbs are at same point, resolve direction
      if (dragModeRef.current === "both") {
        const deltaX = e.clientX - startXRef.current;
        if (Math.abs(deltaX) >= 3) {
          if (deltaX < 0) {
            dragModeRef.current = "min";
            setDragMode("min");
          } else {
            dragModeRef.current = "max";
            setDragMode("max");
          }
        }
        return;
      }

      if (dragModeRef.current === "min") {
        // Min thumb cannot exceed max
        const boundedPct = Math.min(pct, currentMaxPct);
        setLiveMinPct(boundedPct);

        const newMinIdx = Math.min(idx, currentMaxIdx);
        if (newMinIdx !== lastVibratedIdxRef.current.min) {
          lastVibratedIdxRef.current.min = newMinIdx;
          triggerHaptic();
          commitRange(newMinIdx, currentMaxIdx);
        }
      } else if (dragModeRef.current === "max") {
        // Max thumb cannot go below min
        const boundedPct = Math.max(pct, currentMinPct);
        setLiveMaxPct(boundedPct);

        const newMaxIdx = Math.max(idx, currentMinIdx);
        if (newMaxIdx !== lastVibratedIdxRef.current.max) {
          lastVibratedIdxRef.current.max = newMaxIdx;
          triggerHaptic();
          commitRange(currentMinIdx, newMaxIdx);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Finalize and snap to discrete step
      if (dragModeRef.current) {
        const { idx } = getPositionFromClientX(e.clientX);
        const currentMinIdx = minIdxRef.current;
        const currentMaxIdx = maxIdxRef.current;

        if (dragModeRef.current === "min") {
          const finalMin = Math.min(idx, currentMaxIdx);
          commitRange(finalMin, currentMaxIdx);
        } else if (dragModeRef.current === "max") {
          const finalMax = Math.max(idx, currentMinIdx);
          commitRange(currentMinIdx, finalMax);
        }

        setLiveMinPct(null);
        setLiveMaxPct(null);
        setDragMode(null);
        dragModeRef.current = null;
      }
    };

    const handlePointerCancel = () => {
      setLiveMinPct(null);
      setLiveMaxPct(null);
      setDragMode(null);
      dragModeRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [dragMode, getPositionFromClientX, commitRange, totalSteps]);

  // Handle direct pointer down on the track or thumb
  const startDrag = (thumb: "min" | "max" | "both", clientX: number) => {
    startXRef.current = clientX;
    dragModeRef.current = thumb;
    setDragMode(thumb);
    triggerHaptic();
  };

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const { pct, idx } = getPositionFromClientX(e.clientX);
    const distToMin = Math.abs(idx - minIdx);
    const distToMax = Math.abs(idx - maxIdx);

    if (minIdx === maxIdx) {
      if (idx < minIdx) {
        commitRange(idx, maxIdx);
        setLiveMinPct(pct);
        startDrag("min", e.clientX);
      } else if (idx > maxIdx) {
        commitRange(minIdx, idx);
        setLiveMaxPct(pct);
        startDrag("max", e.clientX);
      } else {
        startDrag("both", e.clientX);
      }
      return;
    }

    if (idx < minIdx) {
      commitRange(idx, maxIdx);
      setLiveMinPct(pct);
      startDrag("min", e.clientX);
    } else if (idx > maxIdx) {
      commitRange(minIdx, idx);
      setLiveMaxPct(pct);
      startDrag("max", e.clientX);
    } else {
      if (distToMin <= distToMax) {
        commitRange(idx, maxIdx);
        setLiveMinPct(pct);
        startDrag("min", e.clientX);
      } else {
        commitRange(minIdx, idx);
        setLiveMaxPct(pct);
        startDrag("max", e.clientX);
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown =
    (thumb: "min" | "max") => (e: React.KeyboardEvent) => {
      if (thumb === "min") {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          commitRange(Math.max(0, minIdx - 1), maxIdx);
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          commitRange(Math.min(maxIdx, minIdx + 1), maxIdx);
        }
      } else {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          commitRange(minIdx, Math.max(minIdx, maxIdx - 1));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          commitRange(minIdx, Math.min(totalSteps, maxIdx + 1));
        }
      }
    };

  // Visual percentages: use live continuous percentage while dragging for 0-latency tracking
  const minPercent = liveMinPct ?? (minIdx / totalSteps) * 100;
  const maxPercent = liveMaxPct ?? (maxIdx / totalSteps) * 100;

  const minSkillName = ALL_SKILLS[minIdx];
  const maxSkillName = ALL_SKILLS[maxIdx];
  const isSingleLevel = minIdx === maxIdx;
  const isDragging = dragMode !== null;

  // Tooltip collision detection
  const tooltipsClose = Math.abs(maxPercent - minPercent) < 14;

  return (
    <div className={`space-y-6 select-none ${className}`}>
      {/* Header Info & Live Skill Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Trình độ <span className="text-rose-500">*</span>
          </span>
        </div>

      </div>

      {/* DUAL SLIDER BOX */}
      <div
        className="relative rounded-3xl border border-slate-200 bg-slate-50/70 p-5 pt-14 touch-none"
        style={{ touchAction: "none" }}
      >
        <div className="relative mx-3 sm:mx-6">
          {/* FLOATING TOOLTIPS */}
          {isSingleLevel ? (
            /* Single merged tooltip when both thumbs meet */
            <div
              className={`absolute -top-13 -translate-x-1/2 z-30 pointer-events-none ${isDragging ? "transition-none" : "transition-all duration-150"
                }`}
              style={{ left: `${minPercent}%` }}
            >
              {/* <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-white whitespace-nowrap">
                  <span>🎯 Chỉ tuyển:</span>
                  <span className="text-emerald-400">{minSkillName}</span>
                </div>
                <div className="h-1.5 w-1.5 rotate-45 bg-slate-900 -mt-1" />
              </div> */}
            </div>
          ) : (
            /* Two separate tooltips */
            <>
              {/* Left (Min) Tooltip */}
              <div
                className={`absolute -top-13 z-30 pointer-events-none ${isDragging ? "transition-none" : "transition-all duration-150"
                  } ${tooltipsClose ? "-translate-x-[75%]" : "-translate-x-1/2"
                  }`}
                style={{ left: `${minPercent}%` }}
              >
                {/* <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 rounded-xl bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-white whitespace-nowrap">
                    <span className="opacity-80 text-[11px] font-normal">Từ:</span>
                    <span>{minSkillName}</span>
                  </div>
                  <div className="h-1.5 w-1.5 rotate-45 bg-emerald-700 -mt-1" />
                </div> */}
              </div>

              {/* Right (Max) Tooltip */}
              <div
                className={`absolute -top-13 z-30 pointer-events-none ${isDragging ? "transition-none" : "transition-all duration-150"
                  } ${tooltipsClose ? "-translate-x-[25%]" : "-translate-x-1/2"
                  }`}
                style={{ left: `${maxPercent}%` }}
              >
                {/* <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 rounded-xl bg-teal-800 px-2.5 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-white whitespace-nowrap">
                    <span className="opacity-80 text-[11px] font-normal">Đến:</span>
                    <span>{maxSkillName}</span>
                  </div>
                  <div className="h-1.5 w-1.5 rotate-45 bg-teal-800 -mt-1" />
                </div> */}
              </div>
            </>
          )}

          {/* SLIDER TRACK CONTAINER */}
          <div
            ref={trackRef}
            onPointerDown={handleTrackPointerDown}
            className="relative h-4 w-full cursor-pointer rounded-full bg-slate-200 shadow-inner flex items-center touch-none"
            style={{ touchAction: "none" }}
          >
            {/* Active Range Highlight Track */}
            <div
              className={`absolute top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-sm ${isDragging ? "transition-none" : "transition-all duration-150"
                }`}
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(2, maxPercent - minPercent)}%`,
              }}
            />

            {/* LEFT THUMB (MIN SKILL) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Trình độ tối thiểu"
              aria-valuenow={minIdx}
              aria-valuemin={0}
              aria-valuemax={maxIdx}
              aria-valuetext={minSkillName}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                startDrag(minIdx === maxIdx ? "both" : "min", e.clientX);
              }}
              onKeyDown={handleKeyDown("min")}
              style={{ left: `${minPercent}%` }}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border-4 border-emerald-600 bg-white shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-emerald-200 flex items-center justify-center touch-none select-none before:absolute before:-inset-3 before:content-[''] ${isDragging ? "transition-none" : "transition-all duration-150"
                } ${dragMode === "min" || dragMode === "both"
                  ? "ring-4 ring-emerald-300 scale-125 z-30 shadow-xl"
                  : "hover:scale-110 active:scale-125"
                }`}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
            </div>

            {/* RIGHT THUMB (MAX SKILL) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Trình độ tối đa"
              aria-valuenow={maxIdx}
              aria-valuemin={minIdx}
              aria-valuemax={totalSteps}
              aria-valuetext={maxSkillName}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                startDrag(minIdx === maxIdx ? "both" : "max", e.clientX);
              }}
              onKeyDown={handleKeyDown("max")}
              style={{ left: `${maxPercent}%` }}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border-4 border-teal-700 bg-white shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-teal-200 flex items-center justify-center touch-none select-none before:absolute before:-inset-3 before:content-[''] ${isDragging ? "transition-none" : "transition-all duration-150"
                } ${dragMode === "max" || dragMode === "both"
                  ? "ring-4 ring-teal-300 scale-125 z-30 shadow-xl"
                  : "hover:scale-110 active:scale-125"
                }`}
            >
              <div className="h-2 w-2 rounded-full bg-teal-700" />
            </div>
          </div>

          {/* TICK MARKS & LABELS */}
          <div className="relative mt-4 h-12 w-full touch-none select-none">
            {ALL_SKILLS.map((skill, index) => {
              const tickPercent = (index / totalSteps) * 100;
              const isMajor = MAJOR_TICKS.has(index);
              const isInRange = index >= minIdx && index <= maxIdx;
              const isEndpoint = index === minIdx || index === maxIdx;

              return (
                <div
                  key={skill}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const distToMin = Math.abs(index - minIdx);
                    const distToMax = Math.abs(index - maxIdx);
                    if (minIdx === maxIdx) {
                      if (index < minIdx) {
                        commitRange(index, maxIdx);
                        startDrag("min", e.clientX);
                      } else if (index > maxIdx) {
                        commitRange(minIdx, index);
                        startDrag("max", e.clientX);
                      }
                      return;
                    }
                    if (index < minIdx) {
                      commitRange(index, maxIdx);
                      startDrag("min", e.clientX);
                    } else if (index > maxIdx) {
                      commitRange(minIdx, index);
                      startDrag("max", e.clientX);
                    } else if (distToMin <= distToMax) {
                      commitRange(index, maxIdx);
                      startDrag("min", e.clientX);
                    } else {
                      commitRange(minIdx, index);
                      startDrag("max", e.clientX);
                    }
                  }}
                  className="group absolute -translate-x-1/2 cursor-pointer flex flex-col items-center py-1 px-1 touch-none"
                  style={{ left: `${tickPercent}%` }}
                >
                  {/* Tick Line or Dot */}
                  <div
                    className={`transition-all ${isEndpoint
                      ? "h-3.5 w-1 rounded-full bg-emerald-700 shadow-sm"
                      : isInRange
                        ? "h-2.5 w-1 rounded-full bg-emerald-500"
                        : isMajor
                          ? "h-2.5 w-0.5 bg-slate-400 group-hover:bg-slate-600"
                          : "h-1 w-1 rounded-full bg-slate-300 group-hover:bg-slate-500"
                      }`}
                  />

                  {/* Tick Label */}
                  {isMajor ? (
                    <span
                      className={`mt-1 text-[11px] transition whitespace-nowrap ${isEndpoint
                        ? "font-bold text-emerald-950 scale-105"
                        : isInRange
                          ? "font-semibold text-emerald-700"
                          : "font-medium text-slate-500 group-hover:text-slate-900"
                        }`}
                    >
                      {skill}
                    </span>
                  ) : (
                    /* Subtle preview on hover */
                    <span className="hidden sm:inline text-[9px] text-slate-400 font-normal mt-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {skill}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Range Summary Bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Đã chọn:
            </span>
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
              {minSkillName}
            </span>
            {!isSingleLevel && (
              <>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                <span className="rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-900">
                  {maxSkillName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

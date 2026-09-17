"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { VenueMap } from "./VenueMap";

const DynamicVenueMap = dynamic(
  () => import("./VenueMap").then((mod) => mod.VenueMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50/80 p-6 text-center animate-pulse">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
          <span className="text-2xl animate-bounce">🏸</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">
          Đang tải bản đồ sân cầu lông...
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Định vị các cụm sân và tọa độ địa lý
        </p>
      </div>
    ),
  },
);

export function MapWrapper(props: ComponentProps<typeof VenueMap>) {
  return <DynamicVenueMap {...props} />;
}

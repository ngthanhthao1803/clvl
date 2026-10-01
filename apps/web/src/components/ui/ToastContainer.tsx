"use client";

import React from "react";
import { useToastStore } from "@/stores/toast-store";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isInfo = toast.type === "info";
        const isWarning = toast.type === "warning";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-3.5 shadow-xl border backdrop-blur-xl transition-all duration-300 animate-slideInRight ${
              isSuccess
                ? "bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-500/10"
                : isInfo
                ? "bg-slate-900/95 text-white border-teal-500/40 shadow-teal-500/10"
                : isWarning
                ? "bg-amber-950/95 text-amber-200 border-amber-500/40"
                : "bg-rose-950/95 text-rose-200 border-rose-500/40"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {isInfo && <Info className="h-4 w-4 text-teal-400" />}
              {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {isError && <XCircle className="h-4 w-4 text-rose-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">{toast.text}</p>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

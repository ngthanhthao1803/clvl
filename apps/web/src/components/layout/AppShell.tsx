"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { BottomNavigation } from "./BottomNavigation";
import { ToastContainer } from "@/components/ui/ToastContainer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-7xl px-3 pb-24 pt-3 sm:px-6 sm:pt-6 lg:px-8 text-slate-900">
        {children}
      </main>
      <BottomNavigation />
      <ToastContainer />
    </>
  );
}

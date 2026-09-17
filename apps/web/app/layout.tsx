import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export const metadata: Metadata = {
  title: "CLVL - Nền tảng cầu lông",
  description:
    "Ghép trận cầu lông, cộng đồng chơi, sân bãi, chat và uy tín dành cho người Việt.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppProviders>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 pb-24 pt-6 text-slate-900 sm:px-6 lg:px-8">
            {children}
          </main>
          <BottomNavigation />
        </AppProviders>
      </body>
    </html>
  );
}

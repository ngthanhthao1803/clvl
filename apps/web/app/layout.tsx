import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CLVL - Nền tảng cầu lông",
  description:
    "Ghép trận cầu lông, cộng đồng chơi, sân bãi, chat và uy tín dành cho người Việt.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

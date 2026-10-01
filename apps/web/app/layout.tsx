import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { AppShell } from "@/components/layout/AppShell";

const siteUrl = "https://danhcaulong.com";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Đánh Cầu Lông - Nền tảng tìm kèo & ghép sân cầu lông toàn quốc | danhcaulong.com",
    template: "%s | Đánh Cầu Lông (danhcaulong.com)",
  },
  description:
    "Đánh Cầu Lông (danhcaulong.com / CLVL) - Nền tảng kết nối lông thủ, tìm kèo cầu lông gần bạn, ghép nhóm giao lưu, bản đồ sân và đặt cọc giữ chỗ uy tín trên khắp Việt Nam.",
  keywords: [
    "đánh cầu lông",
    "danh cau long",
    "danhcaulong",
    "danhcaulong.com",
    "tìm kèo cầu lông",
    "ghép sân cầu lông",
    "giao lưu cầu lông",
    "sân cầu lông",
    "bản đồ sân cầu lông",
    "cầu lông phong trào",
    "clvl",
  ],
  authors: [{ name: "CLVL - Đánh Cầu Lông", url: siteUrl }],
  creator: "CLVL - Đánh Cầu Lông",
  publisher: "CLVL - danhcaulong.com",
  applicationName: "Đánh Cầu Lông",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Đánh Cầu Lông - Nền tảng ghép trận & tìm sân cầu lông toàn quốc",
    description:
      "Kết nối lông thủ, tìm kèo cầu lông gần bạn, ghép nhóm giao lưu, bản đồ sân và đặt cọc giữ chỗ uy tín tại danhcaulong.com.",
    url: siteUrl,
    siteName: "Đánh Cầu Lông - danhcaulong.com",
    images: [
      {
        url: "/images/covers/cover-1.jpg",
        width: 1200,
        height: 630,
        alt: "Đánh Cầu Lông - danhcaulong.com",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đánh Cầu Lông - Nền tảng ghép trận & tìm sân cầu lông toàn quốc",
    description:
      "Kết nối lông thủ, tìm kèo cầu lông, ghép nhóm giao lưu và đặt sân uy tín khắp Việt Nam.",
    images: ["/images/covers/cover-1.jpg"],
  },
  verification: {
    google: "AdkiqQPY_Vsgm3FAUIvFZpAwN3v2ZhepDsTH8CW60go",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Đánh Cầu Lông",
  alternateName: ["danhcaulong", "danhcaulong.com", "CLVL", "Danh Cau Long"],
  url: siteUrl,
  description:
    "Nền tảng kết nối lông thủ, tìm kèo cầu lông, ghép nhóm giao lưu, bản đồ sân và giữ chỗ uy tín toàn quốc.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/explore?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Đánh Cầu Lông - CLVL",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  sameAs: ["https://danhcaulong.com"],
  sport: "Badminton",
  description:
    "Cộng đồng và nền tảng ghép kèo cầu lông phong trào uy tín số 1 Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="AdkiqQPY_Vsgm3FAUIvFZpAwN3v2ZhepDsTH8CW60go"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

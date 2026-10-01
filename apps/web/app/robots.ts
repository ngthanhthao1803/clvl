import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/chat/", "/settings"],
      },
    ],
    sitemap: "https://danhcaulong.com/sitemap.xml",
    host: "https://danhcaulong.com",
  };
}

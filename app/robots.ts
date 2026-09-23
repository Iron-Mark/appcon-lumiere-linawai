import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/read",
        "/content",
        "/settings",
        "/account",
        "/onboarding",
        "/todo",
        "/home",
      ],
    },
    sitemap: "https://appcon-lumiere-linawai.vercel.app/sitemap.xml",
  };
}

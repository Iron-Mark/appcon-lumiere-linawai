import type { MetadataRoute } from "next";

const base = "https://appcon-lumiere-linawai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/legal`, changeFrequency: "monthly", priority: 0.3 },
  ];
}

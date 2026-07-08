import type { MetadataRoute } from "next";

const STATIC_ROUTES = [
  "/",
  "/how-it-works",
  "/features",
  "/about",
  "/meet-the-preacher",
  "/premium",
  "/playbook",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thepitpreacher.com";

  return STATIC_ROUTES.map((route) => ({ url: `${base}${route}` }));
}

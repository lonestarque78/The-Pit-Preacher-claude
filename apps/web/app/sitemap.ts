import type { MetadataRoute } from "next";

const STATIC_ROUTES = [
  "/",
  "/how-it-works",
  "/features",
  "/about",
  "/meet-the-preacher",
  "/premium",
  "/playbook",
  "/playbook/meat-science",
  "/playbook/fire-behavior",
  "/playbook/holy-trinity",
  "/playbook/pit-types",
  "/playbook/finishing-moves",
  "/playbook/timeline-philosophy",
  "/playbook/troubleshooting",
];

const MEAT_TYPES = [
  "brisket",
  "ribs",
  "pork-shoulder",
  "chicken",
  "turkey",
  "tri-tip",
  "beef-tenderloin",
  "picanha",
];

const PIT_TYPES = ["offset", "pellet", "kamado", "kettle", "drum", "cabinet", "electric"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thepitpreacher.com";

  return [
    ...STATIC_ROUTES.map((route) => ({ url: `${base}${route}` })),
    ...MEAT_TYPES.map((meat) => ({ url: `${base}/pitmaster/meat/${meat}` })),
    ...PIT_TYPES.map((pit) => ({ url: `${base}/pitmaster/pit/${pit}` })),
  ];
}

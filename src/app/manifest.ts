import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShopSeal PK",
    short_name: "ShopSeal",
    description: "Digital shop sale & warranty records for Pakistan — seal sales, scan QR, find outlets.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf9f5",
    theme_color: "#fdf9f5",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

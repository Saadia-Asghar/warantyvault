import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WarrantyVault PK",
    short_name: "WarrantyVault",
    description: "Digital shop warranties for Pakistan — scan QR, find nearby outlets.",
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

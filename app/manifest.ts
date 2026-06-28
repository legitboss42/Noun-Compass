import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOUN Compass",
    short_name: "NounCompass",
    description: "Independent student guidance for National Open University of Nigeria workflows, fees, results, and support.",
    lang: "en-NG",
    categories: ["education", "reference", "productivity"],
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F8FA",
    theme_color: "#0E7A3E",
    icons: [
      { src: "/images/brand/favicon.png", sizes: "64x64", type: "image/png" },
      { src: "/images/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/images/brand/nouncompass-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

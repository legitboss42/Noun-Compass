import type { Metadata } from "next";
import { site } from "@/data/site";

export function createMetadata(title: string, description: string, path = ""): Metadata {
  const url = `${site.url}${path}`;
  const image = `${site.url}/images/brand/logo-og.png`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_NG",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${title} | ${site.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

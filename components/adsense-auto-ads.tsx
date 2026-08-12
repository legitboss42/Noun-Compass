"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAdSenseConfig, isAdSenseEligiblePath } from "@/lib/adsense";

const config = getAdSenseConfig({
  NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
});

/** Loads Google Auto ads only on an explicit public-editorial route allowlist. */
export function AdSenseAutoAds() {
  const pathname = usePathname();

  useEffect(() => {
    if (!config.enabled || !isAdSenseEligiblePath(pathname)) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-nouncompass-adsense="auto"]');
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.nouncompassAdsense = "auto";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [pathname]);

  return null;
}

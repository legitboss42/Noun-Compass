"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAdSenseConfig, shouldLoadAdSenseForLocation } from "@/lib/adsense";

const config = getAdSenseConfig({
  NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
});

/** Loads Google Auto ads only on an explicit public-editorial route allowlist. */
export function AdSenseAutoAds() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const publisherId = config.enabled ? config.publisherId : "";

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!shouldLoadAdSenseForLocation(config, pathname, searchParams.toString(), hash)) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-nouncompass-adsense="auto"]');
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.nouncompassAdsense = "auto";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [hash, pathname, publisherId, searchParams]);

  return null;
}

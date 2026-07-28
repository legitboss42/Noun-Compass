"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function scrollToTop() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function enforceTop() {
  scrollToTop();
  window.requestAnimationFrame(() => {
    scrollToTop();
    window.requestAnimationFrame(scrollToTop);
  });
}

export function ScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useLayoutEffect(() => {
    enforceTop();
  }, [pathname, query]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    enforceTop();

    const handlePageShow = () => {
      enforceTop();
    };

    const handleLoad = () => {
      enforceTop();
    };

    const handleBeforeUnload = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      scrollToTop();
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!anchor.href) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;

      const currentUrl = `${window.location.pathname}${window.location.search}`;
      const targetUrl = `${url.pathname}${url.search}`;

      if (targetUrl === currentUrl) {
        enforceTop();
        return;
      }

      window.sessionStorage.setItem("nouncompass-force-scroll-top", "1");
    };

    const handlePopState = () => {
      window.sessionStorage.setItem("nouncompass-force-scroll-top", "1");
      enforceTop();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && window.sessionStorage.getItem("nouncompass-force-scroll-top") === "1") {
        window.sessionStorage.removeItem("nouncompass-force-scroll-top");
        enforceTop();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("load", handleLoad);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname, query]);

  return null;
}

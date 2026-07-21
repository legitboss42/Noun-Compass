"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function scrollToTop() {
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
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("load", handleLoad);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("load", handleLoad);
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname, query]);

  return null;
}

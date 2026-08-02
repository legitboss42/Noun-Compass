"use client";

export function SectionScrollButton({ targetId, children, className }: { targetId: string; children: React.ReactNode; className?: string }) {
  function scrollToSection() {
    const target = document.getElementById(targetId);
    if (!target) return;

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - 96;

    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  }

  return <button className={className} type="button" onClick={scrollToSection}>{children}</button>;
}

import type { ReactNode } from "react";

export type HomeIconName =
  | "arrow"
  | "book"
  | "calendar"
  | "chart"
  | "check"
  | "clipboard"
  | "compass"
  | "document"
  | "graduation"
  | "home"
  | "mail"
  | "megaphone"
  | "menu"
  | "receipt"
  | "search"
  | "shield"
  | "tools"
  | "user";

const icons: Record<HomeIconName, ReactNode> = {
  arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 21h22" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="18" rx="2" /><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h4" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></>,
  document: <><path d="M6 2h8l4 4v16H6Z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5Z" /><path d="M6 11.2V16c3.5 2.5 8.5 2.5 12 0v-4.8M22 9v7" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  megaphone: <><path d="m3 11 14-6v14L3 13Z" /><path d="M7 14v5a2 2 0 0 0 2 2h2" /><path d="M19 9a4 4 0 0 1 0 6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  receipt: <><path d="M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2Z" /><path d="M9 9h6M9 13h6" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  shield: <><path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  tools: <><path d="M14.7 6.3a4 4 0 0 0-5-5L7.5 3.5 10 6 7 9 4.5 6.5 2.3 8.7a4 4 0 0 0 5 5L17.6 24l3.4-3.4-9.7-10.3a4 4 0 0 0 3.4-4Z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
};

export function HomeIcon({
  name,
  size = 24,
  className,
}: {
  name: HomeIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {icons[name]}
    </svg>
  );
}

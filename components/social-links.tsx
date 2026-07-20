import { socialLinks } from "@/data/site";

const iconMap = {
  Facebook: (
    <path d="M14.5 5.5h3V1.4c-.5-.1-2-.2-3.6-.2-3.6 0-6.1 2.2-6.1 6.4v3.6H4v4.6h3.8V27h4.7V15.8h3.9l.6-4.6h-4.5V8c0-1.3.4-2.5 2-2.5Z" />
  ),
  Instagram: (
    <>
      <rect x="4.5" y="4.5" width="19" height="19" rx="5.5" ry="5.5" />
      <circle cx="14" cy="14" r="4.8" />
      <circle cx="20" cy="8" r="1.2" />
    </>
  ),
  X: (
    <path d="M5 4.5h4.8l4.5 6 5-6H23l-6.8 8.1 7.3 9.9h-4.8l-4.9-6.6-5.5 6.6H5.3l7.3-8.7z" />
  ),
  Pinterest: (
    <path d="M14 1.7C7.1 1.7 3 6.4 3 11.6c0 3.2 1.2 6.1 3.7 7.1.4.1.6.1.7-.3.1-.3.4-1.3.5-1.6.1-.3.1-.4-.2-.8-.7-.9-1.2-2.2-1.2-3.9 0-5 3.8-9.5 9.8-9.5 5.4 0 8.4 3.3 8.4 7.7 0 5.8-2.6 10.7-6.4 10.7-2.1 0-3.6-1.7-3.1-3.8.6-2.5 1.8-5.2 1.8-7 0-1.6-.9-3-2.7-3-2.1 0-3.9 2.2-3.9 5.2 0 1.9.6 3.1.6 3.1l-2.5 10.6c-.7 2.8-.1 6.2-.1 6.5 0 .2.2.3.4.1.2-.2 2.6-3.3 3.4-6.3.2-.8 1-3.8 1-3.8.5 1 1.9 1.8 3.4 1.8 4.5 0 7.6-4.1 7.6-9.6 0-5.1-4.3-9.8-10.9-9.8Z" />
  ),
} as const;

export function SocialLinks({
  title = "Follow NounCompass",
  intro = "Get updates, short tips, and reminders on NounCompass social pages.",
  className = "",
  compact = false,
}: {
  title?: string;
  intro?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section className={`social-follow ${compact ? "social-follow-compact" : ""} ${className}`.trim()} aria-labelledby="social-follow-title">
      <div className="social-follow-copy">
        <span className="eyebrow">Follow us</span>
        <h2 id="social-follow-title">{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="social-follow-grid">
        {socialLinks.map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={`Open ${item.label} profile`}>
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                {iconMap[item.label as keyof typeof iconMap]}
              </svg>
            </span>
            <span className="social-meta">
              <strong>{item.label}</strong>
              <small>{item.handle}</small>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

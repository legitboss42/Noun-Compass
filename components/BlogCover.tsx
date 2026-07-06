import { BrandLogo } from "@/components/BrandLogo";
import { CoverPattern } from "@/components/CoverPattern";
import { SectionBadge } from "@/components/SectionBadge";
import { coverThemes, resolveCoverTheme, type CoverThemeName } from "@/lib/brand";
import Image from "next/image";

type BlogCoverProps = {
  title: string;
  subtitle: string;
  category: string;
  image?: string;
  imageAlt?: string;
  theme?: CoverThemeName;
  mode?: "feature" | "card" | "hero" | "og";
  priorityImage?: boolean;
};

export function BlogCover({
  title,
  subtitle,
  category,
  image,
  imageAlt,
  theme,
  mode = "feature",
  priorityImage = false,
}: BlogCoverProps) {
  const palette = coverThemes[theme ?? resolveCoverTheme(category, title)];
  const compact = mode === "card";

  if (compact) {
    return (
      <div
        className="blog-cover blog-cover-card blog-cover-card-premium"
        style={{
          ["--cover-accent" as string]: palette.accent,
          ["--cover-accent-soft" as string]: palette.accentSoft,
          ["--cover-navy" as string]: palette.navy,
          ["--cover-gold" as string]: palette.gold,
          ["--cover-ink" as string]: palette.ink,
        }}
      >
        <div className="blog-cover-card-media">
          {image ? (
            <Image
              src={image}
              alt={imageAlt ?? `${title} cover image`}
              fill
              sizes="(max-width: 680px) 100vw, 380px"
              className="blog-cover-card-photo"
              priority={priorityImage}
            />
          ) : (
            <CoverPattern theme={palette} compact />
          )}
        </div>
        <div className="blog-cover-card-overlay" />
        <div className="blog-cover-card-topline">
          <SectionBadge>{palette.label}</SectionBadge>
          <span className="blog-cover-card-mark">NOUN Compass</span>
        </div>
        <div className="blog-cover-card-content">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`blog-cover blog-cover-${mode}`}
      style={{
        ["--cover-accent" as string]: palette.accent,
        ["--cover-accent-soft" as string]: palette.accentSoft,
        ["--cover-navy" as string]: palette.navy,
        ["--cover-gold" as string]: palette.gold,
        ["--cover-ink" as string]: palette.ink,
      }}
    >
      <div className="blog-cover-grid">
        <div className="blog-cover-copy">
          <div className="blog-cover-brand">
            <BrandLogo variant="wordmark" tone="dark" className="blog-cover-brand-logo" />
            <span className="blog-cover-tagline">Independent student resource</span>
          </div>
          <SectionBadge>{palette.label}</SectionBadge>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <CoverPattern theme={palette} image={image} imageAlt={imageAlt ?? `${title} illustration`} compact={compact} />
      </div>
      <div className="blog-cover-footer">
        <div className="blog-cover-ribbon" />
        <div className="blog-cover-gold-dot" />
      </div>
    </div>
  );
}

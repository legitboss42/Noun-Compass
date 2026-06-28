import Image from "next/image";

type BrandLogoProps = {
  variant?: "horizontal" | "stacked" | "icon" | "lockup" | "wordmark";
  tone?: "color" | "light" | "dark" | "mono";
  className?: string;
  priority?: boolean;
};

const logoSources = {
  horizontal: {
    color: "/images/brand/nouncompass-logo.svg",
    light: "/images/brand/nouncompass-logo-light.svg",
    dark: "/images/brand/nouncompass-logo-dark.svg",
    mono: "/images/brand/nouncompass-logo-mono.svg",
  },
  stacked: {
    color: "/images/brand/nouncompass-logo-stacked.svg",
    light: "/images/brand/nouncompass-logo-stacked.svg",
    dark: "/images/brand/nouncompass-logo-stacked.svg",
    mono: "/images/brand/nouncompass-logo-stacked.svg",
  },
  icon: {
    color: "/images/brand/nouncompass-icon.svg",
    light: "/images/brand/nouncompass-icon.svg",
    dark: "/images/brand/nouncompass-icon.svg",
    mono: "/images/brand/nouncompass-icon.svg",
  },
} as const;

const sizes = {
  horizontal: { width: 1040, height: 280 },
  stacked: { width: 640, height: 720 },
  icon: { width: 512, height: 512 },
} as const;

export function BrandLogo({
  variant = "horizontal",
  tone = "color",
  className,
  priority = false,
}: BrandLogoProps) {
  if (variant === "wordmark") {
    return (
      <div className={`brand-wordmark brand-wordmark-${tone} ${className ?? ""}`.trim()}>
        <Image
          src="/images/brand/nouncompass-icon.svg"
          alt=""
          aria-hidden="true"
          width={512}
          height={512}
          priority={priority}
          className="brand-wordmark-mark"
        />
        <span className="brand-wordmark-title">NOUNCOMPASS</span>
      </div>
    );
  }

  if (variant === "lockup") {
    return (
      <div className={`brand-lockup brand-lockup-${tone} ${className ?? ""}`.trim()}>
        <Image
          src="/images/brand/nouncompass-icon.svg"
          alt=""
          aria-hidden="true"
          width={512}
          height={512}
          priority={priority}
          className="brand-lockup-mark"
        />
        <span className="brand-lockup-copy">
          <span className="brand-lockup-title">NOUNCOMPASS</span>
          <span className="brand-lockup-tagline">Independent student guidance for NOUN success</span>
        </span>
      </div>
    );
  }

  const src = logoSources[variant][tone];
  const size = sizes[variant];

  return (
    <Image
      src={src}
      alt="NOUN Compass"
      width={size.width}
      height={size.height}
      priority={priority}
      className={className}
    />
  );
}

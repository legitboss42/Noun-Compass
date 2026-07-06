import Image from "next/image";
import type { CoverTheme } from "@/lib/brand";

type CoverPatternProps = {
  theme: CoverTheme;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  priorityImage?: boolean;
};

function Illustration({ theme, compact }: { theme: CoverTheme; compact: boolean }) {
  const iconScale = compact ? 0.86 : 1;
  const className = `cover-illustration cover-illustration-${theme.illustration}`;
  return (
    <div className={className} style={{ ["--icon-scale" as string]: String(iconScale) }}>
      <div className="device-card" />
      {theme.illustration === "admission" && <><div className="sheet"><span /><span /><span /></div><div className="medal" /></>}
      {theme.illustration === "wallet" && <><div className="wallet" /><div className="coin coin-a" /><div className="coin coin-b" /></>}
      {theme.illustration === "registration" && <><div className="sheet checklist"><span /><span /><span /></div><div className="pencil" /></>}
      {theme.illustration === "results" && <><div className="sheet graph"><span /><span /><span /></div><div className="chart-bar chart-a" /><div className="chart-bar chart-b" /><div className="chart-bar chart-c" /></>}
      {(theme.illustration === "elearn" || theme.illustration === "compass") && <><div className="laptop" /><div className="compass-needle" /></>}
      {theme.illustration === "centre" && <><div className="campus" /><div className="pin" /></>}
      {theme.illustration === "nelfund" && <><div className="wallet fund" /><div className="shield-chip">N</div></>}
      {theme.illustration === "gst" && <><div className="book-stack" /><div className="cap" /></>}
      {theme.illustration === "support" && <><div className="chat-card" /><div className="shield-chip">?</div></>}
      {theme.illustration === "calendar" && <><div className="calendar" /><div className="pin mini" /></>}
      {theme.illustration === "graduation" && <><div className="diploma" /><div className="cap" /></>}
      {theme.illustration === "tool" && <><div className="tool-grid-mark"><span /><span /><span /><span /></div></>}
      {theme.illustration === "news" && <><div className="sheet news-card"><span /><span /><span /></div><div className="signal" /></>}
    </div>
  );
}

export function CoverPattern({ theme, image, imageAlt, compact = false, priorityImage = false }: CoverPatternProps) {
  return (
    <div className="cover-visual">
      <div className="cover-orb cover-orb-a" style={{ background: theme.accentSoft }} />
      <div className="cover-orb cover-orb-b" style={{ background: theme.gold }} />
      <Image
        src="/images/brand/patterns/compass-pattern.svg"
        alt="Decorative compass pattern"
        width={240}
        height={240}
        className="cover-pattern-grid"
      />
      <Image
        src="/images/brand/patterns/paper-texture.svg"
        alt="Decorative paper texture"
        width={320}
        height={320}
        className="cover-paper-texture"
      />
      {image ? (
        <div className="cover-image-shell">
          <Image
            src={image}
            alt={imageAlt ?? "Guide cover illustration"}
            fill
            sizes={compact ? "320px" : "500px"}
            className="cover-image"
            priority={priorityImage}
          />
          <div className="cover-image-tint" />
        </div>
      ) : null}
      <Illustration theme={theme} compact={compact} />
    </div>
  );
}

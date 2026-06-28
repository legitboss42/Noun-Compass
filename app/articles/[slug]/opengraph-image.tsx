import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";
import { coverThemes, resolveCoverTheme } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  const theme = article ? coverThemes[resolveCoverTheme(article.category, article.title)] : coverThemes["student-life"];
  const title = article?.title ?? "NOUN Compass";
  const subtitle = article?.description ?? "Independent student guidance for NOUN success.";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #F8FBF9 0%, #EAF6EE 42%, #EFF3F8 100%)", position: "relative", fontFamily: "sans-serif", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 88% 22%, rgba(14,122,62,.18), transparent 20%), radial-gradient(circle at 72% 82%, rgba(214,162,29,.12), transparent 18%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 82, background: "linear-gradient(90deg, #0E7A3E 0%, #0C6C37 48%, #12243B 100%)" }} />
        <div style={{ flex: 1, padding: "54px 58px", display: "flex" }}>
          <div style={{ width: "58%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 68, height: 68, borderRadius: 22, background: "linear-gradient(145deg, #12243B, #0E7A3E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 800 }}>N</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#12243B", letterSpacing: "-0.04em" }}>NOUNCOMPASS</div>
                <div style={{ fontSize: 15, color: "#0E7A3E", letterSpacing: "0.16em", textTransform: "uppercase" }}>Independent student resource</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", width: 178, padding: "9px 16px", background: "#12243B", color: "#fff", borderRadius: 999, fontSize: 18, fontWeight: 700 }}>{theme.label}</div>
              <div style={{ fontSize: 64, lineHeight: 1.04, color: "#12243B", fontWeight: 800, letterSpacing: "-0.06em" }}>{title}</div>
              <div style={{ fontSize: 24, lineHeight: 1.42, color: "#456079" }}>{subtitle}</div>
            </div>
          </div>
          <div style={{ width: "42%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ width: 348, height: 348, borderRadius: 44, background: "#fff", boxShadow: "0 32px 64px rgba(18,36,59,.12)", border: "1px solid rgba(18,36,59,.08)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: 28, borderRadius: 32, background: theme.accentSoft }} />
              <div style={{ position: "relative", width: 170, height: 170, borderRadius: 999, background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 44, fontWeight: 800 }}>{theme.label.slice(0, 1)}</div>
              <div style={{ position: "absolute", width: 220, height: 28, bottom: 56, borderRadius: 999, background: "#D6A21D" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

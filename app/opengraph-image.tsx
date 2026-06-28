import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #F7F8FA 0%, #ECF6F0 45%, #E8EEF4 100%)", color: "#12243B", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 85% 18%, rgba(14,122,62,.18), transparent 22%), radial-gradient(circle at 74% 78%, rgba(214,162,29,.14), transparent 18%)" }} />
        <div style={{ flex: 1, padding: "54px 62px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 74, height: 74, borderRadius: 24, background: "linear-gradient(145deg, #12243B, #0E7A3E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 800 }}>N</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em" }}>NOUNCOMPASS</div>
              <div style={{ fontSize: 16, color: "#0E7A3E", letterSpacing: "0.18em", textTransform: "uppercase" }}>Independent student guidance</div>
            </div>
          </div>
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", width: 292, background: "#12243B", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 18, fontWeight: 700 }}>Premium NOUN student help</div>
            <div style={{ fontSize: 78, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.06em" }}>Navigate NOUN with clarity, confidence, and verified guidance.</div>
            <div style={{ fontSize: 28, lineHeight: 1.45, color: "#395068" }}>Admissions, fees, registration, results, study centres, eLearn, NELFUND, and student support.</div>
          </div>
          <div style={{ display: "flex", gap: 14, color: "#4C647B", fontSize: 18 }}>
            <span>Education</span>
            <span>|</span>
            <span>Navigation</span>
            <span>|</span>
            <span>Student success</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

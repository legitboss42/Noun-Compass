import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const outputDir = path.join(projectRoot, "public", "images", "brand", "social");

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const browserPath = edgeCandidates.find((candidate) => {
  try {
    return fsSync.existsSync(candidate);
  } catch {
    return false;
  }
});

if (!browserPath) {
  throw new Error("Microsoft Edge executable was not found.");
}

const flyerConfigs = [
  {
    filename: "portal-help-post.png",
    width: 1080,
    height: 1350,
    badge: "Portal Help",
    title: "Locked out of the NOUN portal?",
    subtitle: "Reset access, recover your account, and get back into the right student workflow without guesswork.",
    bullets: [
      "Password reset steps that make sense",
      "Safer next checks before you panic",
      "Clear website help if you get stuck",
    ],
    cta: "Read the portal help guide",
    website: "nouncompass.me",
    accent: "#17804a",
    accentSoft: "#dff3e8",
    glow: "radial-gradient(circle at 15% 18%, rgba(23,128,74,.24), transparent 28%), radial-gradient(circle at 82% 14%, rgba(213,168,39,.18), transparent 26%)",
  },
  {
    filename: "course-materials-post.png",
    width: 1080,
    height: 1350,
    badge: "Course Materials",
    title: "Need NOUN course materials that are easier to find?",
    subtitle: "Use NounCompass to locate the right study resources faster before you waste time on random downloads.",
    bullets: [
      "Find course-material guidance by topic",
      "Reduce confusion around what to read first",
      "Stay on an independent student-help platform",
    ],
    cta: "Explore course materials help",
    website: "nouncompass.me",
    accent: "#145ec9",
    accentSoft: "#e2edff",
    glow: "radial-gradient(circle at 18% 15%, rgba(20,94,201,.22), transparent 28%), radial-gradient(circle at 86% 16%, rgba(23,128,74,.12), transparent 24%)",
  },
  {
    filename: "gst302-study-post.png",
    width: 1000,
    height: 1500,
    badge: "GST Study Help",
    title: "Need a clearer GST302 study summary?",
    subtitle: "Start with a simpler NounCompass breakdown before you jump into revision or exam preparation.",
    bullets: [
      "Student-friendly summary angle",
      "Quick revision direction for busy learners",
      "Useful for saves, shares, and website visits",
    ],
    cta: "Open the GST302 guide",
    website: "nouncompass.me",
    accent: "#0d6f64",
    accentSoft: "#def6f2",
    glow: "radial-gradient(circle at 18% 14%, rgba(13,111,100,.22), transparent 28%), radial-gradient(circle at 84% 14%, rgba(213,168,39,.16), transparent 24%)",
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(config) {
  const bulletItems = config.bullets
    .map(
      (item) => `
        <li>
          <span class="bullet-dot"></span>
          <span>${escapeHtml(item)}</span>
        </li>`,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        :root {
          --bg: #f6f8fb;
          --ink: #152949;
          --muted: #526987;
          --panel: rgba(255,255,255,.92);
          --line: rgba(21,41,73,.08);
          --gold: #d5a827;
          --accent: ${config.accent};
          --accent-soft: ${config.accentSoft};
          --glow: ${config.glow};
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          width: ${config.width}px;
          height: ${config.height}px;
          font-family: "Segoe UI", Arial, sans-serif;
          color: var(--ink);
          background:
            var(--glow),
            linear-gradient(180deg, #f9fbfd 0%, #edf4f9 100%);
        }
        .canvas {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(8px);
          opacity: .8;
        }
        .orb-a {
          width: 420px;
          height: 420px;
          right: -100px;
          top: -60px;
          background: rgba(23,128,74,.12);
        }
        .orb-b {
          width: 360px;
          height: 360px;
          left: -120px;
          bottom: 90px;
          background: rgba(213,168,39,.10);
        }
        .shell {
          position: absolute;
          inset: 40px;
          border-radius: 42px;
          background: var(--panel);
          border: 1px solid rgba(255,255,255,.7);
          box-shadow: 0 30px 80px rgba(17,34,68,.14);
          backdrop-filter: blur(8px);
          overflow: hidden;
        }
        .shell::after {
          content: "";
          position: absolute;
          left: -5%;
          right: -5%;
          bottom: -120px;
          height: 190px;
          background:
            radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,.22) 46%, rgba(255,255,255,.22) 56%, rgba(255,255,255,0) 57%),
            linear-gradient(110deg, rgba(21,41,73,1) 0%, rgba(17,57,113,1) 100%);
          border-top-left-radius: 60% 100%;
          border-top-right-radius: 60% 100%;
        }
        .grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 24px;
          padding: 54px 54px 312px;
          height: 100%;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .brand-mark {
          width: 86px;
          height: 86px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: linear-gradient(180deg, var(--accent), #123b5d);
          color: white;
          font-size: 44px;
          font-weight: 900;
          box-shadow: 0 14px 30px rgba(23,128,74,.18);
        }
        .brand h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: 1px;
          line-height: 1;
          font-weight: 900;
        }
        .brand p {
          margin: 10px 0 0;
          font-size: 16px;
          letter-spacing: 4px;
          color: var(--accent);
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 11px 18px;
          border-radius: 999px;
          background: var(--ink);
          color: white;
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 24px;
        }
        .title {
          margin: 0 0 18px;
          font-size: 70px;
          line-height: .98;
          font-weight: 900;
          letter-spacing: -2px;
        }
        .subtitle {
          margin: 0;
          font-size: 28px;
          line-height: 1.45;
          color: var(--muted);
          max-width: 94%;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 34px 0 0;
          display: grid;
          gap: 16px;
          max-width: 92%;
        }
        li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          font-size: 23px;
          line-height: 1.4;
          color: var(--ink);
          padding: 16px 18px;
          border-radius: 22px;
          background: rgba(255,255,255,.78);
          border: 1px solid var(--line);
          box-shadow: 0 10px 24px rgba(17,34,68,.05);
        }
        .bullet-dot {
          flex: 0 0 12px;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: var(--gold);
          margin-top: 10px;
        }
        .visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .device {
          position: relative;
          width: 100%;
          max-width: 360px;
          aspect-ratio: 10 / 12;
          border-radius: 36px;
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,252,255,.92));
          border: 2px solid rgba(25,53,101,.12);
          box-shadow: 0 24px 48px rgba(21,41,73,.12);
        }
        .device::before {
          content: "";
          position: absolute;
          inset: 34px;
          border-radius: 30px;
          background: linear-gradient(180deg, var(--accent-soft), #f8fbff);
          border: 1px solid rgba(21,41,73,.08);
        }
        .screen {
          position: absolute;
          inset: 82px 62px;
          border-radius: 24px;
          border: 18px solid var(--ink);
          background: white;
        }
        .screen::before,
        .screen::after {
          content: "";
          position: absolute;
          background: var(--gold);
          border-radius: 999px;
        }
        .screen::before {
          width: 110px;
          height: 18px;
          left: 50%;
          transform: translateX(-50%);
          bottom: -52px;
        }
        .screen::after {
          width: 36px;
          height: 36px;
          right: -58px;
          bottom: -72px;
        }
        .rings {
          position: absolute;
          width: 240px;
          height: 240px;
          right: 24px;
          top: -18px;
          border-radius: 999px;
          border: 2px solid rgba(21,41,73,.08);
        }
        .rings::before,
        .rings::after {
          content: "";
          position: absolute;
          inset: 36px;
          border-radius: 999px;
          border: 2px solid rgba(21,41,73,.05);
        }
        .rings::after {
          inset: 78px;
        }
        .crosshair {
          position: absolute;
          top: 118px;
          right: 142px;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(21,41,73,.18);
          box-shadow: -26px 0 0 rgba(21,41,73,.12), 26px 0 0 rgba(21,41,73,.12), 0 -26px 0 rgba(21,41,73,.12), 0 26px 0 rgba(21,41,73,.12);
        }
        .footer {
          position: absolute;
          left: 54px;
          right: 54px;
          bottom: 40px;
          z-index: 2;
          display: grid;
          gap: 14px;
        }
        .cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-radius: 28px;
          padding: 24px 28px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(255,255,255,.8);
          box-shadow: 0 18px 36px rgba(11,24,49,.12);
        }
        .cta-copy strong {
          display: block;
          font-size: 28px;
          line-height: 1.15;
        }
        .cta-copy span {
          display: block;
          margin-top: 10px;
          font-size: 18px;
          color: var(--muted);
        }
        .cta-chip {
          flex: 0 0 auto;
          padding: 16px 22px;
          border-radius: 999px;
          background: var(--accent);
          color: white;
          font-size: 18px;
          font-weight: 800;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: white;
          font-size: 15px;
          line-height: 1.45;
        }
        .meta strong {
          display: block;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,.78);
          margin-bottom: 4px;
        }
        .disclaimer {
          max-width: 460px;
        }
      </style>
    </head>
    <body>
      <div class="canvas">
        <div class="orb orb-a"></div>
        <div class="orb orb-b"></div>
        <div class="shell">
          <div class="grid">
            <section>
              <div class="brand">
                <div class="brand-mark">N</div>
                <div>
                  <h1>NOUNCOMPASS</h1>
                  <p>Independent student guidance</p>
                </div>
              </div>
              <div class="badge">${escapeHtml(config.badge)}</div>
              <h2 class="title">${escapeHtml(config.title)}</h2>
              <p class="subtitle">${escapeHtml(config.subtitle)}</p>
              <ul>${bulletItems}</ul>
            </section>
            <section class="visual">
              <div class="rings"></div>
              <div class="crosshair"></div>
              <div class="device">
                <div class="screen"></div>
              </div>
            </section>
          </div>
          <div class="footer">
            <div class="cta">
              <div class="cta-copy">
                <strong>${escapeHtml(config.cta)}</strong>
                <span>Website and contact details included so students know where to continue safely.</span>
              </div>
              <div class="cta-chip">Visit NounCompass</div>
            </div>
            <div class="meta">
              <div>
                <strong>Website</strong>
                <span>${escapeHtml(config.website)}</span>
              </div>
              <div>
                <strong>Contact</strong>
                <span>support@nouncompass.me</span>
              </div>
              <div class="disclaimer">
                <strong>Notice</strong>
                <span>NounCompass is an independent student-help platform and is not the official NOUN website.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: browserPath,
  headless: true,
});

const page = await browser.newPage();

for (const config of flyerConfigs) {
  await page.setViewportSize({ width: config.width, height: config.height });
  await page.setContent(buildHtml(config), { waitUntil: "load" });
  await page.screenshot({
    path: path.join(outputDir, config.filename),
    type: "png",
  });
}

await browser.close();

console.log(`Generated ${flyerConfigs.length} premium social flyers in ${outputDir}`);

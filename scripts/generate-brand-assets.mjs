import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const brandDir = path.join(root, "public", "images", "brand");
const coversDir = path.join(brandDir, "covers");

const previews = [
  ["admissions", "Admissions", "How To Apply for NOUN Admission"],
  ["school-fees", "School Fees", "How To Pay NOUN School Fees"],
  ["course-registration", "Course Registration", "How To Register NOUN Courses"],
  ["results", "Results", "How To Check NOUN Results"],
  ["tma", "TMA", "How To Submit TMA On NOUN eLearn"],
  ["elearn", "eLearn", "How To Find TMA On NOUN eLearn"],
  ["study-centres", "Study Centres", "Full List Of Verified NOUN Study Centres"],
  ["nelfund", "NELFUND", "Is NOUN Eligible For NELFUND?"],
  ["gst-courses", "GST Courses", "GST302 Summary for NOUN Students"],
  ["support", "Support", "How To Use NOUN Support Or e-Ticketing"],
];

const brandSvg = String.raw;

function findPlaywrightModule() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) throw new Error("LOCALAPPDATA is not available.");
  const runtimesRoot = path.join(localAppData, "OpenAI", "Codex", "runtimes", "cua_node");
  const candidates = fs.existsSync(runtimesRoot)
    ? fs.readdirSync(runtimesRoot).map((entry) => path.join(runtimesRoot, entry, "bin", "node_modules", "playwright", "index.mjs"))
    : [];
  const match = candidates.find((candidate) => fs.existsSync(candidate));
  if (!match) throw new Error("Playwright module was not found in the local Codex runtime.");
  return match;
}

function findChromiumExecutable() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) throw new Error("LOCALAPPDATA is not available.");
  const browsersRoot = path.join(localAppData, "ms-playwright");
  if (!fs.existsSync(browsersRoot)) throw new Error("ms-playwright browser cache was not found.");
  const matches = fs.readdirSync(browsersRoot)
    .filter((entry) => entry.startsWith("chromium-"))
    .map((entry) => path.join(browsersRoot, entry, "chrome-win64", "chrome.exe"))
    .filter((candidate) => fs.existsSync(candidate))
    .sort()
    .reverse();
  if (!matches.length) throw new Error("Chromium executable was not found in ms-playwright.");
  return matches[0];
}

function writeSvg(filePath, title, subtitle, label) {
  const svg = brandSvg`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
  <rect width="1600" height="900" rx="48" fill="#F7F8FA"/>
  <rect width="1600" height="900" rx="48" fill="url(#wash)"/>
  <path d="M0 760C140 720 280 662 458 662c210 0 302 98 512 98 194 0 294-96 470-96 62 0 115 8 160 18v218H0V760Z" fill="#0E7A3E"/>
  <path d="M0 800c152-34 264-72 424-72 182 0 290 74 452 74 172 0 260-64 434-64 117 0 209 24 290 46v116H0V800Z" fill="#12243B"/>
  <circle cx="1302" cy="168" r="160" fill="#0E7A3E" fill-opacity=".12"/>
  <circle cx="1200" cy="312" r="94" fill="#D6A21D" fill-opacity=".14"/>
  <g opacity=".14" stroke="#0E7A3E" stroke-width="4">
    <circle cx="1212" cy="202" r="88"/>
    <path d="M1212 98v28M1212 278v28M1108 202h28M1288 202h28"/>
  </g>
  <rect x="74" y="70" width="1452" height="748" rx="34" fill="#FFFFFF" fill-opacity=".75" stroke="#D7E1EB"/>
  <rect x="102" y="98" width="116" height="116" rx="30" fill="url(#badge)"/>
  <text x="160" y="174" text-anchor="middle" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-size="52" font-weight="800">N</text>
  <text x="246" y="146" fill="#12243B" font-family="Poppins, Arial, sans-serif" font-size="52" font-weight="800">NOUNCOMPASS</text>
  <text x="246" y="188" fill="#0E7A3E" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="4">INDEPENDENT STUDENT GUIDANCE</text>
  <rect x="120" y="248" width="186" height="44" rx="22" fill="#12243B"/>
  <text x="213" y="276" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">${label}</text>
  <text x="118" y="384" fill="#12243B" font-family="Poppins, Arial, sans-serif" font-size="84" font-weight="800">${title}</text>
  <text x="118" y="446" fill="#567089" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">${subtitle}</text>
  <rect x="1010" y="234" width="408" height="332" rx="34" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
  <rect x="1052" y="276" width="324" height="214" rx="26" fill="#EAF6EE"/>
  <circle cx="1314" cy="520" r="20" fill="#D6A21D"/>
  <rect x="1112" y="334" width="204" height="126" rx="26" fill="#12243B"/>
  <rect x="1130" y="352" width="168" height="92" rx="20" fill="#FFFFFF"/>
  <rect x="1162" y="474" width="104" height="18" rx="9" fill="#D6A21D"/>
  <text x="160" y="684" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700">Premium branded cover preview</text>
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset=".55" stop-color="#EEF6F1"/>
      <stop offset="1" stop-color="#EFF3F8"/>
    </linearGradient>
    <linearGradient id="badge" x1="102" y1="98" x2="218" y2="214" gradientUnits="userSpaceOnUse">
      <stop stop-color="#12243B"/>
      <stop offset="1" stop-color="#0E7A3E"/>
    </linearGradient>
  </defs>
</svg>`;
  fs.writeFileSync(filePath, svg);
}

writeSvg(path.join(brandDir, "logo-og.svg"), "NOUN Compass", "Premium student guidance for NOUN success", "Brand");
writeSvg(path.join(coversDir, "base-template.svg"), "Reusable Blog Cover Template", "Shared structure for article covers, social cards, and previews", "Template");

for (const [slug, label, title] of previews) {
  writeSvg(path.join(coversDir, `${slug}-preview.svg`), title, "Premium branded system preview", label);
}

const jobs = [
  ["nouncompass-icon.svg", "nouncompass-icon-512.png", "512", "512"],
  ["nouncompass-icon.svg", "nouncompass-icon-192.png", "192", "192"],
  ["nouncompass-icon.svg", "favicon.png", "64", "64"],
  ["nouncompass-icon.svg", "apple-touch-icon.png", "180", "180"],
  ["nouncompass-logo.svg", "nouncompass-logo.png", "1040", "280"],
  ["nouncompass-logo-dark.svg", "nouncompass-logo-dark.png", "1040", "280"],
  ["nouncompass-logo-light.svg", "nouncompass-logo-light.png", "1040", "280"],
  ["nouncompass-logo-mono.svg", "nouncompass-logo-mono.png", "1040", "280"],
  ["logo-og.svg", "logo-og.png", "1200", "630"],
  [path.join("covers", "base-template.svg"), path.join("covers", "base-template.png"), "1200", "630"],
];

const playwrightModulePath = findPlaywrightModule();
const chromiumExecutablePath = findChromiumExecutable();
const { chromium } = await import(pathToFileURL(playwrightModulePath).href);
const browser = await chromium.launch({ executablePath: chromiumExecutablePath });
const page = await browser.newPage();

async function renderSvgToPng(inputPath, outputPath, width, height) {
  await page.setViewportSize({ width: Number(width), height: Number(height) });
  const svgMarkup = fs.readFileSync(inputPath, "utf8");
  await page.setContent(`<html><body style="margin:0;background:transparent;width:${width}px;height:${height}px;overflow:hidden;">${svgMarkup}</body></html>`);
  await page.locator("svg").first().evaluate((node, dimensions) => {
    node.setAttribute("width", String(dimensions.width));
    node.setAttribute("height", String(dimensions.height));
    node.setAttribute("viewBox", node.getAttribute("viewBox") ?? `0 0 ${dimensions.width} ${dimensions.height}`);
    node.setAttribute("preserveAspectRatio", "none");
    node.style.display = "block";
    node.style.width = `${dimensions.width}px`;
    node.style.height = `${dimensions.height}px`;
  }, { width: Number(width), height: Number(height) });
  await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: Number(width), height: Number(height) } });
}

for (const [input, output, width, height] of jobs) {
  await renderSvgToPng(path.join(brandDir, input), path.join(brandDir, output), width, height);
}

for (const [slug] of previews) {
  await renderSvgToPng(path.join(coversDir, `${slug}-preview.svg`), path.join(coversDir, `${slug}-preview.png`), "1200", "630");
}

await browser.close();

execFileSync("ffmpeg", ["-y", "-i", path.join(brandDir, "nouncompass-icon-512.png"), path.join(brandDir, "nouncompass-icon.webp")], { stdio: "ignore" });
execFileSync("ffmpeg", ["-y", "-i", path.join(brandDir, "logo-og.png"), path.join(brandDir, "logo-og.webp")], { stdio: "ignore" });
execFileSync("ffmpeg", ["-y", "-i", path.join(brandDir, "favicon.png"), path.join(root, "app", "favicon.ico")], { stdio: "ignore" });

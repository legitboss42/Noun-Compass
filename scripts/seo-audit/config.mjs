import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";

loadDotenv({ path: ".env.local", override: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

export const REPORTS_DIR = path.join(repoRoot, "reports");
export const TEMP_DIR = path.join(repoRoot, ".codex-temp");
export const DEFAULT_TARGET = "https://nouncompass.me";
export const DEFAULT_GSC_SITE_URL = process.env.GSC_SITE_URL || "https://nouncompass.me/";
export const TARGET_URL = process.argv[2] || DEFAULT_TARGET;
export const CRAWL_LIMIT = 30;
export const PSI_CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
export const LIGHTHOUSE_CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

export const env = {
  pagespeedApiKey: process.env.PAGESPEED_API_KEY || "",
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL || "",
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY || "",
  gscSiteUrl: DEFAULT_GSC_SITE_URL,
};

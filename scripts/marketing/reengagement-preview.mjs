/**
 * Preview and test-send the re-engagement email.
 *
 *   node scripts/marketing/reengagement-preview.mjs
 *       Writes the rendered email to tmp/reengagement-preview.html. Sends nothing.
 *
 *   node scripts/marketing/reengagement-preview.mjs --send you@example.com
 *       Sends one real email to that address through Brevo SMTP.
 *
 * The --send path is deliberately a single explicit address typed by a human.
 * There is no "send to everyone" flag here: the batch send is the cron job, and
 * turning that on is a separate, deliberate act.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const sendIndex = args.indexOf("--send");
const recipient = sendIndex >= 0 ? args[sendIndex + 1] : "";

if (sendIndex >= 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient ?? "")) {
  console.error("Pass one address: --send you@example.com");
  process.exit(1);
}

await import("dotenv/config").catch(() => {});

const { buildReengagementEmail } = await import("../../lib/platform/reengagement-email-core.ts");

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nouncompass.me").replace(/\/+$/, "");
const sampleName = process.env.PREVIEW_NAME || "Victor";

if (sendIndex < 0) {
  const { subject, html, text } = buildReengagementEmail({
    displayName: sampleName,
    siteUrl,
    ctaUrl: `${siteUrl}/dashboard/ai-practice`,
    unsubscribeUrl: `${siteUrl}/unsubscribe?email=student%40example.com&scope=reengagement&token=PREVIEW`,
  });

  const outDir = path.join(process.cwd(), "tmp");
  await mkdir(outDir, { recursive: true });
  const htmlPath = path.join(outDir, "reengagement-preview.html");
  await writeFile(htmlPath, html, "utf8");
  await writeFile(path.join(outDir, "reengagement-preview.txt"), `Subject: ${subject}\n\n${text}`, "utf8");

  console.log(`Subject: ${subject}`);
  console.log(`HTML:    ${htmlPath}`);
  console.log(`Text:    ${path.join(outDir, "reengagement-preview.txt")}`);
  console.log("\nNothing was sent. Re-run with --send <address> to test-send one.");
  process.exit(0);
}

const { sendReengagementEmail } = await import("../../lib/contact-mail.ts");

console.log(`Sending one test email to ${recipient} ...`);
await sendReengagementEmail({ to: recipient, displayName: sampleName });
console.log("Sent. Check the inbox, and check that the unsubscribe link resolves.");

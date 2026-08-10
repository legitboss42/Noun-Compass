/**
 * Shared shell for NounCompass emails.
 *
 * Email clients drop <style> blocks, flexbox, and grid, so everything here is
 * tables and inline styles. The palette is the real sitewide one from
 * app/sitewide.css rather than an approximation, so the email and the page it
 * links to are recognisably the same product.
 *
 * Deliberately dark: the confirmation mail a student got at signup is the only
 * NounCompass email most of them have ever seen, and matching it is what makes
 * this one recognisable in a crowded inbox.
 */

const INK = "#0b1d32";
const SHELL = "#07131f";
const CARD = "#0d1f30";
const GREEN = "#079447";
const GREEN_DEEP = "#003f2d";
const YELLOW = "#d7ad36";
const BODY_TEXT = "#c6d3dd";
const MUTED_TEXT = "#8fa3b3";
const HAIRLINE = "#1b3348";

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export type BrandedEmailInput = {
  /** Inbox preview line. Hidden in the body, shown next to the subject. */
  preheader: string;
  eyebrow: string;
  heading: string;
  /** Highlighted in amber inside the heading. Must appear in `heading`. */
  headingHighlight?: string;
  /** Plain paragraphs. Escaped here, so pass text and not markup. */
  paragraphs: string[];
  cta: { label: string; url: string };
  /** Boxed callout under the button. */
  note?: string;
  unsubscribeUrl?: string;
  siteUrl: string;
};

export function renderBrandedEmail(input: BrandedEmailInput): { html: string; text: string } {
  const site = input.siteUrl.replace(/\/+$/, "");
  const heading = renderHeading(input.heading, input.headingHighlight);
  const paragraphs = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${BODY_TEXT};">${escapeEmailHtml(paragraph)}</p>`,
    )
    .join("");

  const note = input.note
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
         <tr>
           <td style="padding:14px 18px;background:#0a1a29;border-left:3px solid ${YELLOW};border-radius:4px;font-size:14px;line-height:1.6;color:${MUTED_TEXT};">
             ${escapeEmailHtml(input.note)}
           </td>
         </tr>
       </table>`
    : "";

  const unsubscribe = input.unsubscribeUrl
    ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:${MUTED_TEXT};">
         <a href="${escapeEmailHtml(input.unsubscribeUrl)}" style="color:${MUTED_TEXT};text-decoration:underline;">Stop these emails</a>
       </p>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${escapeEmailHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${SHELL};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeEmailHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SHELL};padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${CARD};border-radius:14px;overflow:hidden;">
        <tr><td style="height:4px;background:${GREEN};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:30px 32px 0;">
            <a href="${escapeEmailHtml(site)}" style="font-size:17px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">NounCompass</a>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 32px 0;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${GREEN};">${escapeEmailHtml(input.eyebrow)}</p>
            <h1 style="margin:0 0 18px;font-size:25px;line-height:1.28;font-weight:700;color:#ffffff;">${heading}</h1>
            ${paragraphs}
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:${GREEN};border-radius:8px;">
                  <a href="${escapeEmailHtml(input.cta.url)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeEmailHtml(input.cta.label)}</a>
                </td>
              </tr>
            </table>
            ${note}
          </td>
        </tr>
        <tr>
          <td style="padding:30px 32px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="height:1px;background:${HAIRLINE};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:${MUTED_TEXT};">
              NounCompass is an independent student-help platform and is not the official NOUN website.
            </p>
            <p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:${MUTED_TEXT};">
              <a href="${escapeEmailHtml(site)}/privacy-policy" style="color:${MUTED_TEXT};text-decoration:underline;">Privacy policy</a>
              &nbsp;&middot;&nbsp;
              <a href="${escapeEmailHtml(site)}/contact" style="color:${MUTED_TEXT};text-decoration:underline;">Contact us</a>
            </p>
            ${unsubscribe}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    input.preheader,
    "",
    input.heading,
    "",
    ...input.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    `${input.cta.label}: ${input.cta.url}`,
    ...(input.note ? ["", input.note] : []),
    "",
    "NounCompass is an independent student-help platform and is not the official NOUN website.",
    ...(input.unsubscribeUrl ? ["", `Stop these emails: ${input.unsubscribeUrl}`] : []),
  ].join("\n");

  return { html, text };
}

/**
 * Amber highlight inside the headline. Falls back to a plain heading when the
 * phrase is absent, so a copy edit can never produce broken markup.
 */
function renderHeading(heading: string, highlight?: string) {
  if (!highlight || !heading.includes(highlight)) return escapeEmailHtml(heading);
  const [before, ...rest] = heading.split(highlight);
  const after = rest.join(highlight);
  return `${escapeEmailHtml(before)}<span style="color:${YELLOW};">${escapeEmailHtml(highlight)}</span>${escapeEmailHtml(after)}`;
}

export const emailPalette = { INK, SHELL, CARD, GREEN, GREEN_DEEP, YELLOW } as const;

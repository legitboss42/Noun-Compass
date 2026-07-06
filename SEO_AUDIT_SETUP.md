# SEO Audit Setup

This project includes a modular SEO audit system under `scripts/seo-audit/`.

## Free APIs Used

- Google PageSpeed Insights API
- Google Search Console API

## Environment Variables

Put live secrets in `.env.local` only.

```env
PAGESPEED_API_KEY=your_live_pagespeed_api_key
GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GSC_SITE_URL=https://nouncompass.me/
```

`GOOGLE_PRIVATE_KEY` must keep the wrapped quotes and escaped `\n` line breaks if stored on one line.

## Commands

```bash
npm run seo:audit -- https://example.com
npm run seo:audit:nouncompass
npm run seo:audit:webgrowth
```

`seo:audit:webgrowth` is kept as a compatibility alias and currently targets `https://nouncompass.me`.

## Output Files

- `reports/final-seo-audit.md`
- `reports/action-checklist.md`
- `reports/client-summary.md`
- `reports/seo-audit-debug.json`

## What The Audit Checks

- Local crawl
- Metadata quality
- Canonicals
- `robots.txt`
- `sitemap.xml`
- JSON-LD schema
- Lighthouse
- PageSpeed Insights API
- Search Console API
- AdSense readiness signals
- CRO opportunities

## Search Console Notes

- The service account must be added as a user on the exact Search Console property in `GSC_SITE_URL`.
- URL-prefix properties such as `https://nouncompass.me/` are often the safest option when domain properties are not available.
- Search Console does not expose full indexing coverage through this API. The report labels unavailable data clearly instead of guessing.

import { google } from "googleapis";
import { env } from "./config.mjs";
import { decodePrivateKey } from "./utils.mjs";

export async function runSearchConsoleAudit(targetUrl) {
  if (!env.googleClientEmail || !env.googlePrivateKey || !env.gscSiteUrl) {
    return {
      ok: false,
      skipped: true,
      reason: "Missing Search Console service account environment variables",
    };
  }

  try {
    const auth = new google.auth.JWT({
      email: env.googleClientEmail,
      key: decodePrivateKey(env.googlePrivateKey),
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const searchconsole = google.searchconsole({ version: "v1", auth });
    const siteUrl = env.gscSiteUrl;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    const endDate = new Date();
    const formatDate = (value) => value.toISOString().slice(0, 10);

    const [siteList, topPages, topQueries, lowCtrPages] = await Promise.all([
      searchconsole.sites.list(),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ["page"],
          rowLimit: 25,
        },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ["query"],
          rowLimit: 25,
        },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ["page", "query"],
          rowLimit: 50,
        },
      }),
    ]);

    const sites = siteList.data.siteEntry ?? [];
    const rowsToObjects = (rows = [], keys = []) =>
      rows.map((row) => ({
        keys: Object.fromEntries(keys.map((key, index) => [key, row.keys?.[index] ?? ""])),
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      }));

    const pageRows = rowsToObjects(topPages.data.rows, ["page"]);
    const queryRows = rowsToObjects(topQueries.data.rows, ["query"]);
    const lowCtr = rowsToObjects(lowCtrPages.data.rows, ["page", "query"])
      .filter((row) => row.impressions >= 20 && row.ctr < 0.03)
      .slice(0, 15);
    const opportunityPages = pageRows.filter((row) => row.position >= 8 && row.position <= 20).slice(0, 15);

    return {
      ok: true,
      siteUrl,
      accessibleSites: sites,
      indexedPages: pageRows.map((row) => row.keys.page),
      nonIndexedPages: null,
      topPages: pageRows,
      topQueries: queryRows,
      lowCtrOpportunities: lowCtr,
      positionOpportunities: opportunityPages,
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error?.message ?? String(error),
    };
  }
}

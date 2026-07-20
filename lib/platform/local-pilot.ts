import { createHash } from "node:crypto";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

export function localPilotEnabled(env: NodeJS.ProcessEnv = process.env) {
  if (env.LOCAL_PILOT !== "true") return false;
  const origin = env.NEXT_PUBLIC_SITE_URL ?? "";
  const databaseUrl = env.LOCAL_DATABASE_URL ?? "";
  if (env.NODE_ENV === "production") throw new Error("LOCAL_PILOT cannot run in production.");
  if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) throw new Error("LOCAL_PILOT requires a loopback NEXT_PUBLIC_SITE_URL.");
  const host = new URL(databaseUrl.replace(/^postgresql:/, "http:")).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error("LOCAL_DATABASE_URL must use a loopback PostgreSQL host.");
  return true;
}

export function localPilotUser() {
  const email = process.env.LOCAL_PILOT_USER_EMAIL ?? "pilot.student@localhost.invalid";
  const configuredId = process.env.LOCAL_PILOT_USER_ID;
  if (configuredId) return { id: configuredId, email };
  const hex = createHash("sha256").update(`nouncompass-pilot:${email}`).digest("hex").slice(0, 32);
  return { id: `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`, email };
}

export function localDatabase() {
  if (!localPilotEnabled()) throw new Error("Local database access is disabled.");
  client ??= postgres(process.env.LOCAL_DATABASE_URL!, { max: 5, prepare: false, idle_timeout: 20 });
  return client;
}

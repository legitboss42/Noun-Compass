import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { platformConfig } from "./config";

const FLUTTERWAVE_API = "https://api.flutterwave.com/v3";

function secretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Flutterwave is not configured.");

  const environment = process.env.FLUTTERWAVE_ENVIRONMENT ?? "test";
  const isTestKey = key.startsWith("FLWSECK_TEST-");
  if (environment === "test" && !isTestKey) throw new Error("Flutterwave test mode requires a test secret key.");
  if (environment === "live" && isTestKey) throw new Error("Flutterwave live mode requires a live secret key.");
  return key;
}

async function flutterwaveRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${FLUTTERWAVE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as T & { status?: string; message?: string };
  if (!response.ok || payload.status === "error") {
    throw new Error(payload.message || `Flutterwave request failed with ${response.status}.`);
  }
  return payload;
}

export function createPaymentReference() {
  return `nc_${Date.now().toString(36)}_${randomBytes(9).toString("hex")}`;
}

export async function initializeFlutterwaveTransaction(input: {
  email: string;
  reference: string;
  callbackUrl: string;
}) {
  return flutterwaveRequest<{ status: "success"; data: { link: string } }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: platformConfig.semesterPass.amountKobo / 100,
      currency: platformConfig.semesterPass.currency,
      redirect_url: input.callbackUrl,
      customer: { email: input.email },
      customizations: {
        title: "NounCompass Semester Pass",
        description: "180 days of premium exam-preparation access",
      },
    }),
  });
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  return flutterwaveRequest<{
    status: "success";
    data: {
      id: number | string;
      tx_ref: string;
      status: string;
      amount: number;
      currency: string;
      created_at: string | null;
      customer: { email: string };
    };
  }>(`/transactions/${encodeURIComponent(transactionId)}/verify`);
}

function safeEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function verifyFlutterwaveSignature(rawBody: string, signature: string | null, legacySignature: string | null = null) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  if (signature && safeEqual(signature, expected)) return true;
  return Boolean(legacySignature && safeEqual(legacySignature, secret));
}

export function payloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex");
}

export function assertSemesterPassTransaction(data: { status: string; amount: number; currency: string; created_at: string | null }) {
  if (data.status !== "successful") throw new Error("Payment is not successful.");
  if (Math.round(data.amount * 100) !== platformConfig.semesterPass.amountKobo) throw new Error("Payment amount does not match the plan.");
  if (data.currency !== platformConfig.semesterPass.currency) throw new Error("Payment currency does not match the plan.");
  if (!data.created_at || Number.isNaN(Date.parse(data.created_at))) throw new Error("Payment confirmation has no valid transaction timestamp.");
  return data.created_at;
}

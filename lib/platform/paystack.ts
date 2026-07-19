import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { platformConfig } from "./config";

const PAYSTACK_API = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured.");
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as T & { status?: boolean; message?: string };
  if (!response.ok || payload.status === false) {
    throw new Error(payload.message || `Paystack request failed with ${response.status}.`);
  }
  return payload;
}

export function createPaymentReference() {
  return `nc_${Date.now().toString(36)}_${randomBytes(9).toString("hex")}`;
}

export async function initializePaystackTransaction(input: {
  email: string;
  reference: string;
  callbackUrl: string;
}) {
  return paystackRequest<{
    status: true;
    data: { authorization_url: string; access_code: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: platformConfig.semesterPass.amountKobo,
      currency: platformConfig.semesterPass.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<{
    status: true;
    data: {
      reference: string;
      status: string;
      amount: number;
      currency: string;
      paid_at: string | null;
      customer: { email: string };
    };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  return supplied.length === calculated.length && timingSafeEqual(supplied, calculated);
}

export function payloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex");
}

export function assertSemesterPassTransaction(data: {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paid_at: string | null;
}) {
  if (data.status !== "success") throw new Error("Payment is not successful.");
  if (data.amount !== platformConfig.semesterPass.amountKobo) throw new Error("Payment amount does not match the plan.");
  if (data.currency !== platformConfig.semesterPass.currency) throw new Error("Payment currency does not match the plan.");
  if (!data.paid_at) throw new Error("Payment confirmation has no paid timestamp.");
  return data.paid_at;
}

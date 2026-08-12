import { NextResponse } from "next/server";
import { AUTH_EVENT_COOKIE, authEventSecret, verifyEmailVerifiedMarker } from "@/lib/platform/auth-event-marker";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${AUTH_EVENT_COOKIE}=([^;]+)`))?.[1];
  const verified = verifyEmailVerifiedMarker(cookie, authEventSecret(process.env));
  const response = NextResponse.json({ event: verified ? "email_verified" : null });
  response.cookies.set(AUTH_EVENT_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
  return response;
}

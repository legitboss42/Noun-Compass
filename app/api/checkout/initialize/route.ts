import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { isCheckoutAvailable } from "@/lib/platform/config";
import { createPaymentReference, initializeFlutterwaveTransaction } from "@/lib/platform/flutterwave";
import { prepareCheckoutPaymentAttempt } from "@/lib/platform/checkout";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!isCheckoutAvailable()) return NextResponse.json({ message: "Checkout is not available yet." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.email) return NextResponse.json({ message: "Sign in with a verified email before checkout." }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Checkout is not configured." }, { status: 503 });
  const reference = createPaymentReference();
  const origin = new URL(request.url).origin;

  try {
    await prepareCheckoutPaymentAttempt(admin, {
      reference,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not prepare checkout." }, { status: 500 });
  }

  try {
    const initialized = await initializeFlutterwaveTransaction({
      email: user.email,
      reference,
      callbackUrl: `${origin}/account/payment/callback`,
    });
    return NextResponse.json({ authorizationUrl: initialized.data.link, reference });
  } catch (error) {
    await admin.from("payment_attempts").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Checkout failed." }, { status: 502 });
  }
}

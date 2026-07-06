import { validateContactPayload, enforceSubmissionLimits, sendContactEmails } from "@/lib/contact-mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name: string;
      email: string;
      subject: string;
      message: string;
      website?: string;
    };

    const validated = validateContactPayload(payload);
    if (validated.honeypotTriggered) {
      return Response.json({ message: "Your message has been received." });
    }

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const identifier = forwardedFor || validated.submission.email;

    enforceSubmissionLimits(identifier, validated.submission);
    await sendContactEmails(validated.submission);

    return Response.json({
      message: "Thanks. Your message has been received and a confirmation email is on its way.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not send your message right now.";
    const status = /Missing email delivery configuration/i.test(message) ? 500 : 400;

    return Response.json({ message }, { status });
  }
}

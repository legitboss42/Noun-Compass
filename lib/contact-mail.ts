import crypto from "node:crypto";
import nodemailer from "nodemailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 160;
const MAX_SUBJECT_LENGTH = 140;
const MAX_MESSAGE_LENGTH = 4000;

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactRuntimeState = {
  rateLimits: Map<string, number[]>;
  duplicates: Map<string, number>;
};

declare global {
  var __nounCompassContactState: ContactRuntimeState | undefined;
}

function getRuntimeState() {
  if (!globalThis.__nounCompassContactState) {
    globalThis.__nounCompassContactState = {
      rateLimits: new Map(),
      duplicates: new Map(),
    };
  }

  return globalThis.__nounCompassContactState;
}

function clean(value: string) {
  return value.replace(/\r?\n/g, " ").trim();
}

function assertSafeHeader(value: string, field: string) {
  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} is invalid.`);
  }
}

export function validateContactPayload(payload: ContactPayload) {
  const name = clean(payload.name);
  const email = clean(payload.email).toLowerCase();
  const subject = clean(payload.subject);
  const message = payload.message.trim();
  const website = payload.website?.trim() ?? "";

  if (website) {
    return { honeypotTriggered: true as const };
  }

  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new Error("Please enter your name.");
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
    throw new Error("Please enter a clear subject.");
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Please enter your message.");
  }

  assertSafeHeader(name, "Name");
  assertSafeHeader(email, "Email");
  assertSafeHeader(subject, "Subject");

  return {
    honeypotTriggered: false as const,
    submission: { name, email, subject, message },
  };
}

export function enforceSubmissionLimits(identifier: string, submission: ContactSubmission) {
  const state = getRuntimeState();
  const now = Date.now();
  const windowMs = Number(process.env.CONTACT_FORM_RATE_LIMIT_WINDOW_MINUTES ?? "15") * 60 * 1000;
  const maxSubmissions = Number(process.env.CONTACT_FORM_RATE_LIMIT_MAX ?? "3");
  const duplicateWindowMs = Number(process.env.CONTACT_FORM_DUPLICATE_WINDOW_MINUTES ?? "10") * 60 * 1000;

  const attempts = (state.rateLimits.get(identifier) ?? []).filter((time) => now - time < windowMs);
  if (attempts.length >= maxSubmissions) {
    throw new Error("Too many messages sent recently. Please try again later.");
  }

  attempts.push(now);
  state.rateLimits.set(identifier, attempts);

  for (const [key, timestamp] of state.duplicates.entries()) {
    if (now - timestamp >= duplicateWindowMs) {
      state.duplicates.delete(key);
    }
  }

  const duplicateKey = crypto
    .createHash("sha256")
    .update(`${submission.email}\n${submission.subject}\n${submission.message}`)
    .digest("hex");

  if (state.duplicates.has(duplicateKey)) {
    throw new Error("That message looks like a duplicate. Please wait before sending it again.");
  }

  state.duplicates.set(duplicateKey, now);
}

function createTransporter() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT ?? "587");
  const user = process.env.BREVO_SMTP_LOGIN;
  const pass = process.env.BREVO_SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Missing email delivery configuration.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendContactEmails(submission: ContactSubmission) {
  const transporter = createTransporter();
  const supportAddress = process.env.CONTACT_FORM_TO ?? "support@nouncompass.me";
  const fromAddress = process.env.CONTACT_FORM_FROM ?? "NounCompass Support <support@nouncompass.me>";
  const autoreplyFrom = process.env.CONTACT_FORM_AUTOREPLY_FROM ?? fromAddress;

  const receivedAt = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

  await transporter.sendMail({
    from: fromAddress,
    to: supportAddress,
    replyTo: `${submission.name} <${submission.email}>`,
    subject: `[NounCompass Contact] ${submission.subject}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Received: ${receivedAt}`,
      "",
      submission.message,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #12243b;">
        <h2 style="margin: 0 0 16px;">New NounCompass contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
        <p><strong>Received:</strong> ${escapeHtml(receivedAt)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(submission.subject)}</p>
        <hr style="border: 0; border-top: 1px solid #d6dde6; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${escapeHtml(submission.message)}</p>
      </div>
    `,
  });

  await transporter.sendMail({
    from: autoreplyFrom,
    to: submission.email,
    subject: "We received your message | NounCompass",
    text: [
      `Hello ${submission.name},`,
      "",
      "Thank you for contacting NounCompass.",
      "We have received your message and will respond as soon as possible.",
      "",
      "NounCompass is an independent student-help platform and is not the official NOUN website.",
      "",
      "Regards,",
      "NounCompass Support",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #12243b;">
        <p>Hello ${escapeHtml(submission.name)},</p>
        <p>Thank you for contacting <strong>NounCompass</strong>.</p>
        <p>We have received your message and will respond as soon as possible.</p>
        <p style="padding: 14px 16px; background: #f7f8fa; border-left: 4px solid #0e7a3e;">
          NounCompass is an independent student-help platform and is not the official NOUN website.
        </p>
        <p>Regards,<br />NounCompass Support</p>
      </div>
    `,
  });
}

export async function sendStudyReminderEmail({
  actionUrl,
  startsAt,
  timezone = "Africa/Lagos",
  title,
  to,
}: {
  actionUrl: string;
  startsAt: string;
  timezone?: string | null;
  title: string;
  to: string;
}) {
  const transporter = createTransporter();
  const fromAddress = process.env.CONTACT_FORM_AUTOREPLY_FROM ?? process.env.CONTACT_FORM_FROM ?? "NounCompass Support <support@nouncompass.me>";
  const formattedStart = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || "Africa/Lagos",
  }).format(new Date(startsAt));

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Study reminder: ${title}`,
    text: [
      "Your saved NounCompass study session is coming up.",
      "",
      `Session: ${title}`,
      `Time: ${formattedStart}`,
      "",
      `Open your planner: ${actionUrl}`,
      "",
      "NounCompass Support",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #12243b;">
        <h2 style="margin: 0 0 16px;">Your study session is coming up</h2>
        <p><strong>Session:</strong> ${escapeHtml(title)}</p>
        <p><strong>Time:</strong> ${escapeHtml(formattedStart)}</p>
        <p><a href="${escapeHtml(actionUrl)}">Open your Study Planner</a></p>
      </div>
    `,
  });
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountFormShell, FormMessage } from "@/components/account-form-shell";
import { createMetadata } from "@/lib/metadata";
import { applyUnsubscribe, unsubscribeLinkIsValid } from "@/lib/platform/unsubscribe";
import { isUnsubscribeScope, normalizeUnsubscribeEmail } from "@/lib/platform/unsubscribe-core";

export const metadata = {
  ...createMetadata(
    "Unsubscribe from NounCompass email",
    "Stop NounCompass study updates for your email address.",
    "/unsubscribe",
  ),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Params = { email?: string; scope?: string; token?: string; done?: string; error?: string };

/**
 * Opening the link must not unsubscribe anyone. Corporate mail scanners and
 * link previewers fetch every URL in a message, so acting on GET would silence
 * students who never clicked. The page confirms, and the button POSTs.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const scope = isUnsubscribeScope(params.scope) ? params.scope : "updates";

  if (params.done) {
    return (
      <AccountFormShell
        title="You are unsubscribed"
        intro={scope === "all"
          ? "We have stopped study updates and optional reminders for this address. Account and payment emails still go out, because they are not marketing."
          : "We have stopped NounCompass study updates for this address."}
      >
        <FormMessage notice="Your email settings have been saved." />
        <p>Changed your mind? Send us a message and we will turn updates back on for this address.</p>
        <div className="platform-auth-links">
          <Link href="/">Back to NounCompass</Link>
          <Link href="/contact">Contact the team</Link>
        </div>
      </AccountFormShell>
    );
  }

  let email: string;
  try {
    email = normalizeUnsubscribeEmail(params.email);
  } catch {
    return <InvalidLink />;
  }
  if (!unsubscribeLinkIsValid(email, scope, params.token)) return <InvalidLink />;

  async function confirm() {
    "use server";
    try {
      await applyUnsubscribe(email, scope);
    } catch {
      redirect(`/unsubscribe?error=1&email=${encodeURIComponent(email)}&scope=${scope}&token=${encodeURIComponent(params.token ?? "")}`);
    }
    redirect(`/unsubscribe?done=1&scope=${scope}`);
  }

  return (
    <AccountFormShell
      title="Stop NounCompass emails?"
      intro={`This will stop study updates sent to ${email}.`}
    >
      <FormMessage error={params.error ? "We could not update your email settings. Please try again." : undefined} />
      <form action={confirm} className="platform-form">
        <button className="button" type="submit">Unsubscribe {email}</button>
      </form>
      <p className="platform-privacy-note">
        Emails about your account, your Semester Pass, and payments are not marketing and will still be sent.
      </p>
      <div className="platform-auth-links">
        <Link href="/">Keep receiving updates</Link>
      </div>
    </AccountFormShell>
  );
}

function InvalidLink() {
  return (
    <AccountFormShell
      title="That unsubscribe link is not valid"
      intro="The link may have been broken by your email app, or it may have been changed."
    >
      <p>Forward the email to us and we will remove your address by hand.</p>
      <div className="platform-auth-links">
        <Link href="/contact">Contact the team</Link>
        <Link href="/">Back to NounCompass</Link>
      </div>
    </AccountFormShell>
  );
}

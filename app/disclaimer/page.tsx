import { TrustPage } from "@/components/trust-page";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";
export const metadata = createMetadata(
  "NOUN Compass Independence Disclaimer",
  "Read the NOUN Compass disclaimer covering independence, accuracy limits, payments, account safety, and why official NOUN pages remain the final authority.",
  "/disclaimer",
);
export default function Page() { return <TrustPage title="Disclaimer" eyebrow="Please read" intro="Use NOUN Compass as a practical guide, then confirm the final details on your own NOUN record."><h2>What NOUN Compass is</h2><p><strong>{site.disclaimer}</strong></p><h2>What our content is for</h2><p>Everything here is written to help students understand tasks, compare options, study, and avoid common mistakes. It is not a replacement for official academic, financial, legal, or administrative decisions.</p><h2>Accuracy and course materials</h2><p>We work to keep guides, materials, schedules, and fee explanations useful and current, but NOUN can update them at any time. Verified labels describe NounCompass&apos;s recorded source and review, not an endorsement by NOUN.</p><h2>Practice and results</h2><p>Original practice questions are learning aids. They are not leaked examinations, active TMA answers, or a guarantee that a topic or question will appear in an assessment.</p><h2>Payments and accounts</h2><p>NounCompass may accept payment for its own optional Semester Pass through Flutterwave. It cannot receive NOUN fees, log into NOUN accounts, change official records, or fix account-specific university issues. Keep portal passwords, OTPs, card details, and private records to yourself.</p></TrustPage>; }

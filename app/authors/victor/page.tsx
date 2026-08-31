import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Victorious, Founder and Editor of NOUN Compass",
  "Read about Victorious, the founder and editor responsible for NOUN Compass product direction, publishing standards, and student-help workflows.",
  "/authors/victor",
);

export default function Page() {
  return (
    <main id="main-content" className="trust-page">
      <section className="container section">
        <span className="eyebrow">Founder profile</span>
        <h1>Victorious</h1>
        <p>
          Victorious is the founder and editor of NOUN Compass, responsible for
          the site direction, technical quality, and publishing standards behind
          its student-help guides and tools.
        </p>
        <h2>Editorial role</h2>
        <p>
          The role combines product development, student workflow research, and
          editorial review. Published guides are written to help students
          understand NOUN processes while still checking final decisions,
          deadlines, fees, and account-specific details on official channels.
        </p>
        <h2>Contact and corrections</h2>
        <p>
          For corrections, source updates, or editorial questions, use the{" "}
          <Link href="/contact">contact page</Link> or read the{" "}
          <Link href="/editorial-policy">editorial policy</Link>.
        </p>
      </section>
    </main>
  );
}

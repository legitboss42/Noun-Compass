import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "NOUN Compass Editorial Team",
  "Meet the collective editorial byline behind NOUN Compass guides and see how research, review, source checks, corrections, and ongoing maintenance are handled.",
  "/authors/editorial-team",
);

export default function Page() {
  return (
    <main id="main-content" className="trust-page">
      <section className="container section">
        <span className="eyebrow">Editorial ownership</span>
        <h1>NOUN Compass Editorial Team</h1>
        <p>
          The NOUN Compass Editorial Team is a collective editorial byline used
          for student guides that are researched, edited, reviewed, corrected,
          and maintained through the site&apos;s editorial process. It identifies
          the publishing responsibility behind a guide without implying that one
          named person completed every research, writing, verification, and
          maintenance step alone.
        </p>
        <p>
          This collective byline is distinct from the founder profile. Read
          about <Link href="/authors/victor">Victorious</Link> for the named
          founder and editor responsible for product direction, technical
          quality, and publishing standards. The Editorial Team page describes
          the process and shared editorial responsibility applied to guides that
          carry the team byline.
        </p>

        <h2>What the editorial byline means</h2>
        <p>
          A guide published under the NOUN Compass Editorial Team byline should
          help a student complete or understand a specific task without
          pretending that an independent website can replace the student&apos;s
          official NOUN record. Editors separate general workflow guidance from
          details that can vary by programme, semester, account status, study
          centre, fee schedule, or portal state. Where the final answer belongs
          to an official source, the guide should make that boundary clear.
        </p>

        <h2>How guides move through review</h2>
        <p>
          Editorial work can include checking the intended search question,
          reviewing the current student workflow, comparing the explanation with
          available official NOUN pages, testing internal links, checking that
          screenshots do not expose private student data, and making sure the
          next step is useful. Operational guides also identify an author and a
          reviewer so readers can see who owns the publishing and review roles.
        </p>
        <p>
          Workflow-heavy pages may be reviewed through the
          {" "}<Link href="/reviewers/student-workflow">Student Workflow Review Desk</Link>,
          while fee and student-finance guidance may use the
          {" "}<Link href="/reviewers/student-finance">Student Finance Review Desk</Link>.
          These review labels describe the responsibility being performed; they
          are not a claim that a government office or NOUN department authored
          the page.
        </p>

        <h2>How sources and changing information are handled</h2>
        <p>
          NOUN procedures can change after a guide is published. For that
          reason, the team prefers direct official pages for claims about fees,
          registration, examinations, results, study centres, admissions, and
          other student operations. A guide should not invent a fresh
          &quot;last checked&quot; date simply because a file was edited. Review
          dates are shown only when the underlying source review has actually
          been recorded.
        </p>
        <p>
          When information is account-specific, the current student portal or
          official support record remains the final reference. When an older
          source is the best evidence available, the guide should say what was
          verified, what remains uncertain, and what the student should confirm
          before paying, registering, travelling, or submitting a request.
        </p>

        <h2>Corrections and maintenance</h2>
        <p>
          Publishing is not treated as the end of the job. If a workflow,
          source, link, or explanation becomes inaccurate, the team can update
          the guide and preserve the distinction between a previous editorial
          record and a newly verified fact. Readers can review the
          {" "}<Link href="/editorial-policy">editorial policy</Link> and
          {" "}<Link href="/corrections-policy">corrections policy</Link> to
          see the standards applied to updates.
        </p>
        <p>
          If you find an outdated instruction, a broken source, a misleading
          statement, or a page that needs clarification, use the
          {" "}<Link href="/contact">contact page</Link>. Copyright or source
          concerns can be submitted through the
          {" "}<Link href="/takedown-policy">takedown policy</Link>. The goal
          is simple: keep useful student guidance accurate enough to act on,
          cautious enough not to overclaim, and clear about where official NOUN
          confirmation is still required.
        </p>
      </section>
    </main>
  );
}

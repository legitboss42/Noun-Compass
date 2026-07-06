import Link from "next/link";
import { TrustPage } from "@/components/trust-page";
import { site } from "@/data/site";
import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata(
  "About NOUN Compass and Our Student Guides",
  "Learn why NOUN Compass exists, how we research NOUN student guides, and the standards we use to keep help practical and independent.",
  "/about",
);
export default function Page() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About NOUN Compass",
    url: `${site.url}/about`,
    description: "Learn why NOUN Compass exists and how it helps NOUN students find clearer, simpler help.",
    about: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      description: site.description,
    },
  };
  return <TrustPage title="About NOUN Compass" eyebrow="Independent student support" intro="We explain NOUN processes in plain language so students can waste less time guessing.">
    <h2>Our purpose</h2>
    <p>NOUN Compass is an independent website for current and future NOUN students. We publish clear guides, useful tools, study help, and links that make it easier to find the right official page.</p>
    <h2>How we support learning</h2>
    <p>Our course-material library helps students find study resources faster. We do not claim ownership of official NOUN materials, and students should still confirm that any material is current through official NOUN platforms.</p>
    <h2>Responsible material access</h2>
    <p>We review reports about copyrighted, outdated, inaccurate, broken, or wrongly listed material links. Where a valid concern is confirmed, we may remove a link, update its source, correct its metadata, or add an appropriate warning. Read our <Link href="/copyright-policy">Copyright Policy</Link> and <Link href="/takedown-policy">Takedown Policy</Link>.</p>
    <h2>Our independence</h2>
    <p>NounCompass is not part of NOUN. We do not speak for the university, and we do not replace official advice. Always double-check fees, deadlines, admission details, and course-material information through official NOUN channels.</p>
    <p>Questions or feedback? <Link href="/contact">Contact the editorial team</Link>.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
  </TrustPage>;
}

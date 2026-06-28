import { TrustPage } from "@/components/trust-page";
import { site } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Copyright Policy", "How NOUN Compass handles original content, third-party academic materials, and copyright concerns.", "/copyright-policy");

export default function Page() {
  return <TrustPage title="Copyright Policy" eyebrow="Respecting ownership" intro="This policy explains the ownership of NOUN Compass content and how we respond to copyright concerns.">
    <h2>NOUN Compass original content</h2>
    <p>Unless otherwise stated, the original articles, summaries, page copy, interface design, branding, and tools created for NOUN Compass belong to NOUN Compass. They may be used for personal, non-commercial learning, but substantial reproduction, republication, or commercial use requires permission.</p>
    <h2>Third-party and official academic materials</h2>
    <p>NOUN Compass may provide access pointers or delivery links to third-party or official academic materials for student educational support. We do not claim ownership of official National Open University of Nigeria materials or other third-party works. Their ownership and permitted use remain with their respective rights holders.</p>
    <h2>Educational and resource purpose</h2>
    <p>Material listings are intended to help students identify relevant learning resources and verify them through official platforms. A listing does not transfer ownership, grant additional rights, or represent an official NOUN endorsement of NOUN Compass.</p>
    <h2>Submit a copyright complaint</h2>
    <p>Copyright owners or authorised representatives can email <a href={`mailto:${site.contactEmail}?subject=NOUN%20Compass%20copyright%20complaint`}>{site.contactEmail}</a>. Include the affected NOUN Compass URL, the material or course code involved, a description of the protected work, the reason for the complaint, proof of ownership or authority where relevant, and reliable contact information.</p>
    <h2>Review and removal process</h2>
    <p>We review specific, good-faith reports and may request clarification. When a concern is reasonably verified, we may remove the link, correct the listing, update the source, add a warning, or take another proportionate action. See the <a href="/takedown-policy">Takedown Policy</a> for reporting outdated, inaccurate, broken, or wrongly listed materials.</p>
  </TrustPage>;
}

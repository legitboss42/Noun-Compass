import { TrustPage } from "@/components/trust-page";
import { site } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Takedown Policy", "How to report copyrighted, outdated, inaccurate, broken, or wrongly listed materials to NOUN Compass.", "/takedown-policy");

export default function Page() {
  return <TrustPage title="Takedown Policy" eyebrow="Report a material concern" intro="We review specific reports about course-material links and listings so the library remains responsible and useful.">
    <h2>What you can report</h2>
    <p>You may report a material or listing that is copyrighted, outdated, inaccurate, broken, wrongly listed, attached to the wrong course code, or linked to an inappropriate source.</p>
    <h2>Information required</h2>
    <p>Email <a href={`mailto:${site.contactEmail}?subject=NOUN%20Compass%20takedown%20request`}>{site.contactEmail}</a> and include the URL of the affected NOUN Compass page, the material title or course code, the reason for the request, proof of ownership or authority where relevant, and the correct replacement link if one is available.</p>
    <h2>Review timeline</h2>
    <p>We aim to acknowledge a sufficiently detailed report within five working days. Complex reports or reports requiring further verification may take longer. Providing complete and accurate information helps us review the concern more quickly.</p>
    <h2>Possible actions</h2>
    <p>Depending on the evidence and type of concern, we may remove the link, update the source, add a warning, correct metadata, or leave the listing unchanged when the report cannot be verified. Urgent, credible copyright or student-safety concerns receive priority.</p>
    <h2>Independent resource notice</h2>
    <p>NOUN Compass does not claim ownership of official NOUN materials and is not an official NOUN representative. Students should confirm course materials through official NOUN platforms.</p>
  </TrustPage>;
}

import { TrustPage } from "@/components/trust-page";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

export const metadata = createMetadata("NOUN Compass Editorial Team", "Learn how the NOUN Compass research and review team checks student guides.", "/authors/editorial-team");

export default function Page() {
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Organization",
      name: "NOUN Compass Editorial Team",
      url: `${site.url}/authors/editorial-team`,
      description: "The NOUN Compass research and review team.",
    },
  };
  return <TrustPage title="NOUN Compass Editorial Team" eyebrow="Research and Review Team" intro="The editorial team reviews guides for clarity, source quality, accuracy, and student usefulness.">
    <h2>Our review role</h2>
    <p>The NOUN Compass Editorial Team checks whether a guide answers a genuine student question clearly, uses suitable sources, distinguishes verified information from guidance, and directs students to official channels for final confirmation.</p>
    <h2>Source and correction practices</h2>
    <p>The team checks official sources where accessible, reviews operational guides when important information changes, and investigates specific corrections reported by readers. Material factual updates may change a page&apos;s last-updated date or include a correction note.</p>
    <h2>Independent status</h2>
    <p>The editorial team is independent and is not affiliated with, endorsed by, or officially connected to the National Open University of Nigeria. It does not claim official authority or unverifiable academic credentials.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
  </TrustPage>;
}

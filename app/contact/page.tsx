import { TrustPage } from "@/components/trust-page";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";
export const metadata = createMetadata("Contact", "Contact NOUN Compass with corrections, questions, or partnership enquiries.", "/contact");
export default function Page() {
  const mailto = `mailto:${site.contactEmail}`;
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact NOUN Compass",
    url: `${site.url}/contact`,
    description: "Contact NOUN Compass for corrections, material reports, and editorial questions.",
    mainEntity: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      email: site.contactEmail,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.contactEmail,
        availableLanguage: "en",
      },
    },
  };
  return <TrustPage title="Contact us" eyebrow="We listen" intro="Send a correction, suggest a guide, report a material problem, or ask a general question.">
    <h2>Before you contact us</h2>
    <p>NOUN Compass cannot log into your student portal, process payments, change results, or speak for NOUN. If the issue is tied to your personal account, your study centre or the relevant NOUN support channel is still the right final stop.</p>
    <div className="contact-grid">
      <div><h2>Editorial and corrections</h2><p>Email <a href={`${mailto}?subject=NOUN%20Compass%20editorial%20request`}>{site.contactEmail}</a> with the page URL, the detail that needs attention, and a supporting source if you have one.</p><a className="button" href={`${mailto}?subject=NOUN%20Compass%20correction`}>Email the editorial team</a></div>
      <div><h2>Copyright and material reports</h2><p>Use the same support address for copyright, broken-link, outdated-material, or wrong-listing reports. Add enough detail for us to check the page quickly.</p><a className="button" href={`${mailto}?subject=NOUN%20Compass%20material%20report`}>Report a material concern</a></div>
    </div>
    <h2>Include useful context</h2>
    <p>For corrections, include the affected page URL, the exact line or material in question, the better information, and a source where available. Never email passwords, one-time codes, full payment-card details, or unnecessary identity documents.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
  </TrustPage>;
}

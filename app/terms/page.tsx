import { TrustPage } from "@/components/trust-page";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";
export const metadata = createMetadata(
  "Terms of Use for NOUN Compass",
  "Review the terms that govern how you use NOUN Compass, our educational content, external links, and site availability.",
  "/terms",
);
export default function Page() { return <TrustPage title="Terms of Use" eyebrow="Using this website" intro="These terms explain how to use NOUN Compass reasonably and what to expect from the site."><h2>Educational information</h2><p>NOUN Compass provides educational guides, tools, and study help for NOUN students. The site helps you understand the process, but your own NOUN record remains the final authority for payments, registration, deadlines, and account decisions.</p><h2>Acceptable use</h2><p>You may use the website for personal, lawful educational purposes. Do not attempt to disrupt the site, misuse forms, impersonate NOUN Compass, or reproduce substantial original content without permission.</p><h2>Accuracy and availability</h2><p>We work to keep content useful and current, but fees, dates, requirements, and course materials can change. We cannot guarantee uninterrupted access or that every page will match the latest NOUN update at every moment.</p><h2>External links</h2><p>Some pages link out so you can confirm details or continue a task on the right platform. We do not control the availability, security, or content of those external websites.</p><h2>Contact</h2><p>Questions about these terms can be sent to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p></TrustPage>; }

import { TrustPage } from "@/components/trust-page";
import { createMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

export const metadata = createMetadata(
  "Victor Chinukwue",
  "Meet Victor Chinukwue, the founder and editor of NOUN Compass, and learn how he oversees student guide content and technical accuracy.",
  "/authors/victor",
);

export default function Page() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Victor Chinukwue",
      jobTitle: "Founder / Editor, NOUN Compass",
      description: "Founder and editor of NOUN Compass.",
      worksFor: { "@type": "Organization", name: site.name, url: site.url },
      url: `${site.url}/authors/victor`,
    },
  };
  return <TrustPage title="Victor Chinukwue" eyebrow="Founder / Editor, NOUN Compass" intro="Victor leads the development and editorial direction of NOUN Compass.">
    <h2>About Victor</h2>
    <p>Victor Chinukwue works on student guides, web development, search-focused content strategy, and practical NOUN resource guidance. His role is to make important student tasks easier to understand while keeping the website independent, transparent, and useful.</p>
    <h2>Editorial responsibilities</h2>
    <ul><li>Student guides</li><li>Website strategy</li><li>Technical accuracy review</li><li>Content quality review</li></ul>
    <h2>Independent status</h2>
    <p>Victor is not an official representative of the National Open University of Nigeria. Critical academic, payment, admission, deadline, and course-material information should still be confirmed through official NOUN channels.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
  </TrustPage>;
}

import { Homepage } from "@/components/homepage/homepage";
import courseMaterials from "@/data/official-course-materials.json";
import { examPrepCourses } from "@/data/exam-prep";
import { site } from "@/data/site";
import { getAllArticles } from "@/lib/articles";
import { createMetadata } from "@/lib/metadata";
import { platformConfig } from "@/lib/platform/config";

export const metadata = createMetadata(
  "NOUN Student Guides for Admission, Fees, Portal, and Results",
  "Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support.",
  "/",
);

export default function Home() {
  const articles = getAllArticles();
  const latestArticles = articles.slice(0, 3);
  const passPrice = `₦${(
    platformConfig.semesterPass.amountKobo / 100
  ).toLocaleString("en-NG")}`;
  const metrics = [
    {
      value: courseMaterials.stats.uniqueCourseCodes.toLocaleString("en-NG"),
      label: "Identified course codes",
      note: "Indexed from the checked course-material library",
      icon: "book" as const,
    },
    {
      value: examPrepCourses.length.toLocaleString("en-NG"),
      label: "Initial practice courses",
      note: "Reviewed banks are being prepared",
      icon: "graduation" as const,
    },
    {
      value: `${platformConfig.semesterPass.durationDays} days`,
      label: "Semester Pass access",
      note: "One payment with no automatic renewal",
      icon: "calendar" as const,
    },
    {
      value: articles.length.toLocaleString("en-NG"),
      label: "Published student guides",
      note: "Practical guidance across core NOUN tasks",
      icon: "document" as const,
    },
  ];
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NOUN Student Guides for Admission, Fees, Portal, and Results",
    url: site.url,
    description:
      "Independent NOUN student guides for admission, school fees, portal tasks, results, study centres, GST courses, and student support.",
    inLanguage: "en-NG",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    about: [
      "NOUN exam preparation",
      "NOUN course materials",
      "NOUN student tools",
      "NOUN student guides",
    ],
  };
  const featuredGuidesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Recently updated NOUN student guides",
    itemListElement: latestArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/articles/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <>
      <Homepage
        articles={latestArticles}
        membership={{
          price: passPrice,
          durationDays: platformConfig.semesterPass.durationDays,
        }}
        metrics={metrics}
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredGuidesSchema) }}
        type="application/ld+json"
      />
    </>
  );
}

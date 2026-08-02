import Link from "next/link";
import { Breadcrumbs } from "@/components/article-elements";
import { SectionScrollButton } from "@/components/section-scroll-button";

type ToolPageHeroProps = {
  title: string;
  eyebrow: string;
  intro: string;
  signedIn: boolean;
  signInHref: string;
};

export function ToolPageHero({
  title,
  eyebrow,
  intro,
  signedIn,
  signInHref,
}: ToolPageHeroProps) {
  return (
    <div className="category-hero tool-page-hero">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: title },
          ]}
        />
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className="category-hero-actions">
          {signedIn ? (
            <SectionScrollButton className="button" targetId="tool-workspace">
              Open this tool
            </SectionScrollButton>
          ) : (
            <Link className="button" href={signInHref}>
              Sign in to use this tool
            </Link>
          )}
          <Link className="category-hero-secondary" href="/tools">
            Browse all student tools <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <aside className="category-hero-note">
          <strong>Private by design.</strong>
          <span>
            NounCompass does not ask for your NOUN portal password, OTP,
            payment PIN, or identity documents.
          </span>
        </aside>
      </div>
    </div>
  );
}

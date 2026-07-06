import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { Footer, Header } from "@/components/site-shell";
import { site } from "@/data/site";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: site.url },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/brand/favicon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/images/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/images/brand/favicon.png"],
  },
  authors: [{ name: "NOUN Compass Editorial Team", url: "/authors/editorial-team" }],
  creator: "NOUN Compass",
  publisher: "NOUN Compass",
  openGraph: { siteName: site.name, type: "website", locale: "en_NG", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NOUN Compass" }] },
  twitter: { card: "summary_large_image", images: ["/twitter-image"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const googleAnalyticsId = "G-TVWNP6J0GF";
  const analyticsLoader = `window.addEventListener('load', () => {
  const bootAnalytics = () => {
    if (window.__nounCompassAnalyticsLoaded) return;
    window.__nounCompassAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', '${googleAnalyticsId}');
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}';
    script.async = true;
    document.head.appendChild(script);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => window.setTimeout(bootAnalytics, 1500), { timeout: 4000 });
    return;
  }

  window.setTimeout(bootAnalytics, 3000);
});`;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.contactEmail,
    logo: `${site.url}/images/brand/nouncompass-icon-512.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.contactEmail,
      availableLanguage: ["en"],
    },
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en-NG",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}${site.searchPath}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return <html lang="en" className={`${inter.variable} ${poppins.variable}`}><head><Script id="google-analytics-loader" strategy="afterInteractive">{analyticsLoader}</Script></head><body><a className="skip-link" href="#main-content">Skip to content</a><Header />{children}<Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} /></body></html>;
}

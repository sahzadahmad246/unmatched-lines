// app/about/page.tsx
import { Metadata } from "next";
import AboutContent from "@/components/about-content";

export const metadata: Metadata = {
  title: "About Unmatched Lines",
  description: "Discover Unmatched Lines’ mission to share timeless poetry from famous poets.",
  keywords: ["poetry", "famous poets", "unmatched lines", "literature"],
  robots: "index, follow",
  openGraph: {
    title: "About Unmatched Lines | Poetry Hub",
    description: "Discover Unmatched Lines’ mission to share timeless poetry from famous poets.",
    url: "https://unmatchedlines.com/about",
    type: "website",
    siteName: "Unmatched Lines",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Unmatched Lines | Poetry Hub",
    description: "Discover Unmatched Lines’ mission to share timeless poetry from famous poets.",
  },
};

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "About Unmatched Lines",
    description: "Discover Unmatched Lines’ mission to share timeless poetry.",
    url: "https://unmatchedlines.com/about",
    isPartOf: {
      "@type": "WebSite",
      name: "Unmatched Lines",
      url: "https://unmatchedlines.com",
    },
  };

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <AboutContent />
    </>
  );
}
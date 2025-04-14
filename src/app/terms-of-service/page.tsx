// app/terms-of-service/page.tsx
import { Metadata } from "next";
import TermsContent from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service | Unmatched Lines",
  description:
    "Review the Terms of Service for Unmatched Lines to understand the rules and guidelines for using our poetry platform and resources.",
  keywords: ["terms of service", "unmatched lines", "poetry website", "user agreement", "terms and conditions"],
  robots: "index, follow",
  openGraph: {
    title: "Terms of Service | Unmatched Lines Poetry Hub",
    description: "Understand the rules for using Unmatched Lines in our Terms of Service.",
    url: "https://unmatchedlines.com/terms-of-service",
    type: "website",
    siteName: "Unmatched Lines",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Unmatched Lines Poetry Hub",
    description: "Understand the rules for using Unmatched Lines in our Terms of Service.",
  },
};

export default function TermsOfServicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service | Unmatched Lines",
    description:
      "Review the Terms of Service for Unmatched Lines to understand the rules and guidelines for using our poetry platform.",
    url: "https://unmatchedlines.com/terms-of-service",
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
      <TermsContent />
    </>
  );
}
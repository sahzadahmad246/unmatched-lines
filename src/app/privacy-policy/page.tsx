// app/privacy-policy/page.tsx
import { Metadata } from "next";
import PrivacyContent from "@/components/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | Unmatched Lines",
  description: "Read Unmatched Lines' Privacy Policy to understand how we collect, use, and protect your personal information while exploring our poetry resources.",
  keywords: ["privacy policy", "unmatched lines", "data protection", "poetry website", "personal information"],
  robots: "index, follow",
  openGraph: {
    title: "Privacy Policy | Unmatched Lines Poetry Hub",
    description: "Learn how Unmatched Lines protects your personal information in our Privacy Policy.",
    url: "https://unmatchedlines.com/privacy-policy",
    type: "website",
    siteName: "Unmatched Lines",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Unmatched Lines Poetry Hub",
    description: "Learn how Unmatched Lines protects your personal information in our Privacy Policy.",
  },
};

export default function PrivacyPolicyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy | Unmatched Lines",
    description: "Read Unmatched Lines' Privacy Policy to understand how we collect, use, and protect your personal information.",
    url: "https://unmatchedlines.com/privacy-policy",
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
      <PrivacyContent />
    </>
  );
}
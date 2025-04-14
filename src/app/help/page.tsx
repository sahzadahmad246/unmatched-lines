// app/help-and-support/page.tsx

import { Metadata } from "next";
import { HelpAndSupport } from "@/components/home/HelpAndSupport";

export const metadata: Metadata = {
  title: "Help and Support",
  description:
    "Find answers to your questions or get assistance with Unmatched Lines. Contact our support team for help with poetry resources and more.",
  keywords: [
    "help",
    "support",
    "unmatched lines",
    "poetry assistance",
    "contact us",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Help and Support | Unmatched Lines Poetry Hub",
    description:
      "Find answers to your questions or get assistance with Unmatched Lines. Contact our support team for help with poetry resources.",
    url: "https://unmatchedlines.com/help-and-support",
    type: "website",
    siteName: "Unmatched Lines",
  },
  twitter: {
    card: "summary_large_image",
    title: "Help and Support | Unmatched Lines Poetry Hub",
    description:
      "Find answers to your questions or get assistance with Unmatched Lines. Contact our support team for help.",
  },
};

export default function HelpAndSupportPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Help and Support | Unmatched Lines",
    description:
      "Find answers to your questions or get assistance with Unmatched Lines. Contact our support team for help with poetry resources.",
    url: "https://unmatchedlines.com/help-and-support",
    isPartOf: {
      "@type": "WebSite",
      name: "Unmatched Lines",
      url: "https://unmatchedlines.com",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@unmatchedlines.com",
      contactType: "Customer Support",
      url: "https://unmatchedlines.com/help-and-support",
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
      <HelpAndSupport />
    </>
  );
}

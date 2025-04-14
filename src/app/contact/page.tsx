// app/contact/page.tsx
import { Metadata } from "next";
import ContactContent from "@/components/contact-content";

export const metadata: Metadata = {
  title: "Contact Unmatched Lines | Get in Touch",
  description: "Reach out to Unmatched Lines for inquiries, feedback, or to share your love for poetry. We're here to connect with poetry enthusiasts!",
  keywords: ["contact", "poetry", "unmatched lines", "get in touch", "literature"],
  robots: "index, follow",
  openGraph: {
    title: "Contact Unmatched Lines | Poetry Hub",
    description: "Reach out to Unmatched Lines for inquiries, feedback, or to share your love for poetry.",
    url: "https://unmatchedlines.com/contact",
    type: "website",
    siteName: "Unmatched Lines",
    images: [
      {
        url: "https://unmatchedlines.com/images/og-contact-image.jpg", // Add your image URL
        width: 1200,
        height: 630,
        alt: "Unmatched Lines Contact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Unmatched Lines | Poetry Hub",
    description: "Reach out to Unmatched Lines for inquiries, feedback, or to share your love for poetry.",
    images: ["https://unmatchedlines.com/images/twitter-contact-image.jpg"], // Add your image URL
  },
};

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Contact Unmatched Lines",
    description: "Reach out to Unmatched Lines for inquiries, feedback, or to share your love for poetry.",
    url: "https://unmatchedlines.com/contact",
    isPartOf: {
      "@type": "WebSite",
      name: "Unmatched Lines",
      url: "https://unmatchedlines.com",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@unmatchedlines.com", 
      contactType: "Customer Support",
      url: "https://unmatchedlines.com/contact",
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
      <ContactContent />
    </>
  );
}
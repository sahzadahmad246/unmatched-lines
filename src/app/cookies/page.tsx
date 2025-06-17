import { Cookie } from "lucide-react"
import PolicyPage from "@/components/general/policy-page"

export const metadata = {
  title: "Cookies Policy | Unmatched Lines",
  description: "Cookies Policy for Unmatched Lines - How we use cookies",
}

export default function CookiesPolicyPage() {
  const sections = [
    {
      title: "What Are Cookies?",
      content: "Cookies are small text files stored on your device when you visit a website.",
    },
    {
      title: "How We Use Cookies",
      content: [
        "Analyze site traffic via anonymous data (Google Analytics or similar)",
        "Store user session if you're logged in",
      ],
    },
    {
      title: "Your Choice",
      content: [
        "By continuing to browse unmatchedlines.com, you agree to our use of cookies.",
        "You can manage or disable cookies from your browser settings.",
      ],
    },
    {
      title: "Contact",
      content:
        'For any questions related to cookies or privacy, reach out at: <a href="mailto:unmatchedloe@gmail.com" class="text-primary hover:underline">unmatchedloe@gmail.com</a>',
    },
  ]

  return (
    <PolicyPage
      title="Cookies Policy"
      icon={Cookie}
      lastUpdated="June 17, 2025"
      description="unmatchedlines.com uses cookies only to improve your browsing experience. We do not use cookies for advertising or marketing."
      sections={sections}
      contactEmail="unmatchedloe@gmail.com"
      footerText="Have questions about our cookies usage?"
      additionalFooterButton={{
        text: "Privacy Policy",
        href: "/privacy-policy",
      }}
    />
  )
}

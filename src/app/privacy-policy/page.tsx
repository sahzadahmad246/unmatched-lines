import { Shield } from "lucide-react"
import PolicyPage from "@/components/general/policy-page"

export const metadata = {
  title: "Privacy Policy | Unmatched Lines",
  description: "Privacy Policy for Unmatched Lines - How we protect your data",
}

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: [
        "When you log in: your name and email address",
        "When you browse: IP address, browser type, device info (via analytics tools)",
      ],
    },
    {
      title: "How We Use Your Data",
      content: [
        "To personalize your experience (e.g. saving liked poetry or bookmarks)",
        "To understand how users interact with the site (via analytics)",
        "To contact you if needed (only if you contact us first)",
      ],
    },
    {
      title: "How We Store Your Data",
      content: [
        "Your data is stored securely in MongoDB (hosted in a secure cloud environment).",
        "We do not share your data with any third parties.",
        "We do not sell, trade, or rent your personal information.",
      ],
    },
    {
      title: "Your Rights",
      content: [
        'You can request to view or delete your stored data by emailing us at: <a href="mailto:unmatchedloe@gmail.com" class="text-primary hover:underline">unmatchedloe@gmail.com</a>',
      ],
    },
    {
      title: "Third-Party Services",
      content: [
        'We use analytics tools to understand traffic and user behavior. These tools may use cookies (see <a href="/cookies" class="text-primary hover:underline">Cookies Policy</a>).',
      ],
    },
  ]

  return (
    <PolicyPage
      title="Privacy Policy"
      icon={Shield}
      lastUpdated="June 17, 2025"
      description="At unmatchedlines.com, we respect your privacy and are committed to protecting the personal information you provide when using our website."
      sections={sections}
      contactEmail="unmatchedloe@gmail.com"
      footerText="Have questions about our privacy practices?"
    />
  )
}

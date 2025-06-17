"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  Cookie,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Lock,
  Eye,
  Calendar,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PolicySummaryProps {
  variant?: "compact" | "detailed" | "footer"
  showStats?: boolean
  showContact?: boolean
  className?: string
}

export default function PolicySummary({
  variant = "detailed",
  showStats = true,
  showContact = true,
  className = "",
}: PolicySummaryProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isCookiesOpen, setIsCookiesOpen] = useState(false)

  const stats = [
    { label: "Data Encrypted", value: "100%", icon: Lock },
    { label: "Third-party Sharing", value: "0%", icon: Users },
    { label: "Data Retention", value: "Minimal", icon: Calendar },
    { label: "User Control", value: "Full", icon: Eye },
  ]

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Cookie className="h-4 w-4 text-primary" />
          <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
            Cookies Policy
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <a
            href="mailto:unmatchedloe@gmail.com"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    )
  }

  if (variant === "footer") {
    return (
      <div className={`bg-muted/30 dark:bg-muted/20 rounded-lg p-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Legal & Privacy
            </h3>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="block text-muted-foreground hover:text-primary transition-colors">
                Cookies Policy
              </Link>
              <span className="block text-xs text-muted-foreground">Last updated: June 17, 2025</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Facts</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>🔒 Your data is secure</div>
              <div>🚫 No data selling</div>
              <div>📧 Email only for login</div>
              <div>🍪 Essential cookies only</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:unmatchedloe@gmail.com"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                unmatchedloe@gmail.com
              </a>
              <span className="block text-xs text-muted-foreground">Questions about privacy or data?</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Privacy & Data Protection</h2>
        <p className="text-muted-foreground">
          We are committed to protecting your privacy and being transparent about our data practices.
        </p>
        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          GDPR Compliant
        </Badge>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-4">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Policy Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy Policy
            </CardTitle>
            <CardDescription>How we collect, use, and protect your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm font-medium">Quick Overview</span>
                  {isPrivacyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 text-sm text-muted-foreground">
                <div>• We only collect your name and email when you log in</div>
                <div>• Anonymous analytics for site improvement</div>
                <div>• No data sharing with third parties</div>
                <div>• You can request data deletion anytime</div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/privacy-policy">
                  Read Full Policy
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cookies Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookies Policy
            </CardTitle>
            <CardDescription>How we use cookies to improve your browsing experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible open={isCookiesOpen} onOpenChange={setIsCookiesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm font-medium">Quick Overview</span>
                  {isCookiesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 text-sm text-muted-foreground">
                <div>• Essential cookies for site functionality</div>
                <div>• Analytics cookies for traffic insights</div>
                <div>• No advertising or tracking cookies</div>
                <div>• You can disable cookies in browser settings</div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/cookies">
                  Read Full Policy
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      {showContact && (
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Questions about your data?</h3>
                  <p className="text-sm text-muted-foreground">We are here to help with any privacy concerns.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:unmatchedloe@gmail.com">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Us
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/privacy-policy">
                    <FileText className="h-4 w-4 mr-1" />
                    View Policies
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-3 w-3" />
          Last updated: June 17, 2025
        </div>
      </div>
    </div>
  )
}

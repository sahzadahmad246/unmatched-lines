"use client"

import { motion } from "framer-motion"
import {
  BookOpen,
  UserCircle,
  FileText,
  AlertTriangle,
  Rocket,
  XCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function TermsContent() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-center gap-2 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Terms of Service</h1>
      </motion.div>

      <motion.p variants={item} className="text-muted-foreground mb-8 italic">
        By using Unmatched Lines, you agree to these terms. Last updated: April 14, 2025.
      </motion.p>

      <div className="space-y-8">
        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Usage</h2>
                  <Separator />
                  <ul className="space-y-2">
                    {[
                      "This platform is for personal use only.",
                      "Don't misuse the site (no hacking, scraping, or spamming).",
                      "Respect content and its sources.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <UserCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Accounts</h2>
                  <Separator />
                  <ul className="space-y-2">
                    {[
                      "Use your personal Google account to log in.",
                      "You're responsible for keeping your login info safe.",
                      <>
                        Account issues? Reach us at{" "}
                        <a
                          key="account-email"
                          href="mailto:contact@unmatchedlines.com"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          contact@unmatchedlines.com
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        .
                      </>,
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Content Use</h2>
                  <Separator />
                  <p>
                    We share poetry and literary content sourced from books and online references under fair use or
                    public domain.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Feel free to share lines with credit to Unmatched Lines.",
                      "Do not resell or modify the content.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    Have a copyright concern? Email us at{" "}
                    <a
                      href="mailto:contact@unmatchedlines.com"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      contact@unmatchedlines.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Liability</h2>
                  <Separator />
                  <ul className="space-y-2">
                    {[
                      "We aren't liable for typos or inaccuracies in the content.",
                      "We don't guarantee uninterrupted access to the site.",
                      "Google login and third-party services may occasionally experience issues.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Rocket className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Future Features</h2>
                  <Separator />
                  <p>
                    Currently, users cannot upload their own poetry. This may change in the future with updated
                    policies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <XCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h2 className="text-xl font-semibold">Termination</h2>
                  <Separator />
                  <p>
                    If you break the rules, we may disable your access. Want to delete your account? Just email us at{" "}
                    <a
                      href="mailto:contact@unmatchedlines.com"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      contact@unmatchedlines.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

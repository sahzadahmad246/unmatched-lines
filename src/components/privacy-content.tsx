"use client"

import { motion } from "framer-motion"
import { Shield, Database, Share2, UserCheck, Cookie, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

export default function PrivacyContent() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
      </motion.div>

      <motion.p variants={item} className="text-muted-foreground mb-8 italic">
        Privacy matters at Unmatched Lines. Last updated: April 14, 2025.
      </motion.p>

      <Accordion type="single" collapsible className="space-y-4">
        <motion.div variants={item}>
          <AccordionItem value="item-1" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">What We Collect</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <ul className="space-y-2">
                    {[
                      "When you log in with Google, we collect your name, email, and profile picture.",
                      "We use Google Analytics to understand how people use the site (no personal data is tracked).",
                      "Ads may be shown via Google Ads based on general browsing behavior.",
                    ].map((text, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>

        <motion.div variants={item}>
          <AccordionItem value="item-2" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">How It's Used</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <ul className="space-y-2">
                    {[
                      "To manage your account and improve your experience.",
                      "To analyze traffic and improve site content.",
                      "To show relevant ads and keep the platform sustainable.",
                    ].map((text, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>

        <motion.div variants={item}>
          <AccordionItem value="item-3" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Cookie className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Cookies</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                      <span>Used for analytics and future ad personalization.</span>
                    </li>
                  </ul>
                  <p className="mt-2">
                    You can turn off cookies in your browser settings, but some features may not work properly.
                  </p>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>

        <motion.div variants={item}>
          <AccordionItem value="item-4" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Data Storage</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <p>
                    Your data is securely stored in our MongoDB database. We follow best practices, but no system is
                    100% immune.
                  </p>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>

        <motion.div variants={item}>
          <AccordionItem value="item-5" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Third-Party Sharing</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <ul className="space-y-2">
                    {[
                      "Google Analytics receives anonymous usage data.",
                      "Google Ads partners may access non-identifiable browsing data.",
                      "We may share data if required by law.",
                    ].map((text, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-medium">We do not sell your data under any circumstances.</p>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>

        <motion.div variants={item}>
          <AccordionItem value="item-6" className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Your Rights</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <Separator className="mb-4" />
                  <p>
                    You can request to view or delete your data anytime by emailing{" "}
                    <a href="mailto:contact@unmatchedlines.com" className="text-primary hover:underline">
                      contact@unmatchedlines.com
                    </a>
                    .
                  </p>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        </motion.div>
      </Accordion>
    </motion.div>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  HelpCircle,
  FileText,
  Mail,
  MessageSquare,
  ShieldCheck,
  Lock,
  Cookie,
  Copyright,
  Info,
  BookOpen,
  Search,
  Users,
  Bookmark,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function HelpAndSupport() {
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

  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-20 top-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 bottom-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-primary/10 shadow-sm relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="bg-primary/10 p-2 rounded-full">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-xl font-serif text-center">Help & Support</h3>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Input
              placeholder="Search for help topics..."
              className="pl-10 h-11 bg-background/80 backdrop-blur-sm border-primary/20 rounded-lg focus-visible:ring-primary/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resources Section */}
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <motion.div className="flex items-center gap-2" variants={item}>
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium text-base font-serif text-primary">Resources</h4>
                </motion.div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-4 bg-primary/10" />
                <motion.ul className="space-y-3" variants={container}>
                  {[
                    {
                      href: "/about",
                      label: "About Us",
                      icon: <BookOpen className="h-4 w-4" />,
                      description: "Learn about our mission and story",
                    },
                    {
                      href: "/contact",
                      label: "Contact",
                      icon: <Mail className="h-4 w-4" />,
                      description: "Get in touch with our team",
                    },
                    {
                      href: "/faq",
                      label: "FAQ",
                      icon: <MessageSquare className="h-4 w-4" />,
                      description: "Frequently asked questions",
                    },
                    {
                      href: "/blog",
                      label: "Blog",
                      icon: <FileText className="h-4 w-4" />,
                      description: "Articles and poetry insights",
                    },
                  ].map((link, index) => (
                    <motion.li key={link.href} variants={item} whileHover={{ x: 5 }} className="group">
                      <Link
                        href={link.href}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className="bg-muted p-1.5 rounded-full text-primary/70 group-hover:bg-primary/10 transition-colors">
                          {link.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                            {link.label}
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                          <div className="text-xs text-muted-foreground">{link.description}</div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Legal Section */}
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <motion.div className="flex items-center gap-2" variants={item}>
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium text-base font-serif text-primary">Legal</h4>
                </motion.div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-4 bg-primary/10" />
                <motion.ul className="space-y-3" variants={container}>
                  {[
                    {
                      href: "/terms",
                      label: "Terms of Service",
                      icon: <FileText className="h-4 w-4" />,
                      description: "Rules for using our platform",
                    },
                    {
                      href: "/privacy",
                      label: "Privacy Policy",
                      icon: <Lock className="h-4 w-4" />,
                      description: "How we handle your data",
                    },
                    {
                      href: "/cookies",
                      label: "Cookie Policy",
                      icon: <Cookie className="h-4 w-4" />,
                      description: "Information about cookies",
                    },
                    {
                      href: "/copyright",
                      label: "Copyright",
                      icon: <Copyright className="h-4 w-4" />,
                      description: "Intellectual property rights",
                    },
                  ].map((link, index) => (
                    <motion.li key={link.href} variants={item} whileHover={{ x: 5 }} className="group">
                      <Link
                        href={link.href}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className="bg-muted p-1.5 rounded-full text-primary/70 group-hover:bg-primary/10 transition-colors">
                          {link.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                            {link.label}
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                          <div className="text-xs text-muted-foreground">{link.description}</div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-medium text-base font-serif text-primary">Frequently Asked Questions</h4>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-4 bg-primary/10" />

              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "How can I submit my own poetry?",
                    answer:
                      'You can submit your poetry by visiting our "Submissions" page and following the guidelines. Our editorial team reviews all submissions and will contact you if your work is selected for publication.',
                  },
                  {
                    question: "Can I download poems for offline reading?",
                    answer:
                      "Yes, you can download poems using the download button available on each poem page. This feature allows you to save your favorite verses for offline reading or sharing with friends.",
                  },
                  {
                    question: "How do I create a reading list?",
                    answer:
                      "To create a reading list, you need to sign in to your account. Once signed in, you can add poems to your reading list by clicking the bookmark icon on any poem page. Your reading list will be accessible from your profile.",
                  },
                  {
                    question: "Are there different language options available?",
                    answer:
                      "Yes, we offer poetry in multiple languages including English, Hindi, and Urdu. You can filter poems by language using the language selector on the search page.",
                  },
                  {
                    question: "How can I support the platform?",
                    answer:
                      "You can support our platform by subscribing to our newsletter, sharing poems with friends, and engaging with the community. We also welcome donations to help maintain and improve the site.",
                  },
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`} className="border-primary/10">
                    <AccordionTrigger className="text-sm font-medium py-4 hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm w-full sm:w-1/3">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-2 rounded-full mb-3 mt-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h5 className="font-medium text-sm mb-1">Community Forum</h5>
              <p className="text-xs text-muted-foreground mb-3">Join discussions with fellow poetry enthusiasts</p>
              <Button variant="outline" size="sm" className="w-full mt-auto">
                Visit Forum
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm w-full sm:w-1/3">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-2 rounded-full mb-3 mt-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h5 className="font-medium text-sm mb-1">Contact Support</h5>
              <p className="text-xs text-muted-foreground mb-3">Get help from our dedicated support team</p>
              <Button variant="outline" size="sm" className="w-full mt-auto">
                Email Us
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm w-full sm:w-1/3">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-2 rounded-full mb-3 mt-2">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <h5 className="font-medium text-sm mb-1">Resources</h5>
              <p className="text-xs text-muted-foreground mb-3">Explore our guides and documentation</p>
              <Button variant="outline" size="sm" className="w-full mt-auto">
                View Resources
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}


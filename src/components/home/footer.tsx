"use client"

import Link from "next/link"
import { Feather, Github, Twitter, Instagram, Mail, ArrowRight, Heart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Logo } from "./logo"
import { useMediaQuery } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

export function Footer() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return <>{isMobile ? <MobileFooter /> : <DesktopFooter />}</>
}

function MobileFooter() {
  return (
    <footer className="bg-gradient-to-b from-background via-muted/5 to-background border-t mb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-20 bottom-0 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 top-0 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          className="flex flex-col items-center text-center space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="large" />

          <motion.p
            className="text-sm text-muted-foreground max-w-xs leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Discover the beauty of poetry from renowned poets across different languages and traditions.
          </motion.p>

          <motion.div
            className="flex space-x-3 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {[
              { href: "https://twitter.com", icon: <Twitter className="h-3.5 w-3.5" />, label: "Twitter" },
              { href: "https://instagram.com", icon: <Instagram className="h-3.5 w-3.5" />, label: "Instagram" },
              { href: "https://github.com", icon: <Github className="h-3.5 w-3.5" />, label: "GitHub" },
              { href: "mailto:contact@unmatchedlines.com", icon: <Mail className="h-3.5 w-3.5" />, label: "Email" },
            ].map((social, index) => (
              <motion.div
                key={social.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.05 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-primary/20 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-primary/10 hover:border-primary/30 transition-all"
                  asChild
                >
                  <Link href={social.href} aria-label={social.label}>
                    {social.icon}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Separator className="my-6 bg-primary/10" />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-xs font-serif italic">Crafted with</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 1.5,
              }}
            >
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </motion.div>
            <span className="text-xs font-serif italic">
              by <span className="text-primary font-medium">Shahzad</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Unmatched Lines. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

function DesktopFooter() {
  return (
    <footer className="bg-gradient-to-b from-background via-muted/5 to-background border-t mb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-40 bottom-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-40 top-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Newsletter Section */}
        <motion.div
          className="mb-12 bg-gradient-to-br from-primary/5 to-background rounded-2xl p-8 border border-primary/10 shadow-sm backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 font-serif">Join Our Poetic Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Subscribe to receive weekly curated poems and literary insights directly to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex h-11 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button className="h-11 rounded-lg gap-2 px-5 shadow-sm hover:shadow-md transition-all">
                Subscribe <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and About */}
          <motion.div
            className="md:col-span-1 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Logo size="large" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover the beauty of poetry from renowned poets across different languages and traditions.
            </p>
            <div className="flex space-x-3">
              {[
                { href: "https://twitter.com", icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
                { href: "https://instagram.com", icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
                { href: "https://github.com", icon: <Github className="h-4 w-4" />, label: "GitHub" },
                { href: "mailto:contact@unmatchedlines.com", icon: <Mail className="h-4 w-4" />, label: "Email" },
              ].map((social, index) => (
                <motion.div
                  key={social.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 border-primary/20 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-primary/10 hover:border-primary/30 transition-all"
                    asChild
                  >
                    <Link href={social.href} aria-label={social.label}>
                      {social.icon}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold mb-5 text-base font-serif">Explore</h3>
            <ul className="space-y-3.5">
              {[
                { href: "/poets", label: "Poets" },
                { href: "/ghazal", label: "Ghazals" },
                { href: "/sher", label: "Shers" },
                { href: "/library", label: "Library" },
              ].map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold mb-5 text-base font-serif">Resources</h3>
            <ul className="space-y-3.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
              ].map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold mb-5 text-base font-serif">Legal</h3>
            <ul className="space-y-3.5">
              {[
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/cookies", label: "Cookie Policy" },
                { href: "/copyright", label: "Copyright" },
              ].map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <Separator className="my-8 bg-primary/10" />

        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Unmatched Lines. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <Feather className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-serif italic">
              Crafted with
              <motion.span
                className="inline-block mx-1"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 1.5,
                }}
              >
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline-block" />
              </motion.span>
              by <span className="text-primary font-medium">Shahzad</span>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}


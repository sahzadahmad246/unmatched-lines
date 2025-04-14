"use client"

import { motion } from "framer-motion"
import { BookHeart, Users, Quote, Sparkles, Heart } from "lucide-react"
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

export default function AboutContent() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-center gap-2 mb-8">
        <BookHeart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">About Us</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Our Mission</h2>
                </div>
                <Separator className="mb-4" />
                <p className="text-muted-foreground">
                  Unmatched Lines is a curated space for poetry lovers. We bring together timeless lines from books and
                  online resources—carefully chosen and shared under fair use—to let words speak when you can't.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Your Experience</h2>
                </div>
                <Separator className="mb-4" />
                <p className="text-muted-foreground">
                  You can sign in with Google to save your favorite lines. We collect only basic info like your name,
                  email, and profile picture—just enough to personalize your experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Our Approach</h2>
                </div>
                <Separator className="mb-4" />
                <p className="text-muted-foreground">
                  All data is securely stored and used to make the platform better, with insights from Google Analytics
                  and support from Google Ads.
                </p>
                <p className="text-muted-foreground mt-2">
                  We're not open to user submissions yet, but that's something we're considering in the future.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Our Belief</h2>
                </div>
                <Separator className="mb-4" />
                <p className="text-muted-foreground">
                  At Unmatched Lines, we believe great poetry deserves to be discovered, revisited, and remembered—one
                  unmatched line at a time.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

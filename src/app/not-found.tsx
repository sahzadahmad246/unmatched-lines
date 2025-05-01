"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, Search, ArrowLeft, Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-indigo-950 dark:via-slate-950 dark:to-fuchsia-950 rounded-xl border border-indigo-200/60 dark:border-fuchsia-700/20 shadow-lg overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-300 via-violet-300 to-fuchsia-300 dark:from-indigo-700 dark:via-violet-700 dark:to-fuchsia-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-fuchsia-300 via-violet-300 to-indigo-300 dark:from-fuchsia-700 dark:via-violet-700 dark:to-indigo-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 via-violet-200/30 to-fuchsia-200/30 dark:from-indigo-800/30 dark:via-violet-800/30 dark:to-fuchsia-800/30 skew-x-12 rounded-lg -z-10"></div>
              <div className="py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-900 dark:via-violet-900 dark:to-fuchsia-900 shadow-sm">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-violet-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold font-serif text-indigo-800 dark:text-violet-300">
                    Unmatched Lines
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-fuchsia-500/20 backdrop-blur-sm text-indigo-700 dark:text-violet-300 border border-indigo-300/30 dark:border-fuchsia-600/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                  <span className="text-[10px] sm:text-xs font-medium">404 Not Found</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <h1 className="text-4xl sm:text-5xl font-bold font-serif text-indigo-800 dark:text-violet-300 mb-2">
                  Page Not Found
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-300 via-violet-400 to-fuchsia-300 dark:from-indigo-600 dark:via-violet-500 dark:to-fuchsia-600 rounded-full mx-auto"></div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <p className="text-lg font-serif text-slate-700 dark:text-slate-300 mb-6 max-w-md mx-auto">
                  The verse you seek seems to have wandered off into the poetic ether. Let's guide you back to familiar
                  stanzas.
                </p>

                <div className="text-center mb-8 p-6 bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-indigo-200/40 dark:border-fuchsia-700/20 shadow-inner backdrop-blur-sm">
                  <p className="text-sm sm:text-base font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                    "Like a poem without words,
                    <br />A page that cannot be found.
                    <br />
                    Return to where verses flow,
                    <br />
                    Where meaning and beauty abound."
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-none"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 bg-white/80 dark:bg-slate-900/80 border-indigo-200/40 dark:border-fuchsia-700/20 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50"
              >
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Search Poems
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 bg-white/80 dark:bg-slate-900/80 border-indigo-200/40 dark:border-fuchsia-700/20 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50"
              >
                <Link href="javascript:history.back()">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Users, Bookmark, FileText, Sparkles } from "lucide-react"
import { useState } from "react"
import { useColorTransition } from "@/lib/color-transition-provider"

interface Author {
  _id: string
  name: string
  slug: string
  image?: string
  bio?: string
  sherCount?: number
  ghazalCount?: number
  followerCount?: number
}

interface PoetSpotlightProps {
  author: Author | null
}

export default function PoetSpotlight({ author }: PoetSpotlightProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { currentPalette, transitionStyle } = useColorTransition()

  if (!author) {
    return null
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  // Truncate bio
  const truncateBio = (bio: string, maxLength: number) => {
    if (!bio || bio.length <= maxLength) return bio
    return bio.slice(0, maxLength) + "..."
  }

  // Calculate total poems
  const totalPoems = (author.sherCount || 0) + (author.ghazalCount || 0)

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="w-full mb-8 h-full">
      <div className="h-full mt-4 sm:mt-6">
        <div
          className={`${currentPalette.background} ${currentPalette.darkBackground} rounded-xl border border-opacity-60 shadow-lg overflow-hidden h-full relative`}
          style={transitionStyle}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div
              className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${currentPalette.primary} rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2`}
              style={transitionStyle}
            ></div>
            <div
              className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr ${currentPalette.secondary} rounded-full blur-3xl translate-y-1/2 translate-x-1/2`}
              style={transitionStyle}
            ></div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
            <div className="relative mb-4">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentPalette.primary} opacity-30 skew-x-12 rounded-lg -z-10`}
                style={transitionStyle}
              ></div>
              <div className="py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${currentPalette.primary} shadow-sm`}
                    style={transitionStyle}
                  >
                    <BookOpen className={`h-3.5 w-3.5 ${currentPalette.accent}`} style={transitionStyle} />
                  </div>
                  <h2
                    className={`text-sm sm:text-base font-semibold font-serif ${currentPalette.text} ${currentPalette.darkText}`}
                    style={transitionStyle}
                  >
                    Poet Spotlight
                  </h2>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r ${currentPalette.primary} bg-opacity-10 backdrop-blur-sm ${currentPalette.text} ${currentPalette.darkText} border border-opacity-30 shadow-sm`}
                  style={transitionStyle}
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="text-[10px] sm:text-xs font-medium">Featured Poet</span>
                </div>
              </div>
            </div>

            <motion.div
              variants={cardVariants}
             
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="flex-grow flex flex-col"
            >
              <div
                className={`relative h-24 sm:h-32 bg-gradient-to-r ${currentPalette.primary} bg-opacity-20 rounded-lg mb-12`}
                style={transitionStyle}
              >
                <div
                  className="absolute -bottom-10 sm:-bottom-12 left-4 border-4 border-white dark:border-slate-800 rounded-full overflow-hidden ring-2 shadow-md"
                  style={transitionStyle}
                >
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <Image
                      src={author.image || `/placeholder.svg?height=200&width=200`}
                      alt={author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-4 relative z-10">
                <div className="flex flex-row items-center justify-between gap-2 mb-4 flex-wrap sm:flex-nowrap">
                  <Link href={`/poets/${author.slug}`} className="group">
                    <h3
                      className={`text-xl sm:text-2xl font-bold font-serif ${currentPalette.text} ${currentPalette.darkText} group-hover:opacity-80 transition-colors`}
                      style={transitionStyle}
                    >
                      {author.name}
                    </h3>
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent rounded-full mt-1`}
                      style={transitionStyle}
                    ></div>
                  </Link>

                  <div className="sm:hidden">
                    <Button
                      size="sm"
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-800/80 ${currentPalette.text} ${currentPalette.darkText} hover:bg-opacity-50 backdrop-blur-sm`}
                      style={transitionStyle}
                      onClick={() => {
                        console.log(`Follow ${author.name}`)
                      }}
                    >
                      <Users className="h-3 w-3 mr-0.5" />
                      <span>Follow</span>
                    </Button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-800/80 ${currentPalette.text} ${currentPalette.darkText} hover:bg-opacity-50 backdrop-blur-sm`}
                      style={transitionStyle}
                      onClick={() => {
                        console.log(`Follow ${author.name}`)
                      }}
                    >
                      <Users className="h-3 w-3 mr-0.5" />
                      <span>Follow</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <span
                    className={`flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-slate-800/80 rounded-md border border-opacity-40 ${currentPalette.text} ${currentPalette.darkText}`}
                    style={transitionStyle}
                  >
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{author.followerCount || 0} Followers</span>
                  </span>
                  <span
                    className={`flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-slate-800/80 rounded-md border border-opacity-40 ${currentPalette.text} ${currentPalette.darkText}`}
                    style={transitionStyle}
                  >
                    <BookOpen className="h-3 w-3" />
                    <span className="font-medium">{totalPoems} Poems</span>
                  </span>
                </div>

                {author.bio && (
                  <div className="mb-6">
                    <p className="text-sm sm:text-base font-serif text-slate-800 dark:text-slate-200 leading-relaxed bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-800/80 dark:to-slate-800/30 rounded-xl border border-opacity-40 shadow-inner backdrop-blur-sm p-4">
                      {truncateBio(author.bio, 200)}
                    </p>
                  </div>
                )}

                <Separator className="my-4 bg-opacity-50" style={transitionStyle} />

                <div className="flex flex-wrap gap-2 mt-auto">
                  {(author.sherCount || 0) > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md border border-opacity-40 ${currentPalette.text} ${currentPalette.darkText}`}
                      style={transitionStyle}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium font-serif">{author.sherCount} Sher</span>
                    </motion.div>
                  )}
                  {(author.ghazalCount || 0) > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md border border-opacity-40 ${currentPalette.text} ${currentPalette.darkText}`}
                      style={transitionStyle}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium font-serif">{author.ghazalCount} Ghazal</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

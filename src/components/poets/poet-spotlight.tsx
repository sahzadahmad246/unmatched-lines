"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Users, BookOpen, ChevronRight, Bookmark, FileText } from "lucide-react"

interface Author {
  _id: string
  name: string
  slug: string
  image?: string
  bio?: string
  city?: string
  sherCount?: number
  ghazalCount?: number
  otherCount?: number
  followerCount?: number
}

interface PoetSpotlightProps {
  author: Author | null
}

export default function PoetSpotlight({ author }: PoetSpotlightProps) {
  if (!author) {
    return null
  }

  const truncateBio = (bio: string, maxLength: number) => {
    if (!bio || bio.length <= maxLength) return bio
    return bio.slice(0, maxLength) + "..."
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
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

  // Calculate total poems
  const totalPoems = (author.sherCount || 0) + (author.ghazalCount || 0) + (author.otherCount || 0)

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="w-full mb-12">
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Poet Spotlight</h2>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md"
      >
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          {/* Avatar section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-gray-900 shadow-md">
              {author.image ? (
                <AvatarImage src={author.image || "/placeholder.svg"} alt={author.name} />
              ) : (
                <AvatarFallback className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="mt-4 flex flex-col items-center">
              <Badge
                variant="outline"
                className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 px-3 py-1 flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Relevent Poet</span>
              </Badge>

              <div className="mt-3">
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  onClick={() => {
                    console.log(`Follow ${author.name}`)
                  }}
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Follow
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content section */}
          <motion.div variants={itemVariants} className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <Link href={`/poets/${author.slug}`} className="group">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {author.name}
                </h3>
              </Link>

              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                {author.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {author.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-500" />
                  {author.followerCount || 0} Followers
                </span>
              </div>
            </div>

            {author.bio && (
              <div className="mb-6">
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {truncateBio(author.bio, 200)}
                </p>
              </div>
            )}

            <Separator className="my-4 bg-gray-200 dark:bg-gray-800" />

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Bookmark className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{author.sherCount || 0}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Sher</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <FileText className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{author.ghazalCount || 0}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Ghazal</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <BookOpen className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{author.otherCount || 0}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Other</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>{totalPoems} Total Poems</span>
              </div>

              <Link
                href={`/poets/${author.slug}`}
                className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-1 transition-colors"
              >
                View Profile
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}

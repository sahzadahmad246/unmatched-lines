"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, User, ChevronLeft, ChevronRight, BookOpen, Star, MessageSquare, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Author {
  _id: string
  name: string
  image?: string
  bio?: string
  poemsCount?: number
  viewsCount?: number
  commentsCount?: number
  featured?: boolean
}

interface FeaturedAuthorsProps {
  authors: Author[]
}

export function FeaturedAuthors({ authors }: FeaturedAuthorsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [featuredAuthors, setFeaturedAuthors] = useState<Author[]>([])

  useEffect(() => {
    if (authors.length === 0) return

    // Filter featured authors or get top authors by views
    const featured = authors
      .filter((author) => author.featured || (author.viewsCount && author.viewsCount > 0))
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 5)

    setFeaturedAuthors(featured)
  }, [authors])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredAuthors.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredAuthors.length) % featuredAuthors.length)
  }

  if (featuredAuthors.length === 0) return null

  const currentAuthor = featuredAuthors[currentIndex]

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-purple-50 via-purple-100/30 to-fuchsia-50 dark:from-purple-950 dark:via-purple-900/30 dark:to-fuchsia-950 rounded-xl border border-purple-200/60 dark:border-purple-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-fuchsia-300 dark:from-purple-700 dark:to-fuchsia-600 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-fuchsia-300 to-purple-300 dark:from-fuchsia-600 dark:to-purple-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-transparent to-fuchsia-200/30 dark:from-purple-800/30 dark:to-fuchsia-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900 dark:to-fuchsia-900 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-purple-600 dark:text-fuchsia-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-purple-800 dark:text-fuchsia-300">
                  Featured Authors
                </h2>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20 backdrop-blur-sm text-purple-700 dark:text-fuchsia-300 border border-purple-300/30 dark:border-fuchsia-600/30 shadow-sm">
                <span className="text-[10px] sm:text-xs font-medium">
                  {currentIndex + 1} of {featuredAuthors.length}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            <Card className="border-purple-200/40 dark:border-fuchsia-700/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col items-center p-5">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-fuchsia-400 dark:from-purple-600 dark:to-fuchsia-600 rounded-full blur-md opacity-30"></div>
                    <Avatar className="h-20 w-20 border-2 border-purple-200 dark:border-fuchsia-700 ring-2 ring-white dark:ring-slate-950 shadow-md relative z-10">
                      {currentAuthor.image ? (
                        <AvatarImage src={currentAuthor.image || "/placeholder.svg"} alt={currentAuthor.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900 dark:to-fuchsia-900 text-purple-700 dark:text-fuchsia-300">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  <h3 className="text-lg font-serif font-medium text-purple-800 dark:text-fuchsia-300 bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-500 dark:to-fuchsia-500 bg-clip-text text-transparent mb-2">
                    {currentAuthor.name}
                  </h3>

                  <Badge
                    variant="outline"
                    className="mb-4 bg-purple-50 dark:bg-fuchsia-950/50 text-purple-700 dark:text-fuchsia-300 border-purple-200 dark:border-fuchsia-700/40"
                  >
                    <Star className="h-3 w-3 mr-1 fill-purple-500 dark:fill-fuchsia-500 text-purple-500 dark:text-fuchsia-500" />
                    Featured Poet
                  </Badge>

                  <p className="text-sm text-center text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                    {currentAuthor.bio ||
                      "A distinguished poet known for their remarkable contributions to literature."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 w-full mb-4">
                    <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-fuchsia-950/30 rounded-lg">
                      <span className="text-lg font-medium text-purple-700 dark:text-fuchsia-300">
                        {currentAuthor.poemsCount || 0}
                      </span>
                      <span className="text-xs text-purple-600/70 dark:text-fuchsia-400/70">Poems</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-fuchsia-950/30 rounded-lg">
                      <span className="text-lg font-medium text-purple-700 dark:text-fuchsia-300">
                        {currentAuthor.viewsCount || 0}
                      </span>
                      <span className="text-xs text-purple-600/70 dark:text-fuchsia-400/70">Views</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-fuchsia-950/30 rounded-lg">
                      <span className="text-lg font-medium text-purple-700 dark:text-fuchsia-300">
                        {currentAuthor.commentsCount || 0}
                      </span>
                      <span className="text-xs text-purple-600/70 dark:text-fuchsia-400/70">Comments</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 text-xs font-serif bg-white/90 dark:bg-slate-900/90 border-purple-200 dark:border-fuchsia-800/40 text-purple-700 dark:text-fuchsia-300 hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:text-purple-800 dark:hover:text-fuchsia-200 backdrop-blur-sm"
                    >
                      <Link href={`/poets/${currentAuthor._id}`}>
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        <span>View Works</span>
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 text-xs font-serif bg-white/90 dark:bg-slate-900/90 border-purple-200 dark:border-fuchsia-800/40 text-purple-700 dark:text-fuchsia-300 hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:text-purple-800 dark:hover:text-fuchsia-200 backdrop-blur-sm"
                    >
                      <Link href={`/poets/${currentAuthor._id}/comments`}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        <span>Comments</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-purple-200 dark:border-fuchsia-800/40 h-8 w-8 hidden sm:flex hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:scale-110 transition-all duration-300 text-purple-700 dark:text-fuchsia-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-purple-200 dark:border-fuchsia-800/40 h-8 w-8 hidden sm:flex hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:scale-110 transition-all duration-300 text-purple-700 dark:text-fuchsia-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="flex items-center justify-center mt-4 gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-7 w-7 border-purple-200 dark:border-fuchsia-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:border-purple-300 dark:hover:border-fuchsia-700 transition-all sm:hidden text-purple-700 dark:text-fuchsia-300 shadow-sm"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-2">
              {featuredAuthors.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className="group focus:outline-none">
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-gradient-to-r from-purple-400 to-fuchsia-400 dark:from-purple-600 dark:to-fuchsia-600 w-6 shadow-sm"
                        : "bg-purple-200/50 dark:bg-fuchsia-800/30 w-2 group-hover:bg-purple-300 dark:group-hover:bg-fuchsia-700/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-7 w-7 border-purple-200 dark:border-fuchsia-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50 dark:hover:bg-fuchsia-950/50 hover:border-purple-300 dark:hover:border-fuchsia-700 transition-all sm:hidden text-purple-700 dark:text-fuchsia-300 shadow-sm"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              asChild
              variant="link"
              size="sm"
              className="h-8 text-xs font-serif text-purple-700 dark:text-fuchsia-300 hover:text-purple-800 dark:hover:text-fuchsia-200"
            >
              <Link href="/poets">
                <span>View All Authors</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

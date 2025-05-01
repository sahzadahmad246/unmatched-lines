"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, ArrowRight, Heart, Eye, User, Tag, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface Poem {
  _id: string
  title: {
    en?: string
    hi?: string
    ur?: string
  }
  slug: any
  author: {
    _id: string
    name: string
  }
  category: string
  content?: {
    en?: { verse: string; meaning: string }[]
    hi?: { verse: string; meaning: string }[]
    ur?: { verse: string; meaning: string }[]
  }
  readListCount: number
  viewsCount: number
}

interface Author {
  _id: string
  name: string
  slug: string
  image?: string
  bio?: string
}

interface RelatedPoemsProps {
  currentPoem: Poem
  language: "en" | "hi" | "ur"
  hideTitle?: boolean
  readList?: string[]
  handleReadlistToggle: (id: string, title: string) => void
}

interface RelatedPoemsData {
  byCategory: Poem[]
  byAuthor: Poem[]
}

export default function RelatedPoems({
  currentPoem,
  language,
  hideTitle = false,
  readList = [],
  handleReadlistToggle,
}: RelatedPoemsProps) {
  const [relatedPoems, setRelatedPoems] = useState<RelatedPoemsData>({
    byCategory: [],
    byAuthor: [],
  })
  const [loading, setLoading] = useState(true)
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({})

  useEffect(() => {
    const fetchRelatedPoems = async () => {
      try {
        const res = await fetch(
          `/api/related-poems?category=${encodeURIComponent(
            currentPoem.category,
          )}&authorId=${currentPoem.author._id}&lang=${language}&excludeId=${currentPoem._id}`,
          {
            credentials: "include",
          },
        )
        if (!res.ok) throw new Error("Failed to fetch related poems")
        const data = await res.json()
        setRelatedPoems({
          byCategory: data.byCategory || [],
          byAuthor: data.byAuthor || [],
        })
      } catch (error) {
        console.error("Error fetching related poems:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedPoems()
  }, [currentPoem, language])

  useEffect(() => {
    const fetchAuthorsData = async () => {
      const poems = [...relatedPoems.byCategory, ...relatedPoems.byAuthor]
      const authorIds = [...new Set(poems.map((poem) => poem.author._id))].filter(Boolean)
      const authorDataMap: Record<string, Author> = {}

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, {
              credentials: "include",
            })
            if (!res.ok) return
            const data = await res.json()
            if (data.author) authorDataMap[authorId] = data.author
          } catch (error) {
            console.error(`RelatedPoems - Error fetching author ${authorId}:`, error)
          }
        }),
      )

      setAuthorDataMap(authorDataMap)
    }

    if (relatedPoems.byCategory.length > 0 || relatedPoems.byAuthor.length > 0) fetchAuthorsData()
  }, [relatedPoems])

  const getSlug = (poem: Poem) => {
    return Array.isArray(poem.slug)
      ? poem.slug.find((s) => s[language])?.[language] || poem.slug[0].en
      : poem.slug[language] || poem.slug.en
  }

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          <Skeleton className="h-36 rounded-md" />
          <Skeleton className="h-36 rounded-md" />
        </div>
      </div>
    )
  }

  if (relatedPoems.byCategory.length === 0 && relatedPoems.byAuthor.length === 0) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  const renderPoemCard = (poem: Poem, index: number) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null
    const currentSlug = getSlug(poem)
    const currentTitle = poem.title[language] || poem.title.en || "Untitled"
    const isInReadlist = readList?.includes(poem._id) || false

    return (
      <motion.article key={poem._id} variants={item} className="h-full">
        <Card className="border border-amber-200/60 dark:border-amber-700/20 shadow-sm hover:shadow-md transition-all duration-300 h-full bg-gradient-to-br from-amber-50/80 via-white to-amber-50/80 dark:from-amber-950/80 dark:via-slate-950 dark:to-amber-950/80 overflow-hidden group">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border-2 border-amber-200 dark:border-amber-700">
                  {authorData?.image ? (
                    <AvatarImage
                      src={authorData.image || "/placeholder.svg"}
                      alt={authorData.name || poem.author.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className={`text-amber-600 dark:text-amber-400 text-xs ${language === "ur" ? "urdu-text" : ""}`}>
                  {authorData?.name || poem.author.name || "Unknown Author"}
                </p>
              </div>
              <motion.button
                onClick={() => handleReadlistToggle(poem._id, currentTitle)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-1"
                aria-label={isInReadlist ? "Remove from readlist" : "Add to readlist"}
              >
                <Heart className={`h-5 w-5 ${isInReadlist ? "text-amber-500 fill-amber-500" : "text-amber-500"}`} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 pb-2">
            <Link href={`/poems/${language}/${currentSlug}`} className="block">
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-3 border border-amber-200/40 dark:border-amber-700/20 shadow-inner backdrop-blur-sm">
                <h2
                  className={`text-sm font-bold text-amber-800 dark:text-amber-200 hover:underline ${
                    language === "ur" ? "urdu-text" : ""
                  }`}
                >
                  {currentTitle}
                </h2>
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs bg-white/80 dark:bg-slate-900/80 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 text-xs bg-white/80 dark:bg-slate-900/80 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300"
              >
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className="text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-100 flex items-center gap-1 text-xs font-medium"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href={`/poems/${language}/${currentSlug}`}>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.article>
    )
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-amber-950 dark:via-slate-950 dark:to-amber-950 rounded-xl border border-amber-200/60 dark:border-amber-700/20 shadow-lg overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-300 to-yellow-200 dark:from-amber-700 dark:to-yellow-600 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-yellow-200 to-amber-300 dark:from-yellow-600 dark:to-amber-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col relative z-10">
          {!hideTitle && (
            <div className="mb-4">
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 via-transparent to-yellow-200/30 dark:from-amber-800/30 dark:to-yellow-800/30 skew-x-12 rounded-lg -z-10"></div>
                <div className="py-2 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 shadow-sm">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold font-serif text-amber-800 dark:text-amber-300">
                      Related Poems
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 backdrop-blur-sm text-amber-700 dark:text-amber-300 border border-amber-300/30 dark:border-yellow-600/30 shadow-sm">
                    <Sparkles className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                    <span className="text-[10px] sm:text-xs font-medium">Discover More</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {relatedPoems.byCategory.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 via-transparent to-yellow-200/30 dark:from-amber-800/30 dark:to-yellow-800/30 skew-x-12 rounded-lg -z-10"></div>
                  <div className="py-2 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 shadow-sm">
                        <Tag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold font-serif text-amber-800 dark:text-amber-300">
                        More in {currentPoem.category}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {relatedPoems.byCategory.slice(0, 3).map((poem, index) => renderPoemCard(poem, index))}
              </motion.div>
            </div>
          )}

          {relatedPoems.byAuthor.length > 0 && (
            <div>
              <div className="mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 via-transparent to-yellow-200/30 dark:from-amber-800/30 dark:to-yellow-800/30 skew-x-12 rounded-lg -z-10"></div>
                  <div className="py-2 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 shadow-sm">
                        <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold font-serif text-amber-800 dark:text-amber-300">
                        More by {currentPoem.author.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {relatedPoems.byAuthor.slice(0, 3).map((poem, index) => renderPoemCard(poem, index))}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

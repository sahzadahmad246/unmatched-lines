"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Poem } from "@/types/poem"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Feather, User, BookOpen, Quote, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CoverImage {
  _id: string
  url: string
  uploadedBy: { name: string }
  createdAt: string
}

interface Author {
  _id: string
  name: string
  slug: string
  image?: string
  bio?: string
}

interface CategoryPoemsByAuthorProps {
  poems: Poem[]
  category: string
  author: { name: string; slug: string; _id?: string }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function CategoryPoemsByAuthor({ poems, category, author }: CategoryPoemsByAuthorProps) {
  const [coverImages, setCoverImages] = useState<CoverImage[]>([])
  const [loading, setLoading] = useState(true)
  const [authorData, setAuthorData] = useState<Author | null>(null)
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1)
  const isSherCategory = category.toLowerCase() === "sher"

  useEffect(() => {
    const fetchCoverImages = async () => {
      try {
        const res = await fetch("/api/cover-images", {
          credentials: "include",
          cache: "force-cache",
        })
        if (!res.ok) throw new Error("Failed to fetch cover images")
        const data = await res.json()
        setCoverImages(data.coverImages || [])
      } catch (error) {
        console.error("Error fetching cover images:", error)
        setCoverImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchCoverImages()
  }, [])

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (author?._id) {
        try {
          const res = await fetch(`/api/authors/${author._id}`, {
            credentials: "include",
          })
          if (!res.ok) throw new Error("Failed to fetch author data")
          const data = await res.json()
          setAuthorData(data.author)
        } catch (error) {
          console.error("Error fetching author data:", error)
        }
      } else if (author?.slug) {
        try {
          const res = await fetch(`/api/authors?slug=${author.slug}`, {
            credentials: "include",
          })
          if (!res.ok) throw new Error("Failed to fetch author data")
          const data = await res.json()
          setAuthorData(data.author)
        } catch (error) {
          console.error("Error fetching author data:", error)
        }
      }
    }

    fetchAuthorData()
  }, [author])

  const coverImageUrl =
    coverImages.length > 0 ? coverImages[Math.floor(Math.random() * coverImages.length)].url : "/default-poem-image.jpg"

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <Feather className="h-12 w-12 text-primary/70" />
          </motion.div>
          <p className="text-primary/70 animate-pulse">Loading poems...</p>
        </motion.div>
      </div>
    )
  }

  const getEnglishSlug = (slug: Poem["slug"]): string => {
    if (Array.isArray(slug)) {
      return slug.find((s) => s.en)?.en || slug[0]?.en || ""
    }
    return slug?.en || ""
  }

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <div className="text-muted-foreground italic text-xs">Content not available</div>
    }

    // For sher, we want to display the full content (typically just one verse/two lines)
    if (isSherCategory) {
      return (
        <div className="space-y-1">
          {content[0].split("\n").map((line, lineIndex) => (
            <div key={lineIndex} className="poem-line leading-relaxed text-sm font-serif">
              {line || "\u00A0"}
            </div>
          ))}
        </div>
      )
    }

    // For other categories, display the first verse
    return (
      <div className="space-y-1">
        {content[0].split("\n").map((line, lineIndex) => (
          <div key={lineIndex} className="poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1">
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Category Header */}
      <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-12">
        <Card className="overflow-hidden border shadow-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="relative p-0">
            <motion.div
              className="h-48 md:h-64 relative"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                backgroundImage: `url(${coverImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-full"
                >
                  <Feather className="h-16 w-16 text-white" />
                </motion.div>
              </div>
            </motion.div>
            <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-8">
              <motion.div
                className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <BookOpen className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.div className="flex flex-col items-center gap-2 mt-4">
                <h1 className="text-2xl md:text-4xl font-bold text-center font-serif">
                  {displayCategory} by {author.name}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    {authorData?.image ? (
                      <AvatarImage src={authorData.image} alt={authorData.name || author.name} />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{authorData?.name || author.name}</span>
                </div>

                <motion.div
                  className="w-24 h-1 bg-primary/60 mx-auto mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: "6rem" }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              </motion.div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Poem List */}
      {poems.length === 0 ? (
        <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="text-center py-12">
          <Quote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-serif italic">
            No {displayCategory.toLowerCase()} poems found by {author.name}.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {poems.map((poem, index) => {
            return (
              <motion.article key={poem._id} variants={slideUp} className="h-full">
                <Link href={`/poems/en/${getEnglishSlug(poem.slug)}`} className="block h-full">
                  <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group">
                    <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
                      {!isSherCategory && (
                        <h2 className="text-lg font-semibold text-primary hover:text-primary/80 font-serif group-hover:underline decoration-dotted underline-offset-4">
                          {poem.title.en || "Untitled"}
                        </h2>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6 border border-primary/20">
                          {authorData?.image ? (
                            <AvatarImage src={authorData.image} alt={authorData.name || poem.author.name} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          {poem.author.name || "Unknown Author"}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <div
                        className={`${isSherCategory ? "mt-2" : "mt-0"} font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1`}
                      >
                        {formatPoetryContent(poem.content?.en)}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <Badge variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors">
                        {poem.category || "Uncategorized"}
                      </Badge>

                      <motion.div
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        Read <ArrowRight className="h-3 w-3 ml-1" />
                      </motion.div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.article>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}


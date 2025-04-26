"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Quote, ArrowRight, Heart, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Poem {
  _id: string
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string; slug?: string }
  category: string
  content?: {
    en?: { verse: string; meaning: string }[]
    hi?: { verse: string; meaning: string }[]
    ur?: { verse: string; meaning: string }[]
  }
  slug: { en: string; hi?: string; ur?: string }
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

interface FeaturedCollectionProps {
  ghazals: Poem[]
  shers: Poem[]
  nazms?: Poem[] // Added nazms as optional
  readList: string[]
  handleReadlistToggle: (id: string, title: string) => void
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

const customStyles = `
  .urdu-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
    direction: rtl;
    text-align: center;
    line-height: 1.8;
    font-size: 0.95rem;
  }
  
  .poem-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .poem-card-content {
    flex-grow: 1;
  }
  
  .category-section {
    margin-bottom: 2.5rem;
  }
  
  .category-section:last-child {
    margin-bottom: 0;
  }
  
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .category-title {
    font-size: 1.25rem;
    font-weight: 600;
    font-family: serif;
  }
  
  .category-link {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: var(--primary);
    transition: all 0.2s;
  }
  
  .category-link:hover {
    opacity: 0.8;
    transform: translateX(2px);
  }
`

export function FeaturedCollection({
  ghazals,
  shers,
  nazms = [],
  readList,
  handleReadlistToggle,
}: FeaturedCollectionProps) {
  const [language, setLanguage] = useState<"en" | "hi" | "ur">("en")
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({})

  // Fetch author data
  useEffect(() => {
    const fetchAuthorsData = async () => {
      const poems = [...ghazals, ...shers, ...nazms]
      const authorIds = [...new Set(poems.map((poem) => poem.author._id))].filter(Boolean)
      const authorDataMap: Record<string, Author> = {}

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, { credentials: "include" })
            if (!res.ok) return
            const data = await res.json()
            if (data.author) authorDataMap[authorId] = data.author
          } catch (error) {
            console.error(`FeaturedCollection - Error fetching author ${authorId}:`, error)
          }
        }),
      )

      setAuthorDataMap(authorDataMap)
    }

    if (ghazals.length > 0 || shers.length > 0 || nazms.length > 0) fetchAuthorsData()
  }, [ghazals, shers, nazms])

  const formatPoetryContent = (
    content: { verse: string; meaning: string }[] | undefined,
    lang: "en" | "hi" | "ur",
    isSherCategory: boolean,
  ): React.ReactNode => {
    if (!content || content.length === 0 || !content[0]?.verse) {
      return (
        <div className={`text-muted-foreground italic text-xs ${lang === "ur" ? "urdu-text" : ""}`}>
          {lang === "en" ? "Content not available" : lang === "hi" ? "सामग्री उपलब्ध नहीं है" : "مواد دستیاب نہیں ہے"}
        </div>
      )
    }

    const lines = content[0].verse.split("\n").filter(Boolean)
    if (lines.length === 0) {
      return (
        <div className={`text-muted-foreground italic text-xs ${lang === "ur" ? "urdu-text" : ""}`}>
          {lang === "en" ? "Content not available" : lang === "hi" ? "सामग्री उपलब्ध नहीं है" : "مواد دستیاب نہیں ہے"}
        </div>
      )
    }

    if (isSherCategory) {
      return (
        <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
          {lines.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className={`poem-line leading-relaxed text-sm font-serif ${lang === "ur" ? "urdu-text" : ""}`}
            >
              {line || "\u00A0"}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
        {lines.slice(0, 2).map((line, lineIndex) => (
          <div
            key={lineIndex}
            className={`poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1 ${lang === "ur" ? "urdu-text" : ""}`}
          >
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    )
  }

  // Group poems by category
  const categories = [
    { id: "ghazal", title: "Ghazals", poems: ghazals },
    { id: "sher", title: "Shers", poems: shers },
    ...(nazms.length > 0 ? [{ id: "nazm", title: "Nazms", poems: nazms }] : []),
  ]

  const renderPoemCard = (poem: Poem, index: number) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null
    const currentSlug = poem.slug[language] || poem.slug.en || poem._id
    const currentTitle = poem.title[language] || poem.title.en || "Untitled"
    const currentContent = poem.content?.[language] || poem.content?.en || []
    const poemLanguage = poem.content?.[language] ? language : "en"
    const isInReadlist = readList.includes(poem._id)
    const isSherCategory = poem.category.toLowerCase() === "sher"

    return (
      <motion.article key={poem._id} variants={slideUp} className="h-full">
        <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
          <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {!isSherCategory && (
                  <h2
                    className={`text-lg font-semibold text-primary hover:text-primary/80 font-serif group-hover:underline decoration-dotted underline-offset-4 ${language === "ur" ? "urdu-text" : ""}`}
                  >
                    <Link href={`/poems/${poemLanguage}/${currentSlug}`}>{currentTitle}</Link>
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6 border border-primary/20">
                    {authorData?.image ? (
                      <AvatarImage
                        src={authorData.image || "/placeholder.svg"}
                        alt={authorData.name || poem.author.name}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className={`text-gray-600 dark:text-gray-400 text-xs ${language === "ur" ? "urdu-text" : ""}`}>
                    {authorData?.name || poem.author.name || "Unknown Author"}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => handleReadlistToggle(poem._id, currentTitle)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-1"
                aria-label={isInReadlist ? "Remove from readlist" : "Add to readlist"}
              >
                <Heart className={`h-5 w-5 ${isInReadlist ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 poem-card-content">
            <Link href={`/poems/${poemLanguage}/${currentSlug}`} className="block">
              <div
                className={`${isSherCategory ? "mt-2" : "mt-0"} font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1`}
              >
                {formatPoetryContent(currentContent, poemLanguage, isSherCategory)}
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs bg-primary/5 hover:bg-primary/10 transition-colors ${language === "ur" ? "urdu-text" : ""}`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs bg-primary/5 hover:bg-primary/10 transition-colors">
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href={`/poems/${poemLanguage}/${currentSlug}`}>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.article>
    )
  }

  return (
    <>
      <style>{customStyles}</style>
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center font-serif header-title">
              Featured Collections
            </h2>
            <motion.div
              className="w-24 h-1 bg-primary/60 mx-auto mt-2"
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </motion.div>

          <Tabs defaultValue="en" onValueChange={(value) => setLanguage(value as "en" | "hi" | "ur")} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">Hindi</TabsTrigger>
              <TabsTrigger value="ur">Urdu</TabsTrigger>
            </TabsList>
          </Tabs>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="category-section">
                <div className="category-header">
                  <h3 className="category-title">{category.title}</h3>
                  <Link href={`/${category.id}`} className="category-link">
                    <span>See all</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                {category.poems.length === 0 ? (
                  <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="text-center py-6">
                    <Quote className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                    <p className={`text-gray-600 text-base font-serif italic ${language === "ur" ? "urdu-text" : ""}`}>
                      {language === "en"
                        ? "No poems found in this category."
                        : language === "hi"
                          ? "इस श्रेणी में कोई कविता नहीं मिली।"
                          : "اس زمرے میں کوئی نظم نہیں ملی۔"}
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {category.poems.slice(0, 3).map((poem, index) => renderPoemCard(poem, index))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          <div className="flex justify-center mt-10">
            <Button asChild size="sm" variant="outline" className="gap-2 font-serif text-xs sm:text-sm">
              <Link href="/library">
                View All Poems
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Quote, ArrowRight, Heart, Eye, ChevronRight, Sparkles } from "lucide-react"
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
`

export default function FeaturedCollection({
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

  // Define color schemes for categories
  const categoryColors = [
    {
      name: "purple-pink",
      gradient: "from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950",
      border: "border-purple-200/60 dark:border-pink-700/20",
      text: "text-purple-700 dark:text-pink-300",
      hover: "hover:bg-purple-50 dark:hover:bg-pink-950/50 hover:text-purple-800 dark:hover:text-pink-200",
      fill: "fill-purple-500 dark:fill-pink-500 text-purple-500 dark:text-pink-500",
      avatarBorder: "border-purple-200 dark:border-pink-700",
      avatarBg:
        "from-purple-100 via-fuchsia-100 to-pink-100 dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900",
      headerBg:
        "from-purple-200/30 via-fuchsia-200/30 to-pink-200/30 dark:from-purple-800/30 dark:via-fuchsia-800/30 dark:to-pink-800/30",
      buttonBg: "bg-white/80 dark:bg-slate-900/80 border-purple-200 dark:border-pink-800/40",
      badgeBg: "bg-white/80 dark:bg-slate-900/80 border-purple-200/40 dark:border-pink-700/20",
    },
    {
      name: "amber-orange",
      gradient: "from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950",
      border: "border-amber-200/60 dark:border-orange-700/20",
      text: "text-amber-700 dark:text-orange-300",
      hover: "hover:bg-amber-50 dark:hover:bg-orange-950/50 hover:text-amber-800 dark:hover:text-orange-200",
      fill: "fill-amber-500 dark:fill-orange-500 text-amber-500 dark:text-orange-500",
      avatarBorder: "border-amber-200 dark:border-orange-700",
      avatarBg:
        "from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900",
      headerBg:
        "from-amber-200/30 via-yellow-200/30 to-orange-200/30 dark:from-amber-800/30 dark:via-yellow-800/30 dark:to-orange-800/30",
      buttonBg: "bg-white/80 dark:bg-slate-900/80 border-amber-200 dark:border-orange-800/40",
      badgeBg: "bg-white/80 dark:bg-slate-900/80 border-amber-200/40 dark:border-orange-700/20",
    },
    {
      name: "emerald-teal",
      gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950",
      border: "border-emerald-200/60 dark:border-teal-700/20",
      text: "text-emerald-700 dark:text-teal-300",
      hover: "hover:bg-emerald-50 dark:hover:bg-teal-950/50 hover:text-emerald-800 dark:hover:text-teal-200",
      fill: "fill-emerald-500 dark:fill-teal-500 text-emerald-500 dark:text-teal-500",
      avatarBorder: "border-emerald-200 dark:border-teal-700",
      avatarBg: "from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900",
      headerBg:
        "from-emerald-200/30 via-green-200/30 to-teal-200/30 dark:from-emerald-800/30 dark:via-green-800/30 dark:to-teal-800/30",
      buttonBg: "bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-teal-800/40",
      badgeBg: "bg-white/80 dark:bg-slate-900/80 border-emerald-200/40 dark:border-teal-700/20",
    },
  ]

  const renderPoemCard = (poem: Poem, index: number, categoryIndex: number) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null
    const currentSlug = poem.slug[language] || poem.slug.en || poem._id
    const currentTitle = poem.title[language] || poem.title.en || "Untitled"
    const currentContent = poem.content?.[language] || poem.content?.en || []
    const poemLanguage = poem.content?.[language] ? language : "en"
    const isInReadlist = readList.includes(poem._id)
    const isSherCategory = poem.category.toLowerCase() === "sher"

    // Alternate colors within each category
    const colorIndex = index % 2 === 0 ? categoryIndex : (categoryIndex + 1) % 3
    const colorScheme = categoryColors[colorIndex]

    return (
      <motion.article key={poem._id} variants={slideUp} className="h-full">
        <Card
          className={`border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br ${colorScheme.gradient} ${colorScheme.border} overflow-hidden group poem-card`}
        >
          <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {!isSherCategory && (
                  <h2
                    className={`text-lg font-semibold ${colorScheme.text} hover:opacity-80 font-serif group-hover:underline decoration-dotted underline-offset-4 ${language === "ur" ? "urdu-text" : ""}`}
                  >
                    <Link href={`/poems/${poemLanguage}/${currentSlug}`}>{currentTitle}</Link>
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Avatar
                    className={`h-6 w-6 border-2 ${colorScheme.avatarBorder} ring-1 ring-white dark:ring-slate-950`}
                  >
                    {authorData?.image ? (
                      <AvatarImage
                        src={authorData.image || "/placeholder.svg"}
                        alt={authorData.name || poem.author.name}
                      />
                    ) : (
                      <AvatarFallback className={`bg-gradient-to-br ${colorScheme.avatarBg} ${colorScheme.text}`}>
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
                <Heart className={`h-5 w-5 ${isInReadlist ? colorScheme.fill : "text-gray-500"}`} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 poem-card-content">
            <Link href={`/poems/${poemLanguage}/${currentSlug}`} className="block">
              <div
                className={`${isSherCategory ? "mt-2" : "mt-0"} font-serif text-gray-800 dark:text-gray-200 bg-gradient-to-r ${colorScheme.headerBg} rounded-lg p-3`}
              >
                {formatPoetryContent(currentContent, poemLanguage, isSherCategory)}
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${colorScheme.badgeBg} ${colorScheme.text} ${language === "ur" ? "urdu-text" : ""}`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge variant="outline" className={`gap-1 text-xs ${colorScheme.badgeBg} ${colorScheme.text}`}>
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className={`${colorScheme.text} hover:opacity-80 flex items-center gap-1 text-xs font-medium`}
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
      <section className="py-10 sm:py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300 via-fuchsia-300 to-pink-300 dark:from-purple-700 dark:via-fuchsia-700 dark:to-pink-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-300 via-yellow-300 to-orange-300 dark:from-amber-700 dark:via-yellow-700 dark:to-orange-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-1/2 right-1/4 w-48 h-48 bg-gradient-to-bl from-emerald-300 via-green-300 to-teal-300 dark:from-emerald-700 dark:via-green-700 dark:to-teal-700 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-amber-200/30 to-emerald-200/30 dark:from-purple-800/30 dark:via-amber-800/30 dark:to-emerald-800/30 skew-x-12 rounded-lg -z-10"></div>
              <div className="py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 via-amber-100 to-emerald-100 dark:from-purple-900 dark:via-amber-900 dark:to-emerald-900 shadow-sm">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-amber-600 to-emerald-600 dark:from-purple-400 dark:via-amber-400 dark:to-emerald-400">
                    Featured Collections
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-emerald-500/10 dark:from-purple-500/20 dark:via-amber-500/20 dark:to-emerald-500/20 backdrop-blur-sm text-purple-700 dark:text-amber-300 border border-purple-300/30 dark:border-amber-600/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-[10px] sm:text-xs font-medium">Daily Inspiration</span>
                </div>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="en" onValueChange={(value) => setLanguage(value as "en" | "hi" | "ur")} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/80 dark:bg-slate-900/80 border border-purple-200/40 dark:border-amber-700/20 shadow-sm">
              <TabsTrigger
                value="en"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:via-amber-100 data-[state=active]:to-emerald-100 data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:via-amber-900/50 data-[state=active]:dark:to-emerald-900/50 data-[state=active]:text-purple-700 data-[state=active]:dark:text-amber-300"
              >
                English
              </TabsTrigger>
              <TabsTrigger
                value="hi"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:via-amber-100 data-[state=active]:to-emerald-100 data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:via-amber-900/50 data-[state=active]:dark:to-emerald-900/50 data-[state=active]:text-purple-700 data-[state=active]:dark:text-amber-300"
              >
                Hindi
              </TabsTrigger>
              <TabsTrigger
                value="ur"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:via-amber-100 data-[state=active]:to-emerald-100 data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:via-amber-900/50 data-[state=active]:dark:to-emerald-900/50 data-[state=active]:text-purple-700 data-[state=active]:dark:text-amber-300"
              >
                Urdu
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-12">
            {categories.map((category, categoryIndex) => {
              return (
                <div key={category.id} className="category-section">
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${
                        categoryIndex === 0
                          ? "from-purple-200/30 via-fuchsia-200/30 to-pink-200/30 dark:from-purple-800/30 dark:via-fuchsia-800/30 dark:to-pink-800/30"
                          : categoryIndex === 1
                            ? "from-amber-200/30 via-yellow-200/30 to-orange-200/30 dark:from-amber-800/30 dark:via-yellow-800/30 dark:to-orange-800/30"
                            : "from-emerald-200/30 via-green-200/30 to-teal-200/30 dark:from-emerald-800/30 dark:via-green-800/30 dark:to-teal-800/30"
                      }`}
                    >
                      <h3
                        className={`text-lg font-semibold font-serif ${
                          categoryIndex === 0
                            ? "text-purple-700 dark:text-pink-300"
                            : categoryIndex === 1
                              ? "text-amber-700 dark:text-orange-300"
                              : "text-emerald-700 dark:text-teal-300"
                        }`}
                      >
                        {category.title}
                      </h3>
                    </div>
                    <Link
                      href={`/${category.id}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full ${
                        categoryIndex === 0
                          ? "bg-white/80 dark:bg-slate-900/80 border border-purple-200/40 dark:border-pink-700/20 text-purple-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-pink-950/50"
                          : categoryIndex === 1
                            ? "bg-white/80 dark:bg-slate-900/80 border border-amber-200/40 dark:border-orange-700/20 text-amber-700 dark:text-orange-300 hover:bg-amber-50 dark:hover:bg-orange-950/50"
                            : "bg-white/80 dark:bg-slate-900/80 border border-emerald-200/40 dark:border-teal-700/20 text-emerald-700 dark:text-teal-300 hover:bg-emerald-50 dark:hover:bg-teal-950/50"
                      } shadow-sm transition-all duration-200 text-xs font-medium`}
                    >
                      <span>See all</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {category.poems.length === 0 ? (
                    <motion.div
                      initial={fadeIn.hidden}
                      animate={fadeIn.visible}
                      className="text-center py-8 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-700/20 shadow-sm"
                    >
                      <Quote className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <p
                        className={`text-gray-600 dark:text-gray-400 text-base font-serif italic ${language === "ur" ? "urdu-text" : ""}`}
                      >
                        {language === "en"
                          ? "No poems found in this category."
                          : language === "hi"
                            ? "इस श्रेणी में कोई कविता नहीं मिली।"
                            : "اس زمرے میں کوئی نظم نہیں ملی۔"}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {category.poems.slice(0, 3).map((poem, index) => renderPoemCard(poem, index, categoryIndex))}
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>

          <div className="flex justify-center mt-10">
            <Button
              asChild
              size="lg"
              className="gap-2 font-serif text-sm bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-emerald-500/10 dark:from-purple-500/20 dark:via-amber-500/20 dark:to-emerald-500/20 backdrop-blur-sm text-purple-700 dark:text-amber-300 border border-purple-300/30 dark:border-amber-600/30 hover:bg-purple-50 dark:hover:bg-amber-950/50 hover:text-purple-800 dark:hover:text-amber-200"
            >
              <Link href="/library">
                View All Poems
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

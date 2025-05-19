"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, ArrowRight, Sparkles, BookOpen, FileText, BookMarked, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PoemListItem } from "../poems/poem-list-item"
import { useStore } from "@/lib/store"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
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

export default function FeaturedCollection() {
  const { poems, coverImages, readList, loading, error, nextCursor, hasMore, fetchPoems, fetchPoets, toggleReadList } =
    useStore()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)

  // Filter poems by category
  const ghazals = poems.filter((poem) => poem.category.toLowerCase() === "ghazal").slice(0, 3)
  const shers = poems.filter((poem) => poem.category.toLowerCase() === "sher").slice(0, 3)
  const nazms = poems.filter((poem) => poem.category.toLowerCase() === "nazm").slice(0, 3)

  // Debug categories
  useEffect(() => {
    console.log("Poems:", poems)
    console.log("Categories:", { ghazals, shers, nazms })
    console.log("Unique categories:", [...new Set(poems.map((p) => p.category))])
  }, [poems, ghazals, shers, nazms])

  // Initial data fetch
  useEffect(() => {
    fetchPoems({ limit: 12, reset: true })
    fetchPoets()
  }, [fetchPoems, fetchPoets])

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          setIsVisible(true)
          isFetchingRef.current = true
          fetchPoems({ lastId: nextCursor, limit: 12 }).finally(() => {
            isFetchingRef.current = false
          })
        }
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [hasMore, nextCursor, fetchPoems])

  // Random cover image
  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg?height=300&width=300"
    const randomIndex = Math.floor(Math.random() * coverImages.length)
    return coverImages[randomIndex].url
  }

  const categories = [
    { id: "ghazal", title: "Ghazals", poems: ghazals },
    { id: "sher", title: "Shers", poems: shers },
    ...(nazms.length > 0 ? [{ id: "nazm", title: "Nazms", poems: nazms }] : []),
  ]

  if (loading && poems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 text-center"
      >
        <Quote className="h-8 w-8 mx-auto text-zinc-500 dark:text-zinc-400 mb-3" />
        <p className="text-zinc-700 dark:text-zinc-300 text-base font-serif">
          Failed to load featured collections. Please try again.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => fetchPoems({ limit: 12, reset: true })}
        >
          Try Again
        </Button>
      </motion.div>
    )
  }

  return (
    <section ref={sectionRef} className="py-0 sm:py-10 sm:py-16 relative">
      <div className="container mx-auto px-0 sm:px-4 relative z-10">
        <div className="bg-white dark:bg-black sm:border border-zinc-200 dark:border-zinc-800 sm:shadow-lg overflow-hidden relative p-6 sm:p-8">
          <div className="hidden sm:block absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-black dark:bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black dark:bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <motion.div
            initial={fadeIn.hidden}
            animate={isVisible ? fadeIn.visible : fadeIn.hidden}
            className="mb-8 relative z-10"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-transparent to-zinc-100 dark:from-zinc-900 dark:to-zinc-900 skew-x-12 rounded-lg -z-10"></div>
              <div className="py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                    <BookOpen className="h-3.5 w-3.5 text-black dark:text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold font-serif text-black dark:text-white">
                    Featured Collections
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-zinc-950 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Sparkles className="h-3 w-3 text-black dark:text-white" />
                  <span className="text-[10px] sm:text-xs font-medium">Daily Inspiration</span>
                </div>
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="space-y-12"
            >
              <AnimatePresence>
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="mb-12 last:mb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-transparent to-zinc-100 dark:from-zinc-900 dark:to-zinc-900 skew-x-12 rounded-lg -z-10"></div>
                        <div className="py-2 px-4 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                            {category.id === "ghazal" ? (
                              <BookMarked className="h-3.5 w-3.5 text-black dark:text-white" />
                            ) : category.id === "sher" ? (
                              <FileText className="h-3.5 w-3.5 text-black dark:text-white" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-black dark:text-white" />
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold font-serif text-black dark:text-white">
                            {category.title}
                          </h3>
                        </div>
                      </div>
                      <Link
                        href={`/${category.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm transition-all duration-200 text-xs font-medium"
                      >
                        <span>See all</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {category.poems.length === 0 ? (
                      <motion.div
                        initial={fadeIn.hidden}
                        animate={fadeIn.visible}
                        className="text-center py-8 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                      >
                        <Quote className="h-8 w-8 mx-auto text-zinc-500 dark:text-zinc-400 mb-3" />
                        <p className="text-zinc-700 dark:text-zinc-300 text-base font-serif italic">
                          No poems found in this category.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {category.poems.map((poem) => {
                          const englishSlug = poem.slug.en || poem._id
                          const isInReadlist = readList.includes(poem._id)
                          const poemTitle = poem.title.en || "Untitled"
                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <PoemListItem
                                poem={poem}
                                coverImage={getRandomCoverImage()}
                                englishSlug={englishSlug}
                                isInReadlist={isInReadlist}
                                poemTitle={poemTitle}
                                handleReadlistToggle={toggleReadList}
                              />
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="flex justify-center mt-10">
              <Button
                asChild
                size="lg"
                className="gap-2 font-serif text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Link href="/library">
                  View All Poems
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

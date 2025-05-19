"use client"

import { useEffect, useRef, useState } from "react"
import type { Poem } from "@/types/poem"
import { Quote, Feather, ChevronRight, ChevronLeft, User, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PoemListItem } from "./poem-list-item"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface CoverImage {
  _id: string
  url: string
  uploadedBy: { name: string }
  createdAt: string
}

interface CategoryPoemsProps {
  initialPoems: Poem[]
  category: string
  initialMeta: { page: number; total: number; pages: number; hasMore: boolean }
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

const poetCardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  hover: { y: -5, transition: { duration: 0.2 } },
}

export default function CategoryPoems({ initialPoems, category, initialMeta }: CategoryPoemsProps) {
  const {
    categoryPoems,
    categoryMeta,
    coverImages,
    loading,
    fetchPoemsByCategory,
    fetchCoverImages,
    toggleReadList,
    readList,
    authors,
    fetchAuthor,
  } = useStore()

  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1)
  const sectionRef = useRef<HTMLDivElement>(null)
  const poetsScrollRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const [relevantPoets, setRelevantPoets] = useState<any[]>([])
  const [isPoetLoading, setIsPoetLoading] = useState(true)
  const [isPoemLoading, setIsPoemLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Initialize Zustand with server data
  useEffect(() => {
    setIsPoemLoading(true)
    fetchPoemsByCategory({
      category,
      page: initialMeta.page,
      limit: 10,
      reset: true,
    }).finally(() => {
      setIsPoemLoading(false)
    })
    fetchCoverImages()
  }, [category, initialMeta, fetchPoemsByCategory, fetchCoverImages])

  // Extract poet IDs from poems and fetch poet data
  useEffect(() => {
    const poems = categoryPoems[category] || initialPoems

    // Extract unique poet IDs from poems
    const poetIds = Array.from(new Set(poems.map((poem) => poem.author?._id).filter(Boolean)))

    // Fetch poet data for each ID
    const fetchPoets = async () => {
      setIsPoetLoading(true)
      const fetchedPoets = []
      for (const poetId of poetIds) {
        await fetchAuthor(poetId)
        const poet = authors[poetId]
        if (poet) {
          fetchedPoets.push(poet)
        }
      }
      setRelevantPoets(fetchedPoets)
      setIsPoetLoading(false)
    }

    if (poetIds.length > 0) {
      fetchPoets()
    } else {
      setRelevantPoets([])
      setIsPoetLoading(false)
    }
  }, [categoryPoems, initialPoems, category, fetchAuthor, authors])

  // Lazy loading for poems
  useEffect(() => {
    const meta = categoryMeta[category] || initialMeta
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta.hasMore && !isFetchingRef.current) {
          isFetchingRef.current = true
          fetchPoemsByCategory({ category, page: meta.page + 1, limit: 10 }).finally(() => {
            isFetchingRef.current = false
          })
        }
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [category, categoryMeta, initialMeta, fetchPoemsByCategory])

  const poems = categoryPoems[category] || initialPoems
  const coverImageUrl =
    coverImages.length > 0 ? coverImages[Math.floor(Math.random() * coverImages.length)].url : "/default-poem-image.jpg"

  // Scroll handlers for poet carousel
  const scrollLeft = () => {
    if (poetsScrollRef.current) {
      poetsScrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
      setScrollPosition(poetsScrollRef.current.scrollLeft - 300)
    }
  }

  const scrollRight = () => {
    if (poetsScrollRef.current) {
      poetsScrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
      setScrollPosition(poetsScrollRef.current.scrollLeft + 300)
    }
  }

  // Check if we need to show scroll buttons
  const handleScroll = () => {
    if (poetsScrollRef.current) {
      setScrollPosition(poetsScrollRef.current.scrollLeft)
    }
  }

  // Main loading state
  if (loading && poems.length === 0 && relevantPoets.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="h-12 w-12 rounded-full border-2 border-t-black dark:border-t-white border-zinc-200 dark:border-zinc-800"
          />
          <p className="text-zinc-700 dark:text-zinc-300">Loading content...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Category Header */}
      <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-12">
        <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-black rounded-lg">
          <motion.div
            className="h-48 md:h-64 relative"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ backgroundImage: `url(${coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 flex items-center justify-center">
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
          <div className="relative bg-white dark:bg-black py-8">
            <motion.div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl md:text-4xl font-bold text-center font-serif mt-4 text-black dark:text-white">
                {displayCategory}
              </h1>
              <motion.div
                className="w-24 h-1 bg-black dark:bg-white mx-auto mt-2"
                initial={{ width: 0 }}
                animate={{ width: "6rem" }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Poet Cards Section - Horizontal Scrollable */}
      <motion.div className="mb-12" initial={fadeIn.hidden} animate={fadeIn.visible} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-black dark:text-white">
            Explore {displayCategory} by Poet
          </h2>

          {relevantPoets.length > 3 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={scrollLeft}
                disabled={scrollPosition <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isPoetLoading ? (
          <div className="flex gap-4 overflow-hidden pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-black"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="mt-4">
                  <Skeleton className="h-8 w-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : relevantPoets.length > 0 ? (
          <div
            ref={poetsScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {relevantPoets.map((poet) => (
              <motion.div
                key={poet._id}
                variants={poetCardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="flex-shrink-0 w-[280px] border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-black rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                      {poet.image ? (
                        <img
                          src={poet.image || "/placeholder.svg"}
                          alt={poet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-black dark:text-white">{poet.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {poet.poemCount || "Multiple"} {displayCategory}
                      </p>
                    </div>
                  </div>
                  <Link href={`/poets/${poet.slug || poet._id}/${category}`} className="block mt-4">
                    <motion.button
                      className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>View {displayCategory}</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </motion.div>

      {/* Poems Section */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-black dark:text-white mb-6">
          {displayCategory} Collection
        </h2>

        {isPoemLoading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-black"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="mb-4">
                  <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 mb-2" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : poems.length === 0 ? (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black"
          >
            <Quote className="h-12 w-12 mx-auto text-zinc-500 dark:text-zinc-400 mb-4" />
            <p className="text-zinc-700 dark:text-zinc-300 text-lg font-serif italic">
              No poems found in this category.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            ref={sectionRef}
          >
            <AnimatePresence>
              {poems.map((poem) => {
                const englishSlug = poem.slug.en || poem._id
                const poemTitle = poem.title.en || "Untitled"
                const isInReadlist = readList.includes(poem._id)
                return (
                  <motion.div
                    key={poem._id}
                    variants={slideUp}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PoemListItem
                      poem={poem}
                      coverImage={coverImageUrl}
                      englishSlug={englishSlug}
                      isInReadlist={isInReadlist}
                      poemTitle={poemTitle}
                      handleReadlistToggle={toggleReadList}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Add this to your global CSS or as a style tag
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }

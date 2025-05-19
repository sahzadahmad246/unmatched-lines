"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import {
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  BookText,
  X,
  Users,
  BookMarked,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LineOfTheDay } from "./line-of-the-day"
import { PoetCard } from "@/components/home/poet-card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { PoemListItem } from "./poem-list-item"
import type { Poem } from "@/types/poem"
import { useStore } from "@/lib/store"

interface CoverImage {
  _id: string
  url: string
  uploadedBy: { name: string }
  createdAt: string
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Custom debounce function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    clearTimeout(timeout)
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait)
    })
  }
}

export default function Library() {
  const {
    poems,
    nextCursor,
    hasMore,
    poets,
    coverImages,
    readList,
    loading,
    error,
    searchQuery,
    selectedCategories,
    fetchPoems,
    fetchPoets,
    fetchCoverImages,
    fetchReadList,
    toggleReadList,
    setSearchQuery,
    setSelectedCategories,
    clearCache,
  } = useStore()

  const [filterOpen, setFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<"poems" | "poets">("poems")
  const [featuredPoem, setFeaturedPoem] = useState<Poem | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLazyLoading, setIsLazyLoading] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(64) // Default navbar height
  const loaderRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)

  // Debounced search handler
  const debouncedFetchPoems = useCallback(
    debounce((query: string, category: string | undefined) => {
      setIsSearchLoading(true)
      clearCache()
      fetchPoems({
        category,
        search: query || undefined,
        reset: true,
      }).finally(() => {
        setIsSearchLoading(false)
      })
    }, 500),
    [fetchPoems, clearCache],
  )

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Get navbar height
    const navbar = document.querySelector("nav") || document.querySelector("header")
    if (navbar) {
      setNavbarHeight(navbar.clientHeight + 16) // Add some extra padding
    }

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    setIsInitialLoading(true)
    fetchPoems({ reset: true }).finally(() => {
      setIsInitialLoading(false)
    })
    fetchPoets()
    fetchCoverImages()
    fetchReadList()
  }, [fetchPoems, fetchPoets, fetchCoverImages, fetchReadList])

  useEffect(() => {
    if (searchQuery || selectedCategories.length) {
      debouncedFetchPoems(searchQuery, selectedCategories.length ? selectedCategories[0] : undefined)
    } else {
      setIsSearchLoading(true)
      clearCache()
      fetchPoems({ reset: true }).finally(() => {
        setIsSearchLoading(false)
      })
    }
  }, [searchQuery, selectedCategories, debouncedFetchPoems, fetchPoems, clearCache])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          isFetchingRef.current = true
          setIsLazyLoading(true)
          fetchPoems({ lastId: nextCursor }).finally(() => {
            isFetchingRef.current = false
            setIsLazyLoading(false)
          })
        }
      },
      { threshold: 0.5 },
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, nextCursor, fetchPoems])

  useEffect(() => {
    if (poems.length === 0) return

    const updateFeaturedPoem = () => {
      const now = new Date()
      const hourIndex = Math.floor(now.getTime() / (1000 * 60 * 60))
      const poemIndex = hourIndex % poems.length
      setFeaturedPoem(poems[poemIndex])
    }

    updateFeaturedPoem()
    const interval = setInterval(updateFeaturedPoem, 1000 * 60 * 60)
    return () => clearInterval(interval)
  }, [poems])

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg?height=300&width=300"
    const randomIndex = Math.floor(Math.random() * coverImages.length)
    return coverImages[randomIndex].url
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category) ? selectedCategories.filter((c) => c !== category) : [category],
    )
  }

  // Category list without "poem"
  const categories = ["ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <LineOfTheDay poems={poems} coverImages={coverImages} />

      {/* Library Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-black dark:text-white flex items-center gap-2">
              <BookMarked className="h-6 w-6" />
              Poetry Library
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={() => {
                  setIsInitialLoading(true)
                  clearCache()
                  fetchPoems({ reset: true }).finally(() => {
                    setIsInitialLoading(false)
                  })
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filter - Desktop */}
          <div className="hidden md:block md:w-64 lg:w-72 shrink-0">
            <div
              className="sticky border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black shadow-sm p-5"
              style={{ top: `${navbarHeight}px` }}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-sm text-black dark:text-white flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    Search
                  </h3>
                  <div className="relative">
                    <Input
                      placeholder="Search poems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-3 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-black dark:text-white"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-medium mb-3 text-sm flex items-center justify-between text-black dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Filter className="h-4 w-4" />
                      Categories
                    </span>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        onClick={() => setSelectedCategories([])}
                      >
                        Clear
                      </Button>
                    )}
                  </h3>
                  <div className="space-y-2.5">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                          className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize text-zinc-700 dark:text-zinc-300"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-medium mb-3 text-sm flex items-center gap-1.5 text-black dark:text-white">
                    <BookOpen className="h-4 w-4" />
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    >
                      <Link href="/readlist">
                        <BookMarked className="h-4 w-4 mr-2" />
                        My Reading List
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    >
                      <Link href="/poets">
                        <Users className="h-4 w-4 mr-2" />
                        Browse Poets
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {isMobile && (
            <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
              <DrawerContent className="bg-white dark:bg-black">
                <DrawerHeader>
                  <DrawerTitle className="text-black dark:text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Poetry
                  </DrawerTitle>
                  <DrawerDescription className="text-zinc-600 dark:text-zinc-400">
                    Refine your poetry collection
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2 space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 text-sm text-black dark:text-white">Search</h3>
                    <div className="relative">
                      <Input
                        placeholder="Search poems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-sm flex items-center justify-between text-black dark:text-white">
                      <span>Categories</span>
                      {selectedCategories.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          onClick={() => setSelectedCategories([])}
                        >
                          Clear
                        </Button>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                          />
                          <label
                            htmlFor={`mobile-category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize text-zinc-700 dark:text-zinc-300"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button
                    onClick={() => setFilterOpen(false)}
                    className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Apply Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      className="border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Search */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <Input
                  placeholder="Search poems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 py-2 text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-black dark:text-white"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                  </Button>
                )}
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "poems" | "poets")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-100 dark:bg-zinc-900">
                <TabsTrigger
                  value="poems"
                  className="text-xs sm:text-sm data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Poems
                </TabsTrigger>
                <TabsTrigger
                  value="poets"
                  className="text-xs sm:text-sm data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Poets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="poems" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Showing <span className="font-medium">{poems.length}</span> poems
                    {selectedCategories.length > 0 && <span> in {selectedCategories[0]}</span>}
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                  </p>
                </div>

                <div className="min-h-[50vh]">
                  {isInitialLoading || isSearchLoading ? (
                    <div className="flex justify-center items-center h-[50vh]">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black">
                      <AlertTriangle className="h-10 w-10 text-black dark:text-white mx-auto mb-4" />
                      <h3 className="text-base font-medium mb-2 text-black dark:text-white">Error</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-sm border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        onClick={() => {
                          setIsInitialLoading(true)
                          fetchPoems({ reset: true }).finally(() => {
                            setIsInitialLoading(false)
                          })
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : poems.length === 0 ? (
                    <div className="text-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black">
                      <BookText className="h-10 w-10 text-zinc-500 dark:text-zinc-400 mx-auto mb-4" />
                      <h3 className="text-base font-medium mb-2 text-black dark:text-white">No poems published</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic font-serif">
                        No poems match your filters or none are published yet.
                      </p>
                      {(searchQuery || selectedCategories.length > 0) && (
                        <Button
                          variant="outline"
                          className="mt-4 text-sm border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          onClick={() => {
                            setSearchQuery("")
                            setSelectedCategories([])
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  <AnimatePresence>
    {poems.map((poem, index) => {
      const englishSlug = poem.slug.en || poem._id;
      const isInReadlist = readList.includes(poem._id);
      const poemTitle = poem.title.en || "Untitled";
      return (
        <motion.div
          key={poem._id}
          className={`
            ${index === 0 ? "block" : "hidden md:block"}
            ${index > 1 ? "md:hidden" : ""}
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
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
      );
    })}
  </AnimatePresence>
</div>
                  )}
                  {poems.length > 0 && hasMore && (
                    <div ref={loaderRef} className="h-16 flex items-center justify-center mt-6">
                      {isLazyLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
                          onClick={() => {
                            if (!isFetchingRef.current && hasMore) {
                              isFetchingRef.current = true
                              setIsLazyLoading(true)
                              fetchPoems({ lastId: nextCursor }).finally(() => {
                                isFetchingRef.current = false
                                setIsLazyLoading(false)
                              })
                            }
                          }}
                        >
                          Load More
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="poets" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Showing <span className="font-medium">{poets.length}</span> poets
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                  </p>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold font-serif flex items-center gap-2 text-black dark:text-white mb-4">
                    <Sparkles className="h-5 w-5" />
                    Featured Poets
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                    {poets.slice(0, 8).map((poet, index) => (
                      <PoetCard key={poet._id} poet={poet} variant="compact" index={index} />
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold font-serif flex items-center gap-2 text-black dark:text-white mb-4">
                    <Users className="h-5 w-5" />
                    Popular Poets
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {poets.slice(0, 4).map((poet, index) => (
                      <PoetCard key={poet._id} poet={poet} variant="full" index={index} />
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2 font-serif text-xs sm:text-sm border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      <Link href="/poets">
                        View All Poets
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl text-black dark:text-white">
                Share this poem
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                Copy the link below to share this beautiful poem with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-black dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success("Link copied", {
                    description: "The poem's link has been copied to your clipboard",
                    icon: <Sparkles className="h-4 w-4" />,
                  })
                  setShowShareDialog(false)
                }}
                className="border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

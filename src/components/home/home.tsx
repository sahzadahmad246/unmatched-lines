"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Footer } from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LoadingComponent } from "@/components/utils/LoadingComponent"
import { BookHeart, Feather, Quote, Sparkles } from "lucide-react"
import { SearchBar } from "@/components/home/search-bar"
import { FeaturedCollection } from "@/components/home/featured-collection"
import { LineOfTheDay } from "@/components/poems/line-of-the-day"
import { TopFivePicks } from "@/components/home/TopFivePicks"
import { PoetList } from "../poets/PoetList"

// Interfaces
interface Poet {
  _id: string
  name: string
  slug: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

interface Poem {
  _id: string
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string }
  category: "ghazal" | "sher"
  excerpt?: string
  slug?: { en: string }
  content?: {
    en?: string[] | string
    hi?: string[] | string
    ur?: string[] | string
  }
  readListCount?: number
}

interface CoverImage {
  _id: string
  url: string
  uploadedBy: { name: string }
  createdAt: string
}

export default function Home() {
  const { data: session } = useSession()
  const [poets, setPoets] = useState<Poet[]>([])
  const [ghazals, setGhazals] = useState<Poem[]>([])
  const [shers, setShers] = useState<Poem[]>([])
  const [featuredPoem, setFeaturedPoem] = useState<Poem | null>(null)
  const [readList, setReadList] = useState<string[]>([])
  const [coverImages, setCoverImages] = useState<CoverImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const fetchData = async () => {
      try {
        setLoading(true)

        const poetsRes = await fetch("/api/authors", { credentials: "include" })
        if (!poetsRes.ok) throw new Error("Failed to fetch poets")
        const poetsData = await poetsRes.json()
        setPoets(poetsData.authors || [])

        const poemsRes = await fetch("/api/poem", { credentials: "include" })
        if (!poemsRes.ok) throw new Error("Failed to fetch poems")
        const poemsData = await poemsRes.json()
        const poems = poemsData.poems || []

        setGhazals(poems.filter((poem: Poem) => poem.category === "ghazal").slice(0, 6))
        setShers(poems.filter((poem: Poem) => poem.category === "sher").slice(0, 6))

        if (poems.length > 0) {
          const randomIndex = Math.floor(Math.random() * poems.length)
          setFeaturedPoem(poems[randomIndex])
        }

        const coverImagesRes = await fetch("/api/cover-images", { credentials: "include" })
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images")
        const coverImagesData = await coverImagesRes.json()
        setCoverImages(coverImagesData.coverImages || [])

        if (session) {
          const userRes = await fetch("/api/user", { credentials: "include" })
          if (userRes.ok) {
            const userData = await userRes.json()
            setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
          }
        }
      } catch (err) {
        setError("Failed to load data")
        toast.error("Failed to load content", {
          description: "Please try refreshing the page",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg?height=1080&width=1920"
    const randomIndex = Math.floor(Math.random() * coverImages.length)
    return coverImages[randomIndex].url
  }

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please sign in to manage your reading list.",
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/api/auth/signin"),
        },
      })
      return
    }

    const isInReadlist = readList.includes(poemId)
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add"
    const method = isInReadlist ? "DELETE" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      })

      if (res.ok) {
        setReadList((prev) => (isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]))

        if (isInReadlist) {
          toast.error("Removed from reading list", {
            description: `"${poemTitle}" has been removed from your reading list.`,
          })
        } else {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-3"
              >
                <BookHeart className="h-5 w-5" />
                <div>
                  <div className="font-medium">Added to your anthology</div>
                  <div className="text-sm opacity-90">"{poemTitle}" now resides in your collection</div>
                </div>
              </motion.div>
            ),
            { duration: 3000 },
          )
        }
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
      })
    }
  }

  if (loading) {
    return <LoadingComponent />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-destructive">{error}</h2>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={getRandomCoverImage() || "/placeholder.svg"}
            alt="Poetry background"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 sm:mb-6"
            >
              <Feather className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-serif"
            >
              Unmatched Lines
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 font-serif italic px-4"
            >
              Discover the beauty of poetry from renowned poets across different languages and traditions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full max-w-md"
            >
              <SearchBar fullWidth />

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button asChild variant="default" size="sm" className="text-xs sm:text-sm font-serif">
                  <Link href="/library">Explore Poems</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm font-serif">
                  <Link href="/poets">Discover Poets</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Line of the Day Section */}
      <LineOfTheDay poems={[...ghazals, ...shers]} coverImages={coverImages} />

      {/* Top Five Picks Section */}
      <TopFivePicks poems={[...ghazals, ...shers]} coverImages={coverImages} />

      {/* Featured Poets Section - Using the new PoetList component */}
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <PoetList
            poets={poets}
            variant="carousel"
            title="Featured Poets"
            showViewAll={true}
            viewAllHref="/poets"
            featuredPoets={true}
          />
        </div>
      </section>

      {/* Featured Collections */}
      <FeaturedCollection
        ghazals={ghazals}
        shers={shers}
        readList={readList}
        handleReadlistToggle={handleReadlistToggle}
      />

      {/* Quote Section */}
      <section className="py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute -left-10 top-10 text-[120px] sm:text-[200px] text-primary/5 font-serif">"</div>
          <div className="absolute -right-10 bottom-10 text-[120px] sm:text-[200px] text-primary/5 font-serif">"</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-primary/40 mx-auto" />

            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif italic px-4">
              Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in
              tranquility.
            </blockquote>

            <div className="flex flex-col items-center">
              <Separator className="w-12 sm:w-16 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-serif">William Wordsworth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif">Begin Your Poetic Journey</h2>

            <p className="text-base sm:text-lg md:text-xl font-serif px-4">
              Explore our vast collection of poems, discover new poets, and create your personal anthology.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="sm" variant="secondary" className="font-serif text-xs sm:text-sm">
                <Link href="/library">Explore Collection</Link>
              </Button>

              {!session && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary font-serif text-xs sm:text-sm"
                >
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

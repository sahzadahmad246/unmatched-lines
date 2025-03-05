"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { BookOpen, User, ChevronLeft, ChevronRight, Feather, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Poet {
  _id: string
  name: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

interface Poem {
  _id: string
  title: { en: string }
  author: { name: string }
  category: "ghazal" | "sher"
  coverImage?: string
  excerpt?: string
  slug?: { en: string }
  readListCount?: number
}

export default function Home() {
  const { data: session } = useSession()
  const [poets, setPoets] = useState<Poet[]>([])
  const [ghazals, setGhazals] = useState<Poem[]>([])
  const [shers, setShers] = useState<Poem[]>([])
  const [readList, setReadList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const poetsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch poets
        const poetsRes = await fetch("/api/authors", { credentials: "include" })
        if (!poetsRes.ok) throw new Error("Failed to fetch poets")
        const poetsData = await poetsRes.json()
        setPoets(poetsData.authors || [])

        // Fetch poems
        const poemsRes = await fetch("/api/poem", { credentials: "include" })
        if (!poemsRes.ok) throw new Error("Failed to fetch poems")
        const poemsData = await poemsRes.json()
        const poems = poemsData.poems || []

        // Filter by category
        setGhazals(poems.filter((poem: Poem) => poem.category === "ghazal").slice(0, 4)) // Limit to 4 for homepage
        setShers(poems.filter((poem: Poem) => poem.category === "sher").slice(0, 4)) // Limit to 4 for homepage

        // Fetch user's read list if logged in
        if (session) {
          const userRes = await fetch("/api/user", { credentials: "include" })
          if (userRes.ok) {
            const userData = await userRes.json()
            setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
          }
        }

        toast.success("Welcome to Unmatched Lines", {
          description: "Discover beautiful poetry from renowned poets",
          icon: <Feather className="h-4 w-4" />,
          position: "top-center",
          duration: 3000,
        })
      } catch (err) {
        console.error("Error fetching data:", err)
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

  const scrollPoets = (direction: "left" | "right") => {
    if (poetsScrollRef.current) {
      const scrollAmount = 300
      const scrollPosition =
        direction === "left"
          ? poetsScrollRef.current.scrollLeft - scrollAmount
          : poetsScrollRef.current.scrollLeft + scrollAmount

      poetsScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please sign in to manage your reading list",
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

        // Update poems with new count
        const updatePoems = (poems: Poem[]) => {
          return poems.map((poem) => {
            if (poem._id === poemId) {
              return {
                ...poem,
                readListCount: isInReadlist ? (poem.readListCount || 1) - 1 : (poem.readListCount || 0) + 1,
              }
            }
            return poem
          })
        }

        setGhazals(updatePoems(ghazals))
        setShers(updatePoems(shers))

        toast[isInReadlist ? "error" : "success"](
          isInReadlist ? "Removed from reading list" : "Added to reading list",
          { description: `"${poemTitle}" has been ${isInReadlist ? "removed from" : "added to"} your reading list` },
        )
      }
    } catch (err) {
      console.error("Error updating reading list:", err)
      toast.error("Failed to update reading list")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Feather className="h-16 w-16 text-primary/60" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl sm:text-2xl font-bold mt-6"
        >
          Loading poetic treasures...
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "250px" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-4"
        />
      </div>
    )
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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
        >
          Welcome to Unmatched Lines
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl"
        >
          Discover the beauty of poetry from renowned poets across different languages and traditions.
        </motion.p>
        {!session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button size="lg" asChild className="mt-8 relative overflow-hidden group">
              <Link href="/poets">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" />
                Explore Poets
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Poets Section */}
      <section className="mb-12 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Poets</h2>
          <Button variant="link" asChild className="text-sm sm:text-base">
            <Link href="/poets">See All</Link>
          </Button>
        </div>

        <div className="relative">
          <div
            ref={poetsScrollRef}
            className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide snap-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {poets.map((poet, index) => (
              <motion.div
                key={poet._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="min-w-[150px] sm:min-w-[180px] snap-start"
                whileHover={{ y: -5 }}
              >
                <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={poet.image || "/placeholder.svg?height=180&width=180"}
                      alt={poet.name}
                      fill
                      className="object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardContent className="flex-grow p-3 text-center">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-1">{poet.name}</h3>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button asChild size="sm" className="w-full text-xs">
                      <Link href={`/poets/${poet._id}`}>View Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollPoets("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollPoets("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Ghazals Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Ghazals</h2>
          <Button variant="link" asChild className="text-sm sm:text-base">
            <Link href="/ghazal">Explore More</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {ghazals.map((poem, index) => (
              <motion.div
                key={poem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden group">
                  <div className="relative h-32 sm:h-36">
                    <Image
                      src={poem.coverImage || "/placeholder.svg?height=200&width=300"}
                      alt={poem.title.en}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Heart button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleReadlistToggle(poem._id, poem.title.en)
                      }}
                      className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 backdrop-blur-sm shadow-md transition-all duration-200 hover:scale-110 z-10"
                      aria-label={readList.includes(poem._id) ? "Remove from reading list" : "Add to reading list"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors duration-300 ${
                          readList.includes(poem._id)
                            ? "fill-red-500 text-red-500"
                            : "fill-transparent text-gray-700 dark:text-gray-300"
                        }`}
                      />
                    </button>
                    {/* Like count */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                        <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                        <span>{poem.readListCount || 0}</span>
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-grow p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold line-clamp-1">{poem.title.en}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" /> {poem.author.name}
                    </p>
                    {poem.excerpt && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{poem.excerpt}</p>}
                  </CardContent>
                  <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
                    <Button asChild variant="default" size="sm" className="gap-1 w-full text-xs sm:text-sm">
                      <Link href={`/poems/${poem.slug?.en || poem._id}`}>
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Read
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Shers Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Shers</h2>
          <Button variant="link" asChild className="text-sm sm:text-base">
            <Link href="/sher">Explore More</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {shers.map((poem, index) => (
              <motion.div
                key={poem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden group">
                  <div className="relative h-32 sm:h-36">
                    <Image
                      src={poem.coverImage || "/placeholder.svg?height=200&width=300"}
                      alt={poem.title.en}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Heart button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleReadlistToggle(poem._id, poem.title.en)
                      }}
                      className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 backdrop-blur-sm shadow-md transition-all duration-200 hover:scale-110 z-10"
                      aria-label={readList.includes(poem._id) ? "Remove from reading list" : "Add to reading list"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors duration-300 ${
                          readList.includes(poem._id)
                            ? "fill-red-500 text-red-500"
                            : "fill-transparent text-gray-700 dark:text-gray-300"
                        }`}
                      />
                    </button>
                    {/* Like count */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                        <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                        <span>{poem.readListCount || 0}</span>
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-grow p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold line-clamp-1">{poem.title.en}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" /> {poem.author.name}
                    </p>
                    {poem.excerpt && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{poem.excerpt}</p>}
                  </CardContent>
                  <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
                    <Button asChild variant="default" size="sm" className="gap-1 w-full text-xs sm:text-sm">
                      <Link href={`/poems/${poem.slug?.en || poem._id}`}>
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Read
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}


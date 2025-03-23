"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  BookOpen,
  Calendar,
  MapPin,
  Feather,
  User,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PoemListItem } from "@/components/poems/poem-list-item"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Poem {
  _id: string
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string }
  category: string
  excerpt?: string
  slug?: { en: string }
  content?: {
    en?: string[] | string
    hi?: string[] | string
    ur?: string[] | string
  }
  readListCount?: number
  tags?: string[]
}

interface CoverImage {
  _id: string
  url: string
}

export default function PoetProfile() {
  const { slug } = useParams()
  const [poet, setPoet] = useState<any>(null)
  const [poems, setPoems] = useState<Poem[]>([])
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([])
  const [coverImages, setCoverImages] = useState<CoverImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readList, setReadList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showFullBio, setShowFullBio] = useState(false)
  const [profileImageOpen, setProfileImageOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poetRes, poemRes, userRes, coverImagesRes] = await Promise.all([
          fetch(`/api/authors/${slug}`, { credentials: "include" }),
          fetch("/api/poem", { credentials: "include" }),
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/cover-images", { credentials: "include" }),
        ])

        if (!poetRes.ok) throw new Error(`Failed to fetch poet data`)
        const poetData = await poetRes.json()
        setPoet(poetData.author)

        if (!poemRes.ok) throw new Error(`Failed to fetch poems`)
        const poemData = await poemRes.json()
        const filteredPoems = poemData.poems.filter(
          (poem: any) => poem.author?._id.toString() === poetData.author._id.toString()
        )
        setPoems(filteredPoems)
        setFilteredPoems(filteredPoems)

        if (userRes.ok) {
          const userData = await userRes.json()
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
        }

        if (coverImagesRes.ok) {
          const coverImagesData = await coverImagesRes.json()
          setCoverImages(coverImagesData.coverImages || [])
        }
      } catch (err) {
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
    else {
      setError("No profile identifier provided")
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPoems(poems)
    } else {
      const query = searchQuery.toLowerCase()
      const results = poems.filter(
        (poem) =>
          poem.title.en.toLowerCase().includes(query) ||
          poem.excerpt?.toLowerCase().includes(query) ||
          poem.category?.toLowerCase().includes(query)
      )
      setFilteredPoems(results)
    }
  }, [searchQuery, poems])

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
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
        setPoems((prevPoems) =>
          prevPoems.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist ? (poem.readListCount || 1) - 1 : (poem.readListCount || 0) + 1,
                }
              : poem
          )
        )
        toast(isInReadlist ? "Removed from reading list" : "Added to reading list", {
          description: `"${poemTitle}" has been ${isInReadlist ? "removed from" : "added to"} your reading list.`,
        })
      } else if (res.status === 401) {
        toast("Authentication required", {
          description: "Please sign in to manage your reading list.",
        })
      }
    } catch (error) {
      toast("Error", { description: "An error occurred while updating the reading list." })
    }
  }

  const getCoverImage = (poemId: string) => {
    if (coverImages.length === 0) return "/placeholder.svg"
    const poemIdSum = poemId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const imageIndex = poemIdSum % coverImages.length
    return coverImages[imageIndex]?.url || "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
          <p className="text-muted-foreground italic text-sm">Loading poet profile...</p>
        </div>
      </div>
    )
  }

  if (error || !poet) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-destructive text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-destructive">{error || "Profile not found"}</h2>
        <Link href="/poets">
          <Button variant="outline" className="mt-4">
            Back to Profiles
          </Button>
        </Link>
      </div>
    )
  }

  const truncateBio = (bio: string, maxLength = 120) => {
    if (!bio || bio.length <= maxLength) return bio
    return bio.substring(0, maxLength) + "..."
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl mb-20">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/poets">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Poets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Poet Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-1"
        >
          <Card className="overflow-hidden border shadow-md bg-background">
            <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 relative" />

            <div className="px-4 pt-0 pb-5 relative">
              <div
                className="relative h-20 w-20 border-4 border-background rounded-full absolute -top-20 left-4 overflow-hidden cursor-pointer"
                onClick={() => setProfileImageOpen(true)}
              >
                <Image
                  src={poet.image || "/placeholder.svg?height=400&width=400"}
                  alt="Poet"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  sizes="80px"
                />
              </div>

              <div className="mt-14 space-y-3">
                <h3 className="text-xl font-semibold">{poet.name}</h3>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Poet</span>
                  </Badge>
                </div>

                <Separator className="my-2" />

                {poet.bio && (
                  <div className="flex flex-col gap-2 text-muted-foreground text-sm">
                    <div className="flex items-start gap-2">
                      <Feather className="h-4 w-4 mt-1 flex-shrink-0" />
                      <p>{showFullBio ? poet.bio : truncateBio(poet.bio)}</p>
                    </div>
                    {poet.bio.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-end text-xs py-1 h-auto"
                        onClick={() => setShowFullBio(!showFullBio)}
                      >
                        {showFullBio ? (
                          <span className="flex items-center gap-1">
                            Show less <ChevronUp className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            See more <ChevronDown className="h-3 w-3" />
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {poet.dob
                      ? new Date(poet.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </span>
                </div>

                {poet.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{poet.city}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-xl font-bold text-primary">{poet.ghazalCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Ghazals</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-xl font-bold text-primary">{poet.sherCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Shers</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-xl font-bold text-primary">{poet.otherCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Other</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-2">
                  <p>
                    <span className="font-semibold">Added:</span>{" "}
                    {new Date(poet.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {poet.updatedAt !== poet.createdAt && (
                    <p>
                      <span className="font-semibold">Last Updated:</span>{" "}
                      {new Date(poet.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-4 text-center text-muted-foreground italic text-xs">
            "Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in
            tranquility."
            <div className="mt-1 font-medium">— William Wordsworth</div>
          </div>
        </motion.div>

        {/* Right Column - Poems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Works by {poet.name}</h3>
                <Badge variant="secondary">{poems.length} Poems</Badge>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search poems by title, category, or content..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Works</TabsTrigger>
                  {poems.some((p) => p.category?.toLowerCase() === "ghazal") && (
                    <TabsTrigger value="ghazal">Ghazals</TabsTrigger>
                  )}
                  {poems.some((p) => p.category?.toLowerCase() === "sher") && (
                    <TabsTrigger value="sher">Shers</TabsTrigger>
                  )}
                  {poems.some(
                    (p) => p.category?.toLowerCase() !== "ghazal" && p.category?.toLowerCase() !== "sher"
                  ) && <TabsTrigger value="other">Other</TabsTrigger>}
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  {filteredPoems.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPoems.map((poem, index) => {
                        const poemTitle = poem.title?.en || "Untitled"
                        const englishSlug = poem.slug?.en || poem._id
                        const isInReadlist = readList.includes(poem._id)
                        return (
                          <motion.div
                            key={poem._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index, duration: 0.3 }}
                          >
                            <PoemListItem
                              poem={poem}
                              coverImage={getCoverImage(poem._id)}
                              englishSlug={englishSlug}
                              isInReadlist={isInReadlist}
                              poemTitle={poemTitle}
                              handleReadlistToggle={handleReadlistToggle}
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <EmptyState query={searchQuery} />
                  )}
                </TabsContent>

                <TabsContent value="ghazal" className="mt-0">
                  {filteredPoems.filter((p) => p.category?.toLowerCase() === "ghazal").length > 0 ? (
                    <div className="space-y-4">
                      {filteredPoems
                        .filter((p) => p.category?.toLowerCase() === "ghazal")
                        .map((poem, index) => {
                          const poemTitle = poem.title?.en || "Untitled"
                          const englishSlug = poem.slug?.en || poem._id
                          const isInReadlist = readList.includes(poem._id)
                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index, duration: 0.3 }}
                            >
                              <PoemListItem
                                poem={poem}
                                coverImage={getCoverImage(poem._id)}
                                englishSlug={englishSlug}
                                isInReadlist={isInReadlist}
                                poemTitle={poemTitle}
                                handleReadlistToggle={handleReadlistToggle}
                              />
                            </motion.div>
                          )
                        })}
                    </div>
                  ) : (
                    <EmptyState category="ghazals" query={searchQuery} />
                  )}
                </TabsContent>

                <TabsContent value="sher" className="mt-0">
                  {filteredPoems.filter((p) => p.category?.toLowerCase() === "sher").length > 0 ? (
                    <div className="space-y-4">
                      {filteredPoems
                        .filter((p) => p.category?.toLowerCase() === "sher")
                        .map((poem, index) => {
                          const poemTitle = poem.title?.en || "Untitled"
                          const englishSlug = poem.slug?.en || poem._id
                          const isInReadlist = readList.includes(poem._id)
                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index, duration: 0.3 }}
                            >
                              <PoemListItem
                                poem={poem}
                                coverImage={getCoverImage(poem._id)}
                                englishSlug={englishSlug}
                                isInReadlist={isInReadlist}
                                poemTitle={poemTitle}
                                handleReadlistToggle={handleReadlistToggle}
                              />
                            </motion.div>
                          )
                        })}
                    </div>
                  ) : (
                    <EmptyState category="shers" query={searchQuery} />
                  )}
                </TabsContent>

                <TabsContent value="other" className="mt-0">
                  {filteredPoems.filter(
                    (p) => p.category?.toLowerCase() !== "ghazal" && p.category?.toLowerCase() !== "sher"
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {filteredPoems
                        .filter((p) => p.category?.toLowerCase() !== "ghazal" && p.category?.toLowerCase() !== "sher")
                        .map((poem, index) => {
                          const poemTitle = poem.title?.en || "Untitled"
                          const englishSlug = poem.slug?.en || poem._id
                          const isInReadlist = readList.includes(poem._id)
                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index, duration: 0.3 }}
                            >
                              <PoemListItem
                                poem={poem}
                                coverImage={getCoverImage(poem._id)}
                                englishSlug={englishSlug}
                                isInReadlist={isInReadlist}
                                poemTitle={poemTitle}
                                handleReadlistToggle={handleReadlistToggle}
                              />
                            </motion.div>
                          )
                        })}
                    </div>
                  ) : (
                    <EmptyState category="other works" query={searchQuery} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Profile Image Dialog */}
      <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm">
            <DialogTitle className="flex items-center justify-between">
              <span>{poet.name}</span>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setProfileImageOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square">
            <Image
              src={poet.image || "/placeholder.svg?height=400&width=400"}
              alt={poet.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface EmptyStateProps {
  category?: string
  query?: string
}

function EmptyState({ category = "works", query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-medium">{query ? `No results found for "${query}"` : `No ${category} available`}</h3>
      <p className="text-muted-foreground mt-2">
        {query
          ? "Try adjusting your search terms or browse all works"
          : `There are no ${category} available at the moment.`}
      </p>
    </div>
  )
}
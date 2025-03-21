"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Heart,
  Bookmark,
  BookmarkCheck,
  User,
  Calendar,
  Feather,
  Share2,
  ArrowLeft,
  BookHeart,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { LoadingComponent } from "../utils/LoadingComponent"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { VerseDownload } from "../home/verse-download"

interface Poem {
  _id: string
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string }
  category: string
  content?: {
    en?: string[]
    hi?: string[]
    ur?: string[]
  }
  createdAt?: string
  slug: { en: string; hi?: string; ur?: string }[]
  readListCount: number
  tags?: string[]
}

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

export default function PoemDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const [poem, setPoem] = useState<Poem | null>(null)
  const [readList, setReadList] = useState<string[]>([])
  const [coverImages, setCoverImages] = useState<CoverImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "ur">("en")
  const [showShareDialog, setShowShareDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const poemRes = await fetch(`/api/poem?slug=${slug}`, {
          credentials: "include",
        })
        if (!poemRes.ok) {
          const errorText = await poemRes.text()
          throw new Error(`Failed to fetch poem: ${poemRes.status} - ${errorText}`)
        }
        const poemData = await poemRes.json()

        if (!poemData.poem) throw new Error("Poem not found in response")
        setPoem(poemData.poem)

        toast.success("Poem unveiled", {
          description: "Immerse yourself in the verses",
          icon: <Feather className="h-4 w-4" />,
          position: "top-center",
          duration: 3000,
        })

        const coverImagesRes = await fetch("/api/cover-images", {
          credentials: "include",
        })
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images")
        const coverImagesData = await coverImagesRes.json()
        setCoverImages(coverImagesData.coverImages || [])

        const userRes = await fetch("/api/user", { credentials: "include" })
        if (userRes.ok) {
          const userData = await userRes.json()
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
        } else if (userRes.status === 401) {
          setReadList([])
        } else {
          const errorText = await userRes.text()
          throw new Error(`Failed to fetch user data: ${userRes.status} - ${errorText}`)
        }
      } catch (error) {
        setError((error as Error).message || "Failed to load poem details")
        toast.error("Poem not found", {
          description: "The verse you seek has vanished into the mist",
          icon: <Feather className="h-4 w-4" />,
        })
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug])

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.jpg"
    const randomIndex = Math.floor(Math.random() * coverImages.length)
    return coverImages[randomIndex].url
  }

  const handleReadlistToggle = async (poemId: string) => {
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
        setPoem((prev: any) => ({
          ...prev,
          readListCount: isInReadlist ? prev.readListCount - 1 : prev.readListCount + 1,
        }))

        if (isInReadlist) {
          toast.success("Removed from anthology", {
            description: "This poem has been removed from your collection",
            icon: <BookmarkCheck className="h-4 w-4" />,
            position: "bottom-right",
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
                  <div className="text-sm opacity-90">This poem now resides in your collection</div>
                </div>
              </motion.div>
            ),
            { duration: 3000 },
          )
        }
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to curate your personal anthology",
          action: {
            label: "Sign In",
            onClick: () => router.push("/api/auth/signin"),
          },
        })
      } else {
        throw new Error("Failed to update readlist")
      }
    } catch (error) {
      console.error(`Error ${isInReadlist ? "removing from" : "adding to"} readlist:`, error)
      toast.error("An error occurred", {
        description: "The poem could not be added to your collection",
      })
    }
  }

  const handleTabChange = (lang: "en" | "hi" | "ur") => {
    setActiveLang(lang)
    if (poem) {
      const newSlug = poem.slug[0][lang]
      router.push(`/poems/${newSlug}`)
    }
  }

  const handleSharePoem = () => {
    if (navigator.share && poem) {
      navigator
        .share({
          title: poem.title?.[activeLang] || "Beautiful Poem",
          text: `Check out this beautiful poem: ${poem.title?.[activeLang]}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Shared successfully", {
            description: "You've shared this poem with others",
            icon: <Share2 className="h-4 w-4" />,
          })
        })
        .catch(() => {
          setShowShareDialog(true)
        })
    } else {
      setShowShareDialog(true)
    }
  }

  if (loading) {
    return <LoadingComponent />
  }

  if (error || !poem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 text-center min-h-[60vh] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-destructive mb-4"
        >
          <Feather className="h-16 w-16 mx-auto" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-destructive font-serif mb-2"
        >
          {error || "This poem has faded into the mist"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground italic mb-6"
        >
          Like a whisper lost in the wind, we cannot find the verses you seek
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Button variant="outline" className="gap-2 font-serif" onClick={() => router.push("/library")}>
            <ArrowLeft className="h-4 w-4" />
            Return to the Library
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  const isInReadlist = poem._id && readList.includes(poem._id)

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <div className="italic text-muted-foreground">Content not available</div>
    }

    return (
      <div className="space-y-8">
        {content.map((stanza, index) => (
          <div key={index} className="poem-stanza">
            {stanza.split("\n").map((line, lineIndex) => (
              <div key={lineIndex} className="poem-line leading-relaxed">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/library")}
          className="gap-2 text-muted-foreground hover:text-foreground font-serif"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -inset-1 rounded-xl bg-primary/5 blur-md"
        />

        <Card className="shadow-lg overflow-hidden border-none bg-background/80 backdrop-blur-sm">
          <CardHeader className="p-0 relative h-[300px] sm:h-[400px] bg-muted">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="h-full w-full relative"
            >
              <Image
                src={getRandomCoverImage() || "/placeholder.svg"}
                alt={poem.title?.[activeLang] || "Poem Image"}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white"
            >
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Badge className="mb-3 font-serif">{poem.category || "Poetry"}</Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif line-clamp-2"
              >
                {poem.title?.[activeLang] || "Untitled"}
              </motion.h1>
            </motion.div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs
              value={activeLang}
              onValueChange={(value) => handleTabChange(value as "en" | "hi" | "ur")}
              className="w-full"
            >
              <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
                <TabsList className="grid w-full grid-cols-3 rounded-none h-14">
                  <TabsTrigger
                    value="en"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                  >
                    English
                  </TabsTrigger>
                  <TabsTrigger
                    value="hi"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                  >
                    Hindi
                  </TabsTrigger>
                  <TabsTrigger
                    value="ur"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                  >
                    Urdu
                  </TabsTrigger>
                </TabsList>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 md:p-8"
              >
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4 mb-6"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground font-serif italic">
                      By {poem.author?.name || "Unknown Author"}
                    </span>
                  </div>

                  {poem.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground font-serif italic">
                        {new Date(poem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  <TabsContent value="en" className="mt-0">
                    <motion.div
                      key="en"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content rtl:text-right"
                    >
                      {formatPoetryContent(poem.content?.en) || "Content not available in English"}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="hi" className="mt-0">
                    <motion.div
                      key="hi"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content"
                    >
                      {formatPoetryContent(poem.content?.hi) || "हिंदी में सामग्री उपलब्ध नहीं है"}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="ur" className="mt-0">
                    <motion.div
                      key="ur"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content rtl"
                    >
                      {formatPoetryContent(poem.content?.ur) || "مواد اردو میں دستیاب نہیں ہے"}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>

                <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                  <Separator className="my-8 bg-primary/10" />
                </motion.div>

                <motion.div
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1 font-serif">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                      <span>{poem.readListCount || 0} Readers</span>
                    </Badge>

                    {poem.tags && poem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {poem.tags.map((tag: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Badge variant="outline" className="text-xs font-serif">
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <VerseDownload
                      verse={poem.content?.[activeLang]?.[0] || ""}
                      author={poem.author?.name || "Unknown Author"}
                      title={poem.title?.[activeLang] || "Untitled"}
                      imageUrl={getRandomCoverImage()}
                      languages={{
                        en: poem.content?.en,
                        hi: poem.content?.hi,
                        ur: poem.content?.ur,
                      }}
                    />

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" onClick={handleSharePoem} className="gap-2 font-serif">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={isInReadlist ? "default" : "outline"}
                            size="sm"
                            className={`${
                              isInReadlist ? "bg-primary text-primary-foreground" : ""
                            } transition-all gap-2 font-serif`}
                          >
                            {isInReadlist ? (
                              <>
                                <BookmarkCheck className="h-4 w-4" />
                                <span className="hidden sm:inline">In Your Anthology</span>
                                <span className="sm:hidden">Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-4 w-4" />
                                <span className="hidden sm:inline">Add to Anthology</span>
                                <span className="sm:hidden">Save</span>
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-primary/20">
                          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif text-xl">
                                {isInReadlist ? "Remove from your anthology?" : "Add to your anthology?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="italic">
                                {isInReadlist
                                  ? "This poem will no longer be part of your personal collection."
                                  : "This poem will be added to your personal collection for later enjoyment."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                              <AlertDialogCancel className="font-serif">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => poem._id && handleReadlistToggle(poem._id)}
                                className="font-serif"
                              >
                                {isInReadlist ? "Remove" : "Add"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </motion.div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-muted-foreground italic mt-8 text-sm"
      >
        "Poetry is not a turning loose of emotion, but an escape from emotion; it is not the expression of personality,
        but an escape from personality."
        <div className="mt-1 font-medium">— T.S. Eliot</div>
      </motion.div>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-primary/20">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl">Share this poem</AlertDialogTitle>
              <AlertDialogDescription>
                Copy the link below to share this beautiful poem with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


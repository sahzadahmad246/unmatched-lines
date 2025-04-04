"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"

const poetryStyles = {
  verse: `
    font-family: 'Georgia', serif;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  `,
}

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
          icon: <Feather />,
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
          icon: <Feather />,
        })
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug])

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
            icon: <BookmarkCheck />,
            position: "bottom-right",
          })
        } else {
          toast.success("Added to anthology", {
            description: "This poem now resides in your collection",
            icon: <BookHeart />,
            position: "bottom-right",
          })
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
            icon: <Share2 />,
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Feather className="h-12 w-12 text-primary/70" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl sm:text-2xl font-bold"
        >
          Loading poem...
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    )
  }

  if (error || !poem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl text-primary/70">
          <Feather className="h-16 w-16" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold"
        >
          {error || "This poem has faded into the mist"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-center max-w-md"
        >
          Like a whisper lost in the wind, we cannot find the verses you seek
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Button variant="outline" onClick={() => router.push("/library")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to the Library
          </Button>
        </motion.div>
      </div>
    )
  }

  const isInReadlist = poem._id && readList.includes(poem._id)

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <div className="text-muted-foreground italic">Content not available</div>
    }

    return (
      <div className="space-y-8">
        {content.map((stanza, index) => (
          <div key={index} className="poem-stanza">
            {stanza.split("\n").map((line, lineIndex) => (
              <div key={lineIndex} className="poem-line leading-relaxed text-sm sm:text-base md:text-lg">
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/library")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="overflow-hidden border shadow-md">
          <CardHeader className="relative p-0">
            <motion.div className="h-40 sm:h-60 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Feather className="h-16 w-16 text-primary/30" />
              </div>
            </motion.div>
            <motion.div className="absolute top-4 right-4">
              <Badge className="bg-primary/90">{poem.category || "Poetry"}</Badge>
            </motion.div>
            <motion.h1 className="text-2xl sm:text-3xl md:text-4xl font-bold p-6 text-center">
              {poem.title?.[activeLang] || "Untitled"}
            </motion.h1>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeLang} onValueChange={(value) => handleTabChange(value as "en" | "hi" | "ur")}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="en" disabled={!poem.content?.en?.length}>
                  English
                </TabsTrigger>
                <TabsTrigger value="hi" disabled={!poem.content?.hi?.length}>
                  Hindi
                </TabsTrigger>
                <TabsTrigger value="ur" disabled={!poem.content?.ur?.length}>
                  Urdu
                </TabsTrigger>
              </TabsList>

              <motion.div className="flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  <TabsContent value="en" className="mt-0">
                    <motion.div
                      key="en"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="prose prose-lg dark:prose-invert max-w-none text-center"
                    >
                      {formatPoetryContent(poem.content?.en) || "Content not available in English"}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="hi" className="mt-0">
                    <motion.div
                      key="hi"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="prose prose-lg dark:prose-invert max-w-none text-center"
                    >
                      {formatPoetryContent(poem.content?.hi) || "हिंदी में सामग्री उपलब्ध नहीं है"}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="ur" className="mt-0">
                    <motion.div
                      key="ur"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="prose prose-lg dark:prose-invert max-w-none text-center"
                    >
                      {formatPoetryContent(poem.content?.ur) || "مواد اردو میں دستیاب نہیں ہے"}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>

                <Separator className="my-2" />

                <motion.div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 text-primary/70" />
                      <span>By {poem.author?.name || "Unknown Author"}</span>
                    </div>

                    {poem.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    <Badge variant="secondary" className="gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{poem.readListCount || 0} Readers</span>
                    </Badge>
                  </div>

                  {poem.tags && poem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {poem.tags.map((tag: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Badge variant="outline">{tag}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4">
                    <VerseDownload
                      verse={poem.content?.[activeLang]?.[0] || ""}
                      author={poem.author?.name || "Unknown Author"}
                      title={poem.title?.[activeLang] || "Untitled"}
                      imageUrl="/placeholder.svg"
                      languages={{
                        en: poem.content?.en,
                        hi: poem.content?.hi,
                        ur: poem.content?.ur,
                      }}
                    />

                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Button variant="outline" size="sm" onClick={handleSharePoem} className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={isInReadlist ? "default" : "outline"}
                            size="sm"
                            className={`gap-2 ${isInReadlist ? "bg-primary/90" : ""}`}
                          >
                            {isInReadlist ? (
                              <>
                                <BookmarkCheck className="h-4 w-4" />
                                In Your Anthology
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-4 w-4" />
                                Add to Anthology
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-primary/20">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg">
                                {isInReadlist ? "Remove from your anthology?" : "Add to your anthology?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground italic">
                                {isInReadlist
                                  ? "This poem will no longer be part of your personal collection."
                                  : "This poem will be added to your personal collection for later enjoyment."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                              <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => poem._id && handleReadlistToggle(poem._id)}
                                className={`text-sm ${isInReadlist ? "bg-destructive hover:bg-destructive/90" : ""}`}
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
        transition={{ delay: 0.8 }}
        style={{ width: "100%" }}
        className="mt-8 text-center text-muted-foreground italic text-sm p-4 bg-muted/30 rounded-lg border border-primary/5"
      >
        "Poetry is not a turning loose of emotion, but an escape from emotion; it is not the expression of personality,
        but an escape from personality."
        <div className="mt-1 font-medium text-xs">— T.S. Eliot</div>
      </motion.div>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-primary/20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">Share this poem</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground italic">
                Copy the link below to share this beautiful poem with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-2 mt-4">
              <Input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="bg-muted/50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success("Link copied", {
                    description: "The poem's link has been copied to your clipboard",
                    icon: <Sparkles />,
                  })
                  setShowShareDialog(false)
                }}
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


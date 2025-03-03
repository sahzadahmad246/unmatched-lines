"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { Heart, Bookmark, BookmarkCheck, Loader2, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PoemDetail() {
  const { slug } = useParams() // Get slug from URL
  const router = useRouter()
  const [poem, setPoem] = useState<any>(null)
  const [readList, setReadList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "ur">("en")

  // Fetch poem and user readlist data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true) // Ensure loading starts as true
      setError(null) // Reset error state
      try {
        const poemRes = await fetch(`/api/poem?slug=${slug}`, {
          credentials: "include",
        })
        if (!poemRes.ok) {
          const errorText = await poemRes.text()
          throw new Error(`Failed to fetch poem: ${poemRes.status} - ${errorText}`)
        }
        const poemData = await poemRes.json()
        console.log("Poem Response:", poemData) // Debug: Log full response
        if (!poemData.poem) throw new Error("Poem not found in response")
        setPoem(poemData.poem)

        // Fetch user's readlist
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
      } finally {
        setLoading(false) // Ensure loading is set to false regardless of outcome
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
        alert(`Poem ${isInReadlist ? "removed from" : "added to"} readlist!`)
      } else if (res.status === 401) {
        alert("Please sign in to manage your readlist.")
      } else {
        throw new Error("Failed to update readlist")
      }
    } catch (error) {
      console.error(`Error ${isInReadlist ? "removing from" : "adding to"} readlist:`, error)
      alert("An error occurred while updating the readlist.")
    }
  }

  const handleTabChange = (lang: "en" | "hi" | "ur") => {
    setActiveLang(lang)
    if (poem) {
      const newSlug = poem.slug[0][lang]
      router.push(`/poems/${newSlug}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Loading poem...</h2>
      </div>
    )
  }

  if (error || !poem) {
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-destructive">{error || "Poem not found"}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/poems")}>
          Back to Poems
        </Button>
      </div>
    )
  }

  const isInReadlist = poem._id && readList.includes(poem._id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg overflow-hidden border-none">
        <CardHeader className="p-0 relative h-[300px] sm:h-[400px] bg-muted">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=400&width=800"}
            alt={poem.title[0]?.[activeLang] || "Poem Image"}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <Badge className="mb-2">{poem.category || "Poetry"}</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold line-clamp-2">
              {poem.title?.[activeLang] || "Untitled"}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeLang}
            onValueChange={(value) => handleTabChange(value as "en" | "hi" | "ur")}
            className="w-full"
          >
            <div className="sticky top-0 z-10 bg-background border-b">
              <TabsList className="grid w-full grid-cols-3 rounded-none h-14">
                <TabsTrigger
                  value="en"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full"
                >
                  English
                </TabsTrigger>
                <TabsTrigger
                  value="hi"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full"
                >
                  Hindi
                </TabsTrigger>
                <TabsTrigger
                  value="ur"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full"
                >
                  Urdu
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">By {poem.author?.name || "Unknown Author"}</span>
                </div>
                {poem.publishedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(poem.publishedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <TabsContent value="en" className="mt-0">
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                  {poem.content?.en || "Content not available in English"}
                </div>
              </TabsContent>

              <TabsContent value="hi" className="mt-0">
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                  {poem.content?.hi || "हिंदी में सामग्री उपलब्ध नहीं है"}
                </div>
              </TabsContent>

              <TabsContent value="ur" className="mt-0">
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                  {poem.content?.ur || "مواد اردو میں دستیاب نہیں ہے"}
                </div>
              </TabsContent>

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{poem.readListCount || 0} Readers</span>
                  </Badge>

                  {poem.tags && poem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {poem.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant={isInReadlist ? "default" : "outline"}
                  size="sm"
                  className={`${isInReadlist ? "bg-primary text-primary-foreground" : ""} transition-all`}
                  onClick={() => poem._id && handleReadlistToggle(poem._id)}
                >
                  {isInReadlist ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">In Your Readlist</span>
                      <span className="sm:hidden">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add to Readlist</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


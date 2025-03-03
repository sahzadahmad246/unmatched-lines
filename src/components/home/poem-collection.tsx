"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Search,
  BookOpen,
  User,
  Loader2,
  AlertTriangle,
  BookmarkPlus,
  BookmarkCheck,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PoemCollectionProps {
  category: "ghazal" | "sher"
  title: string
}

export default function PoemCollection({ category, title }: PoemCollectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [poems, setPoems] = useState<any[]>([])
  const [readList, setReadList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poemRes = await fetch("/api/poem", { credentials: "include" })
        if (!poemRes.ok) throw new Error(`Failed to fetch ${category}s`)
        const poemData = await poemRes.json()
        const filteredPoems = poemData.poems.filter((poem: any) => poem.category === category)
        console.log(`Fetched ${category}s:`, filteredPoems)
        setPoems(filteredPoems)

        const userRes = await fetch("/api/user", { credentials: "include" })
        if (userRes.ok) {
          const userData = await userRes.json()
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
        } else if (userRes.status === 401) {
          setReadList([])
        } else {
          throw new Error("Failed to fetch user data")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(`Failed to load ${category}s`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category])

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
        // Update the UI without alerts
        const updatedPoems = [...poems]
        const poemIndex = updatedPoems.findIndex((poem) => poem._id === poemId)
        if (poemIndex !== -1) {
          updatedPoems[poemIndex] = {
            ...updatedPoems[poemIndex],
            readListCount: isInReadlist
              ? (updatedPoems[poemIndex].readListCount || 1) - 1
              : (updatedPoems[poemIndex].readListCount || 0) + 1,
          }
          setPoems(updatedPoems)
        }
      } else if (res.status === 401) {
        alert("Please sign in to manage your readlist.")
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${isInReadlist ? "remove from" : "add to"} readlist`)
      }
    } catch (error) {
      console.error(`Error ${isInReadlist ? "removing from" : "adding to"} readlist:`, error)
      alert("An error occurred while updating the readlist.")
    }
  }

  const filteredPoems = poems.filter(
    (poem) =>
      poem.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Loading {title.toLowerCase()}...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{error}</h2>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">Discover beautiful {title.toLowerCase()} from renowned poets</p>
        </div>

        <div
          className={`relative max-w-sm w-full transition-all ${isSearchFocused ? "ring-2 ring-primary ring-offset-2" : ""}`}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      {filteredPoems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPoems.map((poem) => {
            const englishSlug = poem.slug?.en || poem._id
            const isInReadlist = readList.includes(poem._id)

            return (
              <Card key={poem._id} className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={poem.coverImage || "/placeholder.svg?height=200&width=300"}
                    alt={poem.title?.en || "Poem Image"}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                      <Heart className="h-3 w-3 text-primary" />
                      <span>{poem.readListCount || 0}</span>
                    </Badge>
                  </div>
                </div>

                <CardContent className="flex-grow p-4">
                  <h3 className="text-xl font-bold line-clamp-1 mb-1">{poem.title?.en || "Untitled"}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-sm">{poem.author?.name || "Unknown Author"}</span>
                  </div>

                  {poem.excerpt && <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{poem.excerpt}</p>}
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <Link href={`/poems/${englishSlug}`} className="inline-flex">
                    <Button variant="default" size="sm" className="gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReadlistToggle(poem._id)}
                    className={`${isInReadlist ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
                  >
                    {isInReadlist ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-medium">No {title.toLowerCase()} found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : `There are no ${title.toLowerCase()} available at the moment.`}
          </p>
          {searchTerm && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import Link from "next/link"

interface SearchResult {
  _id: string
  type: "poem" | "poet"
  title?: { en: string; hi?: string; ur?: string }
  name?: string
  slug?: string
  category?: string
  image?: string
  excerpt?: string
}

export function SearchBar({ className = "", fullWidth = false, isMobile = false }) {
  const [query, setQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "poems" | "poets">("all")
  const router = useRouter()

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Failed to fetch")

        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
       
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsSearchOpen(false)
    }
  }

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true
    if (activeTab === "poems") return result.type === "poem"
    if (activeTab === "poets") return result.type === "poet"
    return false
  })

  return (
    <>
      <motion.div
        className={`relative sm:relative ${className} ${fullWidth ? "w-full" : ""} ${
          isMobile ? "fixed top-4 left-0 right-0 z-40 bg-white p-2 shadow-md" : ""
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input
          placeholder="Search poems, poets..."
          className="pl-10 py-5 text-sm sm:text-base"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isSearchOpen && e.target.value.trim()) setIsSearchOpen(true)
          }}
          onClick={() => setIsSearchOpen(true)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        {query && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 w-[95%] sm:w-auto mx-auto top-[50%] sm:top-[50%]">
          <div className="p-3 sm:p-4 border-b">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                placeholder="Search poems, poets..."
                className="pl-10 py-5 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin" />
              )}
            </form>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "poems" | "poets")}
          >
            <div className="px-3 sm:px-4 border-b">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="poems">Poems</TabsTrigger>
                <TabsTrigger value="poets">Poets</TabsTrigger>
              </TabsList>
            </div>

            <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              <TabsContent value={activeTab} className="m-0 p-0">
                <AnimatePresence>
                  {query.trim().length < 2 ? (
                    <div className="p-4 sm:p-6 text-center text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  ) : isLoading ? (
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <div className="mt-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-muted"></div>
                            <div className="flex-1">
                              <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                              <div className="h-3 w-1/2 bg-muted rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center text-muted-foreground">No results found for "{query}"</div>
                  ) : (
                    <ul className="divide-y">
                      {filteredResults.map((result) => (
                        <motion.li
                          key={result._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-3 sm:p-4 hover:bg-muted/50"
                        >
                          <Link
                            href={
                              result.type === "poem"
                                ? `/poems/en/${result.slug || result._id}`
                                : `/poets/en/${result.slug || result._id}`
                            }
                            className="flex items-start gap-3"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            {result.type === "poet" ? (
                              <Avatar className="h-10 w-10 rounded-full">
                                <img
                                  src={result.image || "/placeholder.svg"}
                                  alt={result.name || ""}
                                  className="h-full w-full object-cover"
                                />
                              </Avatar>
                            ) : (
                              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <Search className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">
                                {result.type === "poem" ? result.title?.en : result.name}
                              </h4>
                              {result.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{result.excerpt}</p>
                              )}
                            </div>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </AnimatePresence>
              </TabsContent>
            </div>

            {filteredResults.length > 0 && (
              <div className="p-3 sm:p-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
                    setIsSearchOpen(false)
                  }}
                >
                  View All Results
                </Button>
              </div>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}


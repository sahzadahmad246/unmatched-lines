"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ArrowRight, User, ChevronDown, BookmarkPlus, BookHeart, Languages, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

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

interface FeaturedCollectionProps {
  ghazals: Poem[]
  shers: Poem[]
  readList: string[]
  handleReadlistToggle: (id: string, title: string) => void
}

export function FeaturedCollection({ ghazals, shers, readList, handleReadlistToggle }: FeaturedCollectionProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "ghazal" | "sher">("all")

  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 font-serif">Featured Collections</h2>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveCategory(value as "all" | "ghazal" | "sher")}
        >
          <div className="flex justify-center mb-6 sm:mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="all" className="font-serif text-xs sm:text-sm">
                All Poems
              </TabsTrigger>
              <TabsTrigger value="ghazal" className="font-serif text-xs sm:text-sm">
                Ghazals
              </TabsTrigger>
              <TabsTrigger value="sher" className="font-serif text-xs sm:text-sm">
                Shers
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              {[...ghazals.slice(0, 3), ...shers.slice(0, 3)].map((poem, index) => (
                <PoemCard
                  key={poem._id}
                  poem={poem}
                  index={index}
                  isInReadlist={readList.includes(poem._id)}
                  handleReadlistToggle={handleReadlistToggle}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ghazal" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              {ghazals.map((poem, index) => (
                <PoemCard
                  key={poem._id}
                  poem={poem}
                  index={index}
                  isInReadlist={readList.includes(poem._id)}
                  handleReadlistToggle={handleReadlistToggle}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sher" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              {shers.map((poem, index) => (
                <PoemCard
                  key={poem._id}
                  poem={poem}
                  index={index}
                  isInReadlist={readList.includes(poem._id)}
                  handleReadlistToggle={handleReadlistToggle}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8 sm:mt-10">
          <Button asChild size="sm" variant="outline" className="gap-2 font-serif text-xs sm:text-sm">
            <Link href={`/${activeCategory === "all" ? "poems" : activeCategory}`}>
              View All {activeCategory === "all" ? "Poems" : activeCategory === "ghazal" ? "Ghazals" : "Shers"}
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

interface PoemCardProps {
  poem: Poem
  index: number
  isInReadlist: boolean
  handleReadlistToggle: (id: string, title: string) => void
}

function PoemCard({ poem, index, isInReadlist, handleReadlistToggle }: PoemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contentLang, setContentLang] = useState<"en" | "hi" | "ur">("en")

  // Determine available languages
  const availableLanguages = Object.entries({
    en: poem.content?.en,
    hi: poem.content?.hi,
    ur: poem.content?.ur,
  })
    .filter(([_, content]) => content && (Array.isArray(content) ? content.length > 0 : content.trim() !== ""))
    .map(([lang]) => lang)

  // If selected language is not available, default to first available
  if (availableLanguages.length > 0 && !availableLanguages.includes(contentLang)) {
    setContentLang(availableLanguages[0] as "en" | "hi" | "ur")
  }

  // Format poetry content similar to PoemDetail
  const formatPoetryContent = (content: string[] | string | undefined) => {
    if (!content) {
      return <div className="italic text-muted-foreground text-xs">Content not available</div>
    }

    let stanzas: string[] = [];
    if (typeof content === "string") {
      stanzas = content.split("\n\n").filter(Boolean);
    } else if (Array.isArray(content)) {
      stanzas = content;
    }

    if (stanzas.length === 0) {
      return <div className="italic text-muted-foreground text-xs">Content not available</div>
    }

    return (
      <div className="space-y-4">
        {stanzas.slice(0, 2).map((stanza, index) => (
          <div key={index} className="poem-stanza">
            {stanza.split("\n").map((line, lineIndex) => (
              <div 
                key={lineIndex} 
                className="poem-line leading-relaxed text-[11px] sm:text-xs"
              >
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        ))}
        {stanzas.length > 2 && (
          <div className="text-xs text-muted-foreground italic">...</div>
        )}
      </div>
    )
  }

  const getContentForLanguage = (lang: "en" | "hi" | "ur") => {
    return formatPoetryContent(poem.content?.[lang])
  }

  const getRawContentForCopy = (lang: "en" | "hi" | "ur") => {
    const content = poem.content?.[lang];
    if (!content) return "";
    if (typeof content === "string") return content;
    return content.join("\n\n");
  }

  const currentContent = getContentForLanguage(contentLang)

  const handleCopy = () => {
    const contentToCopy = getRawContentForCopy(contentLang);
    navigator.clipboard.writeText(contentToCopy).then(() => {
      toast.success("Verses copied", {
        description: "The poem verses have been copied to your clipboard",
        icon: <Copy className="h-4 w-4" />,
      });
    }).catch(() => {
      toast.error("Copy failed", {
        description: "Failed to copy the verses",
      });
    });
  }

  // Get language display names
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ur: "Urdu",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex flex-col" // Ensure column layout
    >
      <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="flex-grow p-3 sm:p-4 pt-4">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <Badge variant="secondary" className="font-serif capitalize text-xs">
              {poem.category}
            </Badge>
            <button
              className="p-1 sm:p-1.5 rounded-full hover:bg-muted transition-colors"
              onClick={() => handleReadlistToggle(poem._id, poem.title.en)}
              aria-label={isInReadlist ? "Remove from reading list" : "Add to reading list"}
            >
              {isInReadlist ? (
                <BookHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              ) : (
                <BookmarkPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2 font-serif">
            {poem.title[contentLang] || poem.title.en}
          </h3>

          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2 sm:mb-3 font-serif">
            <User className="h-3 w-3" /> {poem.author.name}
          </p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs sm:text-sm font-medium p-1.5 sm:p-2 rounded-md hover:bg-muted transition-colors"
            aria-expanded={isExpanded}
          >
            <span>View Verses</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2"
              >
                {availableLanguages.length > 1 && (
                  <div className="mb-2 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Languages className="h-3 w-3 text-muted-foreground" />
                      <Tabs
                        value={contentLang}
                        onValueChange={(value) => setContentLang(value as "en" | "hi" | "ur")}
                        className="w-auto"
                      >
                        <TabsList className="h-7">
                          {availableLanguages.map((lang) => (
                            <TabsTrigger key={lang} value={lang} className="text-xs px-2 py-0.5 h-5">
                              {languageNames[lang]}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      aria-label="Copy verses"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}

                <div className="bg-muted/30 p-2 sm:p-3 rounded-md font-serif poem-content">
                  <div className={contentLang === "ur" ? "text-right" : ""}>
                    {currentContent}
                  </div>
                </div>

                <div className="mt-3">
                  <Button asChild variant="default" size="sm" className="gap-1 font-serif text-xs w-full">
                    <Link href={`/poems/en/${poem.slug?.en || poem._id}`}>
                      <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> See Full Poem
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="p-3 pt-0 mt-auto">
          <div className="w-full flex items-center justify-end">
            {poem.readListCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookHeart className="h-3 w-3" />
                <span>{poem.readListCount}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
  // Ensure column layout
}
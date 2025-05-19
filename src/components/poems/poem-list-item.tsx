"use client"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import type { Poem } from "@/types/poem"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, ArrowRight, Heart, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"

interface PoemListItemProps {
  poem: Poem
  coverImage: string
  englishSlug: string
  isInReadlist: boolean
  poemTitle: string
  handleReadlistToggle: (id: string, title: string) => void
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function PoemListItem({
  poem,
  coverImage,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: PoemListItemProps) {
  const { authors, fetchAuthor } = useStore()
  const isSherCategory = poem.category.toLowerCase() === "sher"
  const authorData = poem.author._id ? authors[poem.author._id] : null

  // Fetch author data if not in store
  useEffect(() => {
    if (poem.author._id && !authorData) {
      fetchAuthor(poem.author._id)
    }
  }, [poem.author._id, authorData, fetchAuthor])

  const formatPoetryContent = (content: { verse: string; meaning: string }[] | undefined): React.ReactNode => {
    if (!content || content.length === 0 || !content[0]?.verse) {
      return <div className="text-zinc-500 italic text-xs">Content not available</div>
    }

    const lines = content[0].verse.split("\n").filter(Boolean)
    if (lines.length === 0) {
      return <div className="text-zinc-500 italic text-xs">Content not available</div>
    }

    return (
      <div className="space-y-1">
        {lines.slice(0, isSherCategory ? lines.length : 2).map((line, lineIndex) => (
          <div key={lineIndex} className="poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1">
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    )
  }

  const currentContent = poem.content?.en || []

  return (
    <motion.article variants={slideUp} className="h-full" whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 h-full bg-white dark:bg-black overflow-hidden group flex flex-col">
        <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6 border border-zinc-200 dark:border-zinc-800">
                  {authorData?.image ? (
                    <AvatarImage
                      src={authorData.image || "/placeholder.svg"}
                      alt={authorData.name || poem.author.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900">
                      <User className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                  {authorData?.name || poem.author.name || "Unknown Author"}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => handleReadlistToggle(poem._id, poemTitle)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-1"
              aria-label={isInReadlist ? "Remove from readlist" : "Add to readlist"}
            >
              <Heart
                className={`h-5 w-5 ${isInReadlist ? "fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" : "text-zinc-500"}`}
              />
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-grow">
          <Link href={`/poems/en/${englishSlug}`} className="block h-full">
            <div
              className={`${
                isSherCategory ? "mt-2" : "mt-0"
              } font-serif text-zinc-800 dark:text-zinc-200 border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 py-1 h-full`}
            >
              {formatPoetryContent(currentContent)}
            </div>
          </Link>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              {poem.category || "Uncategorized"}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <Eye className="h-3 w-3" />
              <span>{poem.viewsCount || 0}</span>
            </Badge>
          </div>
          <motion.div
            className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 text-xs font-medium"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href={`/poems/en/${englishSlug}`} className="flex items-center">
              <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">Read</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.article>
  )
}
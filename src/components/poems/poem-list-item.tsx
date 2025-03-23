"use client"

import Link from "next/link"
import Image from "next/image"
import { BookOpen, User, BookmarkPlus, BookmarkCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface PoemListItemProps {
  poem: Poem
  coverImage: string
  englishSlug: string
  isInReadlist: boolean
  poemTitle: string
  handleReadlistToggle: (id: string, title: string) => void
}

export function PoemListItem({
  poem,
  coverImage,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: PoemListItemProps) {
  return (
    <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md bg-background/80 backdrop-blur-sm">
      <div className="flex flex-row overflow-hidden">
        <div className="relative w-20 sm:w-24 md:w-28 aspect-square">
          <Image
            src={coverImage || "/placeholder.svg"}
            alt={poemTitle}
            fill
            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
            className="object-cover"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm flex items-center gap-1 text-[10px] capitalize"
          >
            {poem.category || "Poetry"}
          </Badge>
        </div>
        <div className="flex flex-col justify-between p-3 flex-1">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold line-clamp-1 font-serif">{poemTitle}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReadlistToggle(poem._id, poemTitle)}
                className={`${isInReadlist ? "text-primary" : "text-muted-foreground"} hover:text-primary p-1 h-auto`}
              >
                {isInReadlist ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              <span className="text-xs">{poem.author?.name || "Unknown Author"}</span>
            </div>
            {poem.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-1 font-serif mb-2">{poem.excerpt}</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <Link href={`/poems/${englishSlug}`} className="inline-flex">
              <Button variant="default" size="sm" className="gap-1 font-serif text-xs">
                <BookOpen className="h-3 w-3" /> Read Poem
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Heart className="h-3 w-3 mr-1 text-primary" />
                <span>{poem.readListCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


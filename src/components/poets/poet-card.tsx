"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, BookMarked, FileText, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Poet {
  _id: string
  name: string
  slug: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

interface PoetCardProps {
  poet: Poet
  variant?: "default" | "compact"
  featured?: boolean
}

export function PoetCard({ poet, variant = "default", featured = false }: PoetCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const totalPoems = (poet.ghazalCount || 0) + (poet.sherCount || 0)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  if (variant === "compact") {
    return (
      <Link href={`/poets/${poet.slug}`} className="block h-full">
        <motion.div
          className="group relative h-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-md"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 dark:from-purple-950 dark:via-slate-950 dark:to-fuchsia-950 border border-purple-200/60 dark:border-fuchsia-700/20 shadow-sm h-full">
            <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
              {poet.image ? (
                <Image
                  src={poet.image || "/placeholder.svg"}
                  alt={poet.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 180px, (max-width: 1200px) 220px, 260px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900 dark:to-fuchsia-900">
                  <span className="text-4xl font-semibold text-purple-600 dark:text-purple-300">
                    {getInitials(poet.name)}
                  </span>
                </div>
              )}

              {featured && (
                <div className="absolute left-2 top-2">
                  <Badge className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-xs font-medium border border-purple-200/40 dark:border-fuchsia-700/20 text-purple-700 dark:text-purple-300">
                    <Sparkles className="h-3 w-3 mr-1 text-fuchsia-500 dark:text-fuchsia-400" />
                    Featured
                  </Badge>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-3 flex flex-col justify-between">
              <h3 className="line-clamp-1 font-medium text-purple-800 dark:text-purple-300">{poet.name}</h3>

              <div className="mt-1">
                {totalPoems > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                    <BookOpen className="h-3 w-3" />
                    <span className="truncate">
                      {poet.ghazalCount > 0 && `${poet.ghazalCount} ghazal${poet.ghazalCount !== 1 ? "s" : ""}`}
                      {poet.ghazalCount > 0 && poet.sherCount > 0 && ", "}
                      {poet.sherCount > 0 && `${poet.sherCount} sher${poet.sherCount !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-purple-500/70 dark:text-purple-400/70">No works found</p>
                )}
              </div>
            </div>

            <div className="p-2 pt-0 mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-8 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
              >
                View Profile
              </Button>
            </div>

            <div
              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/80 to-fuchsia-900/80 p-4 opacity-0 transition-opacity duration-300 ${
                isHovering ? "opacity-100" : ""
              }`}
            >
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-purple-800">View Profile</span>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/poets/${poet.slug}`} className="block h-full">
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-md border border-purple-200/60 dark:border-fuchsia-700/20 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 dark:from-purple-950 dark:via-slate-950 dark:to-fuchsia-950">
        <div className="relative aspect-square w-full overflow-hidden">
          {poet.image ? (
            <Image
              src={poet.image || "/placeholder.svg"}
              alt={poet.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900 dark:to-fuchsia-900">
              <span className="text-5xl font-semibold text-purple-600 dark:text-purple-300">
                {getInitials(poet.name)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-0 w-full p-3">
            <h3 className="line-clamp-1 text-lg font-medium text-white drop-shadow-md">{poet.name}</h3>
          </div>
        </div>

        <CardContent className="p-3 pt-2">
          <div className="flex flex-col gap-1">
            {totalPoems > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-purple-600 dark:text-purple-400">
                {poet.ghazalCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 border border-purple-200/40 dark:border-fuchsia-700/20">
                    <BookMarked className="h-3 w-3" />
                    {poet.ghazalCount} {poet.ghazalCount === 1 ? "ghazal" : "ghazals"}
                  </span>
                )}

                {poet.sherCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 border border-purple-200/40 dark:border-fuchsia-700/20">
                    <FileText className="h-3 w-3" />
                    {poet.sherCount} {poet.sherCount === 1 ? "sher" : "shers"}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-purple-500/70 dark:text-purple-400/70">No works found</p>
            )}
          </div>
        </CardContent>

        <div className="border-t border-purple-200/40 dark:border-fuchsia-700/20 p-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          >
            View Profile
          </Button>
        </div>
      </Card>
    </Link>
  )
}

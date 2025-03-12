"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { VerseDownload } from "@/components/home/verse-download"

interface LineOfTheDayProps {
  lineOfTheDay: string
  lineAuthor: string
  coverImage: string
  poemOfTheDay?: any
  todayDate: string
}

export function LineOfTheDay({ lineOfTheDay, lineAuthor, coverImage, poemOfTheDay, todayDate }: LineOfTheDayProps) {
  const formatVerseForDisplay = (verse: string) => {
    if (!verse) return ["No verse available"]
    const lines = []
    const maxLength = 40
    const verseLines = verse.split("\n").filter(Boolean)

    for (const line of verseLines) {
      if (line.length <= maxLength) lines.push(line)
      else {
        const words = line.split(" ")
        let currentLine = ""
        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word
          if (testLine.length <= maxLength) currentLine = testLine
          else {
            if (currentLine) lines.push(currentLine)
            currentLine = word
          }
        }
        if (currentLine) lines.push(currentLine)
      }
    }
    return lines.length > 0 ? lines : [verse]
  }

  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif">Line of the Day</h2>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-serif">{todayDate}</div>
          </div>

          {lineOfTheDay ? (
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <div className="absolute inset-0 z-0">
                <Image
                  src={coverImage || "/placeholder.svg?height=800&width=1200" || "/placeholder.svg"}
                  alt="Line of the Day background"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col items-center text-center text-white">
                <div className="text-sm sm:text-base md:text-xl italic font-serif mb-4 leading-relaxed">
                  {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
                    <p key={index} className="mb-2">
                      "{line}"
                    </p>
                  ))}
                </div>
                <Separator className="w-12 sm:w-16 my-3 sm:my-4 bg-white/30" />
                <p className="text-xs sm:text-sm md:text-base text-white/80 font-serif mb-6">— {lineAuthor}</p>

                <div className="flex items-center justify-center gap-3 w-full ">
                  <VerseDownload
                    verse={lineOfTheDay}
                    author={lineAuthor}
                    imageUrl={coverImage || "/placeholder.svg?height=800&width=1200"}
                    title="Line of the Day"
                    languages={poemOfTheDay?.content}
                  />

                  {poemOfTheDay && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="gap-2 font-serif text-xs sm:text-sm text-black border"
                    >
                      <Link href={`/poems/${poemOfTheDay.slug?.en || poemOfTheDay._id}`}>
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Read Full Poem</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 sm:p-12 bg-muted/20 rounded-lg border border-primary/10">
              <p className="text-muted-foreground italic font-serif">No line of the day available</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}


"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, Share2, Sparkles } from "lucide-react"

interface VerseDownloadProps {
  verse: string
  author: string
  imageUrl: string
  title?: string
  languages?: {
    en?: string[] | string
    hi?: string[] | string
    ur?: string[] | string
  }
}

export function VerseDownload({ verse, author, imageUrl, title = "Verse", languages }: VerseDownloadProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi" | "ur">("en")
  const [selectedVerse, setSelectedVerse] = useState<string>(verse)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const versesMap = {
    en:
      typeof languages?.en === "string"
        ? languages.en.split("\n").filter(Boolean)
        : Array.isArray(languages?.en)
          ? languages.en
          : [verse],
    hi:
      typeof languages?.hi === "string"
        ? languages.hi.split("\n").filter(Boolean)
        : Array.isArray(languages?.hi)
          ? languages.hi
          : [],
    ur:
      typeof languages?.ur === "string"
        ? languages.ur.split("\n").filter(Boolean)
        : Array.isArray(languages?.ur)
          ? languages.ur
          : [],
  }

  const handleLanguageChange = (lang: "en" | "hi" | "ur") => {
    setDownloadLanguage(lang)
    if (versesMap[lang].length > 0) setSelectedVerse(versesMap[lang][0])
  }

  const renderVerseToCanvas = async (verse: string, imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) return reject("Canvas not found")
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject("Unable to get canvas context")

      const img: HTMLImageElement = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        let fontFamily = "serif"
        if (downloadLanguage === "ur") {
          fontFamily = "Noto Nastaliq Urdu, serif"
          ctx.direction = "rtl"
        } else if (downloadLanguage === "hi") fontFamily = "Noto Sans Devanagari, serif"
        const fontSize = Math.max(canvas.width * 0.035, 24)
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.fillStyle = "white"

        const lines = []
        const maxWidth = canvas.width * 0.8
        const verseLines = verse.split("\n").filter(Boolean) // Split by explicit newlines

        for (const line of verseLines) {
          if (ctx.measureText(line).width <= maxWidth) lines.push(line)
          else {
            const words = line.split(" ")
            let currentLine = ""
            for (const word of words) {
              const testLine = currentLine + (currentLine ? " " : "") + word
              if (ctx.measureText(testLine).width <= maxWidth) currentLine = testLine
              else {
                if (currentLine) lines.push(currentLine)
                currentLine = word
              }
            }
            if (currentLine) lines.push(currentLine)
          }
        }

        const lineHeight = fontSize * 1.5
        const totalTextHeight = lines.length * lineHeight
        let yPosition = (canvas.height - totalTextHeight) / 2
        for (const line of lines) {
          ctx.fillText(line, canvas.width / 2, yPosition)
          yPosition += lineHeight
        }

        ctx.font = `italic ${fontSize * 0.8}px ${fontFamily}`
        ctx.fillText(`— ${author}`, canvas.width / 2, canvas.height * 0.85)

        resolve(canvas.toDataURL("image/jpeg", 0.9))
      }
      img.onerror = () => reject("Failed to load image")
      img.src = imageUrl
    })
  }

  const downloadVerseImage = async () => {
    if (!selectedVerse) return
    try {
      toast.loading("Creating your verse image...")
      const dataUrl = await renderVerseToCanvas(selectedVerse, imageUrl)

      const downloadLink = document.createElement("a")
      downloadLink.href = dataUrl
      const formattedTitle = title.replace(/\s+/g, "-").toLowerCase()
      downloadLink.download = `${formattedTitle}-verse.jpg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setShowDownloadDialog(false)
      toast.dismiss()
      toast.success("Verse image downloaded", {
        description: "Your verse has been captured as an image",
        icon: <Sparkles className="h-4 w-4" />,
      })
    } catch (error) {
      console.error("Error generating verse image:", error)
      toast.dismiss()
      toast.error("Download failed", { description: "Could not create your verse image. Please try again." })
    }
  }

  const shareVerse = async () => {
    if (!verse) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `"${verse}" — ${author}`,
          url: window.location.href,
        })
        toast.success("Shared successfully")
      } else {
        await navigator.clipboard.writeText(`"${verse}" — ${author}`)
        toast.success("Copied to clipboard", {
          description: "The verse has been copied to your clipboard",
        })
      }
    } catch (error) {
      toast.error("Sharing failed", { description: "Could not share the verse. Please try again." })
    }
  }

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-2 ">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDownloadDialog(true)}
          className="gap-2 font-serif text-xs sm:text-sm text-black"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>

        <Button variant="outline" size="sm" onClick={shareVerse} className=" text-black gap-2 font-serif text-xs sm:text-sm">
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="border border-primary/20 sm:max-w-[525px]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Verse Image
              </DialogTitle>
              <DialogDescription>Select a verse and language to create a shareable image</DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-5">
              {(versesMap.hi.length > 0 || versesMap.ur.length > 0) && (
                <div className="space-y-2">
                  <Label htmlFor="download-language" className="font-serif">
                    Language
                  </Label>
                  <RadioGroup
                    defaultValue={downloadLanguage}
                    onValueChange={(value: string) => handleLanguageChange(value as "en" | "hi" | "ur")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="en" disabled={!versesMap.en.length} />
                      <Label htmlFor="en">English</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hi" id="hi" disabled={!versesMap.hi.length} />
                      <Label htmlFor="hi">Hindi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ur" id="ur" disabled={!versesMap.ur.length} />
                      <Label htmlFor="ur">Urdu</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {versesMap[downloadLanguage].length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="selected-verse" className="font-serif">
                    Select Verse
                  </Label>
                  <Select value={selectedVerse} onValueChange={setSelectedVerse}>
                    <SelectTrigger className="w-full font-serif">
                      <SelectValue placeholder="Choose a verse" />
                    </SelectTrigger>
                    <SelectContent>
                      {versesMap[downloadLanguage].map((verse, index) => (
                        <SelectItem key={index} value={verse} className="font-serif whitespace-normal">
                          {verse.substring(0, 60)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedVerse && (
                <div className="p-4 bg-muted/30 border rounded-md max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2 font-serif">Preview:</h4>
                  <div className={`text-sm italic ${downloadLanguage === "ur" ? "rtl text-right" : ""}`}>
                    {selectedVerse}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadDialog(false)} className="font-serif">
                Cancel
              </Button>
              <Button onClick={downloadVerseImage} className="font-serif gap-2" disabled={!selectedVerse}>
                <Download className="h-4 w-4" />
                Download Image
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import {
  PenLine,
  BookOpen,
  Tag,
  Upload,
  Loader2,
  X,
  Check,
  AlertCircle,
  User,
  Calendar,
  Languages,
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react"

type Author = {
  _id: string
  name: string
}

type Poem = {
  _id: string
  title: { en: string; hi: string; ur: string }
  content: { en: string[]; hi: string[]; ur: string[] }
  slug: { en: string; hi: string; ur: string }
  category: string
  status: string
  tags: string[]
  coverImage: string
  author: { _id: string; name: string }
}

export function PoemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const poemId = searchParams.get("id")

  // Form fields
  const [contentType, setContentType] = useState("sher")
  const [titleEn, setTitleEn] = useState("")
  const [titleHi, setTitleHi] = useState("")
  const [titleUr, setTitleUr] = useState("")
  const [contentEn, setContentEn] = useState<string[]>([""])
  const [contentHi, setContentHi] = useState<string[]>([""])
  const [contentUr, setContentUr] = useState<string[]>([""])
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState("published")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [authorId, setAuthorId] = useState<string>("")
  const [preview, setPreview] = useState<string>("")
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    fetchAuthors()
    if (poemId) {
      fetchPoem(poemId)
      setIsEditing(true)
    }
  }, [poemId])

  const fetchAuthors = async () => {
    try {
      const res = await fetch("/api/authors", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch authors")
      const data = await res.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error("Error fetching authors:", error)
      toast.error("Failed to load authors", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPoem = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/poem/${id}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch poem")
      const data = await res.json()
      const poem: Poem = data.poem

      setTitleEn(poem.title.en)
      setTitleHi(poem.title.hi)
      setTitleUr(poem.title.ur)
      setContentEn(poem.content.en.length ? poem.content.en : [""])
      setContentHi(poem.content.hi.length ? poem.content.hi : [""])
      setContentUr(poem.content.ur.length ? poem.content.ur : [""])
      setContentType(poem.category)
      setStatus(poem.status)
      setTags(poem.tags.join(", "))
      setAuthorId(poem.author._id)
      setPreview(poem.coverImage)
    } catch (error) {
      console.error("Error fetching poem:", error)
      toast.error("Failed to load poem", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        toast.error("Image size should be less than 5MB", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
        return
      }

      setCoverImage(file)
      setPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const generateSlug = (title: string, authorName: string, lang: string) => {
    const baseSlug = `${title}-${authorName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    return `${baseSlug}-${lang}-${Date.now()}`
  }

  const resetForm = () => {
    setTitleEn("")
    setTitleHi("")
    setTitleUr("")
    setContentEn([""])
    setContentHi([""])
    setContentUr([""])
    setContentType("sher")
    setStatus("published")
    setTags("")
    setCoverImage(null)
    setAuthorId("")
    setPreview("")
    setIsEditing(false)
    setError(null)
    setActiveTab("basic")
  }

  const addVerse = (lang: "en" | "hi" | "ur") => {
    if (lang === "en") setContentEn([...contentEn, ""])
    if (lang === "hi") setContentHi([...contentHi, ""])
    if (lang === "ur") setContentUr([...contentUr, ""])
  }

  const removeVerse = (lang: "en" | "hi" | "ur", index: number) => {
    if (lang === "en" && contentEn.length > 1) {
      setContentEn(contentEn.filter((_, i) => i !== index))
    }
    if (lang === "hi" && contentHi.length > 1) {
      setContentHi(contentHi.filter((_, i) => i !== index))
    }
    if (lang === "ur" && contentUr.length > 1) {
      setContentUr(contentUr.filter((_, i) => i !== index))
    }
  }

  const updateVerse = (lang: "en" | "hi" | "ur", index: number, value: string) => {
    if (lang === "en") {
      const newContent = [...contentEn]
      newContent[index] = value
      setContentEn(newContent)
    }
    if (lang === "hi") {
      const newContent = [...contentHi]
      newContent[index] = value
      setContentHi(newContent)
    }
    if (lang === "ur") {
      const newContent = [...contentUr]
      newContent[index] = value
      setContentUr(newContent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authorId) {
      setError("Please select an author")
      toast.error("Please select an author", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    if (!titleEn || !contentEn.some((v) => v.trim())) {
      setError("Title and at least one verse are required in English")
      toast.error("Title and at least one verse are required in English", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    const author = authors.find((a) => a._id === authorId)
    if (!author) {
      toast.error("Selected author not found", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("titleEn", titleEn)
    formData.append("titleHi", titleHi)
    formData.append("titleUr", titleUr)
    contentEn.filter((v) => v.trim()).forEach((verse) => formData.append("contentEn[]", verse))
    contentHi.filter((v) => v.trim()).forEach((verse) => formData.append("contentHi[]", verse))
    contentUr.filter((v) => v.trim()).forEach((verse) => formData.append("contentUr[]", verse))
    formData.append("category", contentType)
    formData.append("status", status)
    formData.append("authorId", authorId)
    if (tags) formData.append("tags", tags)
    if (coverImage) formData.append("coverImage", coverImage)

    if (isEditing && poemId) {
      // Editing existing poem
      formData.append("slugEn", generateSlug(titleEn, author.name, "en"))
      formData.append("slugHi", generateSlug(titleHi || titleEn, author.name, "hi"))
      formData.append("slugUr", generateSlug(titleUr || titleEn, author.name, "ur"))

      try {
        const res = await fetch(`/api/poem/${poemId}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        })

        const data = await res.json()

        if (res.ok) {
          toast.success("Poem updated successfully!", {
            icon: <Check className="h-5 w-5" />,
          })
          router.push("/admin/manage-poems")
        } else {
          setError(data.error || "Failed to update poem")
          toast.error(data.error || "Failed to update poem", {
            icon: <AlertCircle className="h-5 w-5" />,
          })
        }
      } catch (error) {
        console.error("Error updating poem:", error)
        toast.error("Failed to update poem. Please try again.", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Adding new poem
      const slugEn = generateSlug(titleEn, author.name, "en")
      const slugHi = titleHi ? generateSlug(titleHi, author.name, "hi") : slugEn
      const slugUr = titleUr ? generateSlug(titleUr, author.name, "ur") : slugEn

      formData.append("slugEn", slugEn)
      formData.append("slugHi", slugHi)
      formData.append("slugUr", slugUr)

      try {
        const res = await fetch("/api/poem", {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        const data = await res.json()

        if (res.ok) {
          toast.success("Poetry added successfully!", {
            icon: <Check className="h-5 w-5" />,
          })
          resetForm()
        } else {
          setError(data.error || "Failed to add poetry")
          toast.error(data.error || "Failed to add poetry", {
            icon: <AlertCircle className="h-5 w-5" />,
          })
        }
      } catch (error) {
        console.error("Error adding poetry:", error)
        toast.error("Failed to add poetry. Please try again.", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 md:mb-16"
    >
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Poem" : "Add New Poetry"}
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/manage-poems" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Poems
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading poem data...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Media & Tags
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="basic" className="space-y-4 md:space-y-6">
                  <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="content-type" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Content Type
                      </Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger id="content-type" className="border-primary/20 focus-visible:ring-primary">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sher">Sher</SelectItem>
                          <SelectItem value="ghazal">Ghazal</SelectItem>
                          <SelectItem value="poem">Poem</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="author" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Author
                      </Label>
                      <Select value={authorId} onValueChange={setAuthorId}>
                        <SelectTrigger id="author" className="border-primary/20 focus-visible:ring-primary">
                          <SelectValue placeholder="Select an author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem key={author._id} value={author._id}>
                              {author.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="status" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="border-primary/20 focus-visible:ring-primary">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-3 md:pt-4 flex justify-end">
                    <Button type="button" onClick={() => setActiveTab("content")} className="flex items-center gap-2">
                      Continue to Content
                      <Languages className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="title-en" className="flex items-center gap-2">
                        <PenLine className="h-4 w-4 text-primary" />
                        Title (English)
                      </Label>
                      <Input
                        id="title-en"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="Enter title in English"
                        required
                        className="border-primary/20 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="title-hi" className="flex items-center gap-2">
                        <PenLine className="h-4 w-4 text-primary" />
                        Title (Hindi)
                      </Label>
                      <Input
                        id="title-hi"
                        value={titleHi}
                        onChange={(e) => setTitleHi(e.target.value)}
                        placeholder="Enter title in Hindi"
                        className="border-primary/20 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="title-ur" className="flex items-center gap-2">
                        <PenLine className="h-4 w-4 text-primary" />
                        Title (Urdu)
                      </Label>
                      <Input
                        id="title-ur"
                        value={titleUr}
                        onChange={(e) => setTitleUr(e.target.value)}
                        placeholder="Enter title in Urdu"
                        className="border-primary/20 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <Tabs defaultValue="english" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="english">English</TabsTrigger>
                      <TabsTrigger value="hindi">Hindi</TabsTrigger>
                      <TabsTrigger value="urdu">Urdu</TabsTrigger>
                    </TabsList>

                    <TabsContent value="english" className="space-y-3 md:space-y-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Content (English)
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVerse("en")}
                            className="h-8 flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Verse
                          </Button>
                        </div>
                        <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {contentEn.map((verse, index) => (
                            <div key={index} className="relative">
                              <Textarea
                                value={verse}
                                onChange={(e) => updateVerse("en", index, e.target.value)}
                                placeholder={`Verse ${index + 1}`}
                                className="min-h-[70px] md:min-h-[80px] pr-10 border-primary/20 focus-visible:ring-primary"
                              />
                              {contentEn.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVerse("en", index)}
                                  className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="hindi" className="space-y-3 md:space-y-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Content (Hindi)
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVerse("hi")}
                            className="h-8 flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Verse
                          </Button>
                        </div>
                        <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {contentHi.map((verse, index) => (
                            <div key={index} className="relative">
                              <Textarea
                                value={verse}
                                onChange={(e) => updateVerse("hi", index, e.target.value)}
                                placeholder={`Verse ${index + 1}`}
                                className="min-h-[70px] md:min-h-[80px] pr-10 border-primary/20 focus-visible:ring-primary"
                              />
                              {contentHi.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVerse("hi", index)}
                                  className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="urdu" className="space-y-3 md:space-y-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Content (Urdu)
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVerse("ur")}
                            className="h-8 flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Verse
                          </Button>
                        </div>
                        <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {contentUr.map((verse, index) => (
                            <div key={index} className="relative">
                              <Textarea
                                value={verse}
                                onChange={(e) => updateVerse("ur", index, e.target.value)}
                                placeholder={`Verse ${index + 1}`}
                                className="min-h-[70px] md:min-h-[80px] pr-10 border-primary/20 focus-visible:ring-primary"
                              />
                              {contentUr.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVerse("ur", index)}
                                  className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between pt-3 md:pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Basic Info
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("media")} className="flex items-center gap-2">
                      Continue to Media & Tags
                      <Upload className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="tags" className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        placeholder="Enter comma-separated tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary"
                      />
                      {tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.split(",").map(
                            (tag, index) =>
                              tag.trim() && (
                                <Badge key={index} variant="secondary">
                                  {tag.trim()}
                                </Badge>
                              ),
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="cover-image" className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary" />
                        Cover Image
                      </Label>
                      <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                        <input
                          id="cover-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="cover-image"
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          {preview ? (
                            <div className="relative">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt="Cover Preview"
                                className="h-40 w-60 object-cover rounded-md border-4 border-primary/20"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCoverImage(null)
                                  setPreview("")
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <BookOpen className="h-12 w-12 text-primary/60" />
                              <p className="text-sm font-medium">Click to upload cover image</p>
                              <p className="text-xs text-muted-foreground">JPG, PNG or GIF, max 5MB</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-1.5 md:gap-2 pt-3 md:pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("content")}
                        className="w-full sm:w-auto"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Content
                      </Button>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isEditing ? "Updating..." : "Adding..."}
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              {isEditing ? "Update Poem" : "Add Poetry"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}


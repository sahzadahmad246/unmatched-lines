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
  Info,
} from "lucide-react"

type Author = {
  _id: string
  name: string
}

type Verse = {
  verse: string
  meaning: string
}

type FAQ = {
  question: { en: string; hi: string; ur: string }
  answer: { en: string; hi: string; ur: string }
}

type Poem = {
  _id: string
  title: { en: string; hi: string; ur: string }
  content: { en: Verse[]; hi: Verse[]; ur: Verse[] }
  slug: { en: string; hi: string; ur: string }
  category: string
  status: string
  tags: string[]
  coverImage: string
  author: { _id: string; name: string }
  summary: { en: string; hi: string; ur: string }
  didYouKnow: { en: string; hi: string; ur: string }
  faqs: FAQ[]
  viewsCount: number
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
  const [contentEn, setContentEn] = useState<Verse[]>([{ verse: "", meaning: "" }])
  const [contentHi, setContentHi] = useState<Verse[]>([{ verse: "", meaning: "" }])
  const [contentUr, setContentUr] = useState<Verse[]>([{ verse: "", meaning: "" }])
  const [summaryEn, setSummaryEn] = useState("")
  const [summaryHi, setSummaryHi] = useState("")
  const [summaryUr, setSummaryUr] = useState("")
  const [didYouKnowEn, setDidYouKnowEn] = useState("")
  const [didYouKnowHi, setDidYouKnowHi] = useState("")
  const [didYouKnowUr, setDidYouKnowUr] = useState("")
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [viewsCount, setViewsCount] = useState(0)
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState("published")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [authorId, setAuthorId] = useState<string>("")
  const [preview, setPreview] = useState<string>("")
  const [activeTab, setActiveTab] = useState("basic")
  const [contentLangTab, setContentLangTab] = useState("english")

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
      setContentEn(poem.content.en.length ? poem.content.en : [{ verse: "", meaning: "" }])
      setContentHi(poem.content.hi.length ? poem.content.hi : [{ verse: "", meaning: "" }])
      setContentUr(poem.content.ur.length ? poem.content.ur : [{ verse: "", meaning: "" }])
      setSummaryEn(poem.summary?.en || "")
      setSummaryHi(poem.summary?.hi || "")
      setSummaryUr(poem.summary?.ur || "")
      setDidYouKnowEn(poem.didYouKnow?.en || "")
      setDidYouKnowHi(poem.didYouKnow?.hi || "")
      setDidYouKnowUr(poem.didYouKnow?.ur || "")
      setFaqs(poem.faqs?.length ? poem.faqs : [])
      setViewsCount(poem.viewsCount || 0)
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
    setContentEn([{ verse: "", meaning: "" }])
    setContentHi([{ verse: "", meaning: "" }])
    setContentUr([{ verse: "", meaning: "" }])
    setSummaryEn("")
    setSummaryHi("")
    setSummaryUr("")
    setDidYouKnowEn("")
    setDidYouKnowHi("")
    setDidYouKnowUr("")
    setFaqs([])
    setViewsCount(0)
    setContentType("sher")
    setStatus("published")
    setTags("")
    setCoverImage(null)
    setAuthorId("")
    setPreview("")
    setIsEditing(false)
    setError(null)
    setActiveTab("basic")
    setContentLangTab("english")
  }

  const addVerse = (lang: "en" | "hi" | "ur") => {
    if (lang === "en") setContentEn([...contentEn, { verse: "", meaning: "" }])
    if (lang === "hi") setContentHi([...contentHi, { verse: "", meaning: "" }])
    if (lang === "ur") setContentUr([...contentUr, { verse: "", meaning: "" }])
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

  const updateVerse = (lang: "en" | "hi" | "ur", index: number, field: "verse" | "meaning", value: string) => {
    if (lang === "en") {
      const newContent = [...contentEn]
      newContent[index][field] = value
      setContentEn(newContent)
    }
    if (lang === "hi") {
      const newContent = [...contentHi]
      newContent[index][field] = value
      setContentHi(newContent)
    }
    if (lang === "ur") {
      const newContent = [...contentUr]
      newContent[index][field] = value
      setContentUr(newContent)
    }
  }

  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        question: { en: "", hi: "", ur: "" },
        answer: { en: "", hi: "", ur: "" },
      },
    ])
  }

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: "question" | "answer", lang: "en" | "hi" | "ur", value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field][lang] = value
    setFaqs(newFaqs)
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

    if (!titleEn || !contentEn.some((v) => v.verse.trim())) {
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
    formData.append("contentEn", JSON.stringify(contentEn.filter((v) => v.verse.trim())))
    formData.append("contentHi", JSON.stringify(contentHi.filter((v) => v.verse.trim())))
    formData.append("contentUr", JSON.stringify(contentUr.filter((v) => v.verse.trim())))
    formData.append("summaryEn", summaryEn)
    formData.append("summaryHi", summaryHi)
    formData.append("summaryUr", summaryUr)
    formData.append("didYouKnowEn", didYouKnowEn)
    formData.append("didYouKnowHi", didYouKnowHi)
    formData.append("didYouKnowUr", didYouKnowUr)
    formData.append("faqs", JSON.stringify(faqs))
    formData.append("viewsCount", viewsCount.toString())
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
      className="container mx-auto px-4 py-6"
    >
      <Card className="w-full overflow-hidden shadow-lg border-0">
        <div className="h-2 bg-black" />
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <PenLine className="h-6 w-6" />
              {isEditing ? "Edit Poem" : "Add New Poetry"}
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/manage-poems" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Poems
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Loading poem data...</p>
            </div>
          ) : (
            <div className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-muted/40">
                  <TabsTrigger
                    value="basic"
                    className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Basic Info</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <span className="font-medium">Content</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="additional"
                    className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span className="font-medium">Additional</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="p-6 w-full">
                  <TabsContent value="basic" className="mt-0 space-y-6 w-full">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="content-type" className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Content Type
                        </Label>
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger id="content-type" className="w-full">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sher">Sher</SelectItem>
                            <SelectItem value="ghazal">Ghazal</SelectItem>
                            <SelectItem value="nazm">Nazm</SelectItem>
                            <SelectItem value="rubai">Rubai</SelectItem>
                            <SelectItem value="marsiya">Marsiya</SelectItem>
                            <SelectItem value="qataa">Qataa</SelectItem>
                            <SelectItem value="poem">Poem</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author" className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Author
                        </Label>
                        <Select value={authorId} onValueChange={setAuthorId}>
                          <SelectTrigger id="author" className="w-full">
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

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger id="status" className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Tags
                        </Label>
                        <Input
                          id="tags"
                          placeholder="Enter comma-separated tags"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                        {tags && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.split(",").map(
                              (tag, index) =>
                                tag.trim() && (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  >
                                    {tag.trim()}
                                  </Badge>
                                ),
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="cover-image" className="text-sm font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Cover Image
                        </Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
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
                                  className="h-40 w-60 object-cover rounded-md border-4 border-gray-100"
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
                                <BookOpen className="h-12 w-12 text-gray-300" />
                                <p className="text-sm font-medium">Click to upload cover image</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG or GIF, max 5MB</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("content")}
                        className="bg-black hover:bg-gray-800"
                      >
                        Continue to Content
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-0 space-y-6 w-full">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="title-en" className="text-sm font-medium flex items-center gap-2">
                          <PenLine className="h-4 w-4" />
                          Title (English)
                        </Label>
                        <Input
                          id="title-en"
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="Enter title in English"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title-hi" className="text-sm font-medium flex items-center gap-2">
                          <PenLine className="h-4 w-4" />
                          Title (Hindi)
                        </Label>
                        <Input
                          id="title-hi"
                          value={titleHi}
                          onChange={(e) => setTitleHi(e.target.value)}
                          placeholder="Enter title in Hindi"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title-ur" className="text-sm font-medium flex items-center gap-2">
                          <PenLine className="h-4 w-4" />
                          Title (Urdu)
                        </Label>
                        <Input
                          id="title-ur"
                          value={titleUr}
                          onChange={(e) => setTitleUr(e.target.value)}
                          placeholder="Enter title in Urdu"
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Tabs value={contentLangTab} onValueChange={setContentLangTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-muted/40">
                          <TabsTrigger
                            value="english"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            English
                          </TabsTrigger>
                          <TabsTrigger
                            value="hindi"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            Hindi
                          </TabsTrigger>
                          <TabsTrigger
                            value="urdu"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            Urdu
                          </TabsTrigger>
                        </TabsList>

                        <div className="p-4">
                          <TabsContent value="english" className="mt-0 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Content (English)
                              </h3>
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
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                              {contentEn.map((verse, index) => (
                                <div key={index} className="relative border rounded-lg p-4 bg-white shadow-sm">
                                  <div className="space-y-2">
                                    <Label className="font-medium">Verse {index + 1}</Label>
                                    <Textarea
                                      value={verse.verse}
                                      onChange={(e) => updateVerse("en", index, "verse", e.target.value)}
                                      placeholder={`Verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  <div className="space-y-2 mt-3">
                                    <Label className="font-medium">Meaning</Label>
                                    <Textarea
                                      value={verse.meaning}
                                      onChange={(e) => updateVerse("en", index, "meaning", e.target.value)}
                                      placeholder={`Meaning of verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  {contentEn.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeVerse("en", index)}
                                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="hindi" className="mt-0 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Content (Hindi)
                              </h3>
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
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                              {contentHi.map((verse, index) => (
                                <div key={index} className="relative border rounded-lg p-4 bg-white shadow-sm">
                                  <div className="space-y-2">
                                    <Label className="font-medium">Verse {index + 1}</Label>
                                    <Textarea
                                      value={verse.verse}
                                      onChange={(e) => updateVerse("hi", index, "verse", e.target.value)}
                                      placeholder={`Verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  <div className="space-y-2 mt-3">
                                    <Label className="font-medium">Meaning</Label>
                                    <Textarea
                                      value={verse.meaning}
                                      onChange={(e) => updateVerse("hi", index, "meaning", e.target.value)}
                                      placeholder={`Meaning of verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  {contentHi.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeVerse("hi", index)}
                                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="urdu" className="mt-0 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Content (Urdu)
                              </h3>
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
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                              {contentUr.map((verse, index) => (
                                <div key={index} className="relative border rounded-lg p-4 bg-white shadow-sm">
                                  <div className="space-y-2">
                                    <Label className="font-medium">Verse {index + 1}</Label>
                                    <Textarea
                                      value={verse.verse}
                                      onChange={(e) => updateVerse("ur", index, "verse", e.target.value)}
                                      placeholder={`Verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  <div className="space-y-2 mt-3">
                                    <Label className="font-medium">Meaning</Label>
                                    <Textarea
                                      value={verse.meaning}
                                      onChange={(e) => updateVerse("ur", index, "meaning", e.target.value)}
                                      placeholder={`Meaning of verse ${index + 1}`}
                                      className="min-h-[70px] resize-none"
                                    />
                                  </div>
                                  {contentUr.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeVerse("ur", index)}
                                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("basic")}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Basic Info
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("additional")}
                        className="bg-black hover:bg-gray-800"
                      >
                        Continue to Additional Info
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="additional" className="mt-0 space-y-6 w-full">
                    <div className="border rounded-lg overflow-hidden">
                      <Tabs defaultValue="english" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-muted/40">
                          <TabsTrigger
                            value="english"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            English
                          </TabsTrigger>
                          <TabsTrigger
                            value="hindi"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            Hindi
                          </TabsTrigger>
                          <TabsTrigger
                            value="urdu"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black rounded-none"
                          >
                            Urdu
                          </TabsTrigger>
                        </TabsList>

                        <div className="p-4">
                          <TabsContent value="english" className="mt-0 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="summary-en" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Summary (English)
                              </Label>
                              <Textarea
                                id="summary-en"
                                value={summaryEn}
                                onChange={(e) => setSummaryEn(e.target.value)}
                                placeholder="Enter summary in English"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="didYouKnow-en" className="text-sm font-medium flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Did You Know (English)
                              </Label>
                              <Textarea
                                id="didYouKnow-en"
                                value={didYouKnowEn}
                                onChange={(e) => setDidYouKnowEn(e.target.value)}
                                placeholder="Enter fun fact in English"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="hindi" className="mt-0 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="summary-hi" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Summary (Hindi)
                              </Label>
                              <Textarea
                                id="summary-hi"
                                value={summaryHi}
                                onChange={(e) => setSummaryHi(e.target.value)}
                                placeholder="Enter summary in Hindi"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="didYouKnow-hi" className="text-sm font-medium flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Did You Know (Hindi)
                              </Label>
                              <Textarea
                                id="didYouKnow-hi"
                                value={didYouKnowHi}
                                onChange={(e) => setDidYouKnowHi(e.target.value)}
                                placeholder="Enter fun fact in Hindi"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="urdu" className="mt-0 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="summary-ur" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Summary (Urdu)
                              </Label>
                              <Textarea
                                id="summary-ur"
                                value={summaryUr}
                                onChange={(e) => setSummaryUr(e.target.value)}
                                placeholder="Enter summary in Urdu"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="didYouKnow-ur" className="text-sm font-medium flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Did You Know (Urdu)
                              </Label>
                              <Textarea
                                id="didYouKnow-ur"
                                value={didYouKnowUr}
                                onChange={(e) => setDidYouKnowUr(e.target.value)}
                                placeholder="Enter fun fact in Urdu"
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          FAQs
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFAQ}
                          className="h-8 flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add FAQ
                        </Button>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {faqs.map((faq, index) => (
                          <div key={index} className="relative border rounded-lg p-4 bg-white shadow-sm">
                            <Tabs defaultValue="en" className="w-full">
                              <TabsList className="w-full grid grid-cols-3 mb-3">
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="hi">Hindi</TabsTrigger>
                                <TabsTrigger value="ur">Urdu</TabsTrigger>
                              </TabsList>
                              <TabsContent value="en" className="space-y-3">
                                <div>
                                  <Label>Question (English)</Label>
                                  <Input
                                    value={faq.question.en}
                                    onChange={(e) => updateFAQ(index, "question", "en", e.target.value)}
                                    placeholder="Enter question in English"
                                  />
                                </div>
                                <div>
                                  <Label>Answer (English)</Label>
                                  <Textarea
                                    value={faq.answer.en}
                                    onChange={(e) => updateFAQ(index, "answer", "en", e.target.value)}
                                    placeholder="Enter answer in English"
                                    className="min-h-[70px] resize-none"
                                  />
                                </div>
                              </TabsContent>
                              <TabsContent value="hi" className="space-y-3">
                                <div>
                                  <Label>Question (Hindi)</Label>
                                  <Input
                                    value={faq.question.hi}
                                    onChange={(e) => updateFAQ(index, "question", "hi", e.target.value)}
                                    placeholder="Enter question in Hindi"
                                  />
                                </div>
                                <div>
                                  <Label>Answer (Hindi)</Label>
                                  <Textarea
                                    value={faq.answer.hi}
                                    onChange={(e) => updateFAQ(index, "answer", "hi", e.target.value)}
                                    placeholder="Enter answer in Hindi"
                                    className="min-h-[70px] resize-none"
                                  />
                                </div>
                              </TabsContent>
                              <TabsContent value="ur" className="space-y-3">
                                <div>
                                  <Label>Question (Urdu)</Label>
                                  <Input
                                    value={faq.question.ur}
                                    onChange={(e) => updateFAQ(index, "question", "ur", e.target.value)}
                                    placeholder="Enter question in Urdu"
                                  />
                                </div>
                                <div>
                                  <Label>Answer (Urdu)</Label>
                                  <Textarea
                                    value={faq.answer.ur}
                                    onChange={(e) => updateFAQ(index, "answer", "ur", e.target.value)}
                                    placeholder="Enter answer in Urdu"
                                    className="min-h-[70px] resize-none"
                                  />
                                </div>
                              </TabsContent>
                            </Tabs>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFAQ(index)}
                              className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="viewsCount" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Views Count
                      </Label>
                      <Input
                        id="viewsCount"
                        type="number"
                        value={viewsCount}
                        onChange={(e) => setViewsCount(Number.parseInt(e.target.value) || 0)}
                        placeholder="Enter views count"
                        className="max-w-xs"
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("content")}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Content
                      </Button>

                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                          <X className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-black hover:bg-gray-800">
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
                  </TabsContent>
                </form>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

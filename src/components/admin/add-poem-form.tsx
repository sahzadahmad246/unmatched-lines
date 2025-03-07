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
import { useRouter, useSearchParams } from "next/navigation"

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
      toast.error("Failed to load authors")
    } finally {
      setLoading(false)
    }
  }

  const fetchPoem = async (id: string) => {
    try {
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
      toast.error("Failed to load poem")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      setPreview(URL.createObjectURL(file))
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
      toast.error("Please select an author")
      return
    }

    if (!titleEn || !contentEn.some((v) => v.trim())) {
      toast.error("Title and at least one verse are required in English")
      return
    }

    setIsSubmitting(true)

    const author = authors.find((a) => a._id === authorId)
    if (!author) {
      toast.error("Selected author not found")
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("titleEn", titleEn)
    formData.append("titleHi", titleHi || titleEn)
    formData.append("titleUr", titleUr || titleEn)
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
          toast.success("Poem updated successfully!")
          router.push("/admin/manage-poems") // Adjust redirect path as needed
        } else {
          toast.error(data.error || "Failed to update poem")
        }
      } catch (error) {
        console.error("Error updating poem:", error)
        toast.error("Failed to update poem. Please try again.")
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
          toast.success("Poetry added successfully!")
          resetForm()
        } else {
          toast.error(data.error || "Failed to add poetry")
        }
      } catch (error) {
        console.error("Error adding poetry:", error)
        toast.error("Failed to add poetry. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isEditing ? "Edit Poem" : "Add New Poetry"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type">
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

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger id="author">
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

              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="hindi">Hindi</TabsTrigger>
                  <TabsTrigger value="urdu">Urdu</TabsTrigger>
                </TabsList>

                <TabsContent value="english" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-en">Title (English)</Label>
                    <Input
                      id="title-en"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Enter title in English"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Content (English)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addVerse("en")} className="h-8">
                        Add Verse
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {contentEn.map((verse, index) => (
                        <div key={index} className="relative">
                          <Textarea
                            value={verse}
                            onChange={(e) => updateVerse("en", index, e.target.value)}
                            placeholder={`Verse ${index + 1}`}
                            className="min-h-[80px] pr-10"
                          />
                          {contentEn.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVerse("en", index)}
                              className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hindi" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-hi">Title (Hindi)</Label>
                    <Input
                      id="title-hi"
                      value={titleHi}
                      onChange={(e) => setTitleHi(e.target.value)}
                      placeholder="Enter title in Hindi"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Content (Hindi)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addVerse("hi")} className="h-8">
                        Add Verse
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {contentHi.map((verse, index) => (
                        <div key={index} className="relative">
                          <Textarea
                            value={verse}
                            onChange={(e) => updateVerse("hi", index, e.target.value)}
                            placeholder={`Verse ${index + 1}`}
                            className="min-h-[80px] pr-10"
                          />
                          {contentHi.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVerse("hi", index)}
                              className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="urdu" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-ur">Title (Urdu)</Label>
                    <Input
                      id="title-ur"
                      value={titleUr}
                      onChange={(e) => setTitleUr(e.target.value)}
                      placeholder="Enter title in Urdu"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Content (Urdu)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addVerse("ur")} className="h-8">
                        Add Verse
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {contentUr.map((verse, index) => (
                        <div key={index} className="relative">
                          <Textarea
                            value={verse}
                            onChange={(e) => updateVerse("ur", index, e.target.value)}
                            placeholder={`Verse ${index + 1}`}
                            className="min-h-[80px] pr-10"
                          />
                          {contentUr.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVerse("ur", index)}
                              className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Enter comma-separated tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-image">Cover Image</Label>
                <Input id="cover-image" type="file" accept="image/*" onChange={handleImageChange} />
                {preview && (
                  <div className="mt-2">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Cover Preview"
                      className="h-32 w-60 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : isEditing ? "Update Poem" : "Add Poetry"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}


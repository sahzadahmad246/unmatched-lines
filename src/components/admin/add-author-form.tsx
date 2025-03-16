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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { User, Calendar, MapPin, Upload, Loader2, X, Check, AlertCircle, Info, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

type Author = {
  _id: string
  name: string
  dob: string
  city: string
  bio: string
  image: string
}

export function AuthorForm() {
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [city, setCity] = useState("")
  const [bio, setBio] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const authorId = searchParams.get("id")

  useEffect(() => {
    if (authorId) {
      fetchAuthor(authorId)
      setIsEditing(true)
    }
  }, [authorId])

  const fetchAuthor = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/authors/${id}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch author")
      const data = await res.json()
      const author: Author = data.author

      setName(author.name)
      setDob(author.dob || "")
      setCity(author.city || "")
      setBio(author.bio || "")
      setPreview(author.image || "")
    } catch (error) {
      console.error("Error fetching author:", error)
      toast.error("Failed to load author data", {
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

      setImage(file)
      setPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Author name is required")
      toast.error("Author name is required", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("dob", dob)
    formData.append("city", city)
    formData.append("bio", bio)
    if (image) formData.append("image", image)

    try {
      const url = isEditing && authorId ? `/api/authors/${authorId}` : "/api/authors"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(isEditing ? "Author updated successfully!" : "Author added successfully!", {
          icon: <Check className="h-5 w-5" />,
        })
        if (isEditing) {
          router.push("/admin/manage-authors") // Adjust this route as needed
        } else {
          resetForm()
        }
      } else {
        setError(data.error || `Failed to ${isEditing ? "update" : "add"} author`)
        toast.error(data.error || `Failed to ${isEditing ? "update" : "add"} author`, {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} author:`, error)
      setError(`Failed to ${isEditing ? "update" : "add"} author. Please try again.`)
      toast.error(`Failed to ${isEditing ? "update" : "add"} author. Please try again.`, {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDob("")
    setCity("")
    setBio("")
    setImage(null)
    setPreview("")
    setError(null)
    setActiveTab("basic")
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="w-full mb-8 md:mb-16">
        <Card className="max-w-3xl mx-auto overflow-hidden w-full">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              <Tabs value="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Media & Bio
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 md:mb-16 w-full"
    >
      <Card className="max-w-3xl mx-auto overflow-hidden w-full">
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Author" : "Add New Author"}
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/manage-authors" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Authors
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Media & Bio
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="basic" className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter author's full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      City/Origin
                    </Label>
                    <Input
                      id="city"
                      placeholder="City or place of origin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("media")}>
                      Continue to Media & Bio
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Biography
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Enter author's biography"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-24 md:min-h-32 border-primary/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="image" className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      Author Image
                    </Label>
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                      <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                        {preview ? (
                          <div className="relative">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt="Author Preview"
                              className="h-32 w-32 object-cover rounded-full border-4 border-primary/20"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={(e) => {
                                e.preventDefault()
                                setImage(null)
                                setPreview("")
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <User className="h-12 w-12 text-primary/60" />
                            <p className="text-sm font-medium">Click to upload author image</p>
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
                      onClick={() => setActiveTab("basic")}
                      className="w-full sm:w-auto"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Basic Info
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
                            <Check className="mr-2 h-4 w-4" />
                            {isEditing ? "Update Author" : "Add Author"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Search, ArrowLeft } from "lucide-react"

type Author = {
  _id: string
  name: string
  dob?: string
  city?: string
  image?: string
  slug: string
}

// Default export for the Next.js page
export default function ManageAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [city, setCity] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteAuthorId, setDeleteAuthorId] = useState<string | null>(null)

  useEffect(() => {
    fetchAuthors()
  }, [])

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const startEdit = (author: Author) => {
    setEditingAuthor(author)
    setName(author.name)
    setDob(author.dob ? author.dob.split("T")[0] : "")
    setCity(author.city || "")
    setPreview(author.image || "")
  }

  const cancelEdit = () => {
    setEditingAuthor(null)
    setName("")
    setDob("")
    setCity("")
    setImage(null)
    setPreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAuthor) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("dob", dob)
    formData.append("city", city)
    if (image) formData.append("image", image)

    try {
      const res = await fetch(`/api/authors/${editingAuthor._id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Author updated successfully!")
        setAuthors((prev) => prev.map((a) => (a._id === editingAuthor._id ? data.author : a)))
        cancelEdit()
      } else {
        toast.error(data.error || "Failed to update author")
      }
    } catch (error) {
      console.error("Error updating author:", error)
      toast.error("Failed to update author")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteAuthorId(id)
  }

  const deleteAuthor = async () => {
    if (!deleteAuthorId) return

    try {
      const res = await fetch(`/api/authors/${deleteAuthorId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Author deleted successfully!")
        setAuthors((prev) => prev.filter((a) => a._id !== deleteAuthorId))
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete author")
      }
    } catch (error) {
      console.error("Error deleting author:", error)
      toast.error("Failed to delete author")
    } finally {
      setDeleteAuthorId(null)
    }
  }

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-0 "
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <span>Manage Authors</span>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search authors..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading authors...</div>
          ) : editingAuthor ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="sm" onClick={cancelEdit} className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h3 className="text-lg font-medium">Edit Author</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input id="edit-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-city">City/Origin</Label>
                  <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-image">Author Image</Label>
                  <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} />
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Author Preview"
                        className="h-32 w-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Author"}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : filteredAuthors.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {searchTerm ? "No authors found matching your search." : "No authors added yet."}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredAuthors.map((author) => (
                  <motion.div
                    key={author._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border p-4 flex flex-col"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {author.image ? (
                          <img
                            src={author.image || "/placeholder.svg"}
                            alt={author.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xl font-semibold">{author.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{author.name}</h3>
                          <p className="text-sm text-muted-foreground">{author.city || "Location not specified"}</p>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(author)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(author._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>

                    {author.dob && (
                      <p className="text-sm mt-3 text-muted-foreground">
                        Born: {new Date(author.dob).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteAuthorId} onOpenChange={() => setDeleteAuthorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this author and cannot be undone. All poems associated with this author may
              also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAuthor} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
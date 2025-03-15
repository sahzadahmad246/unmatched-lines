"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Upload,
  ImageIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
  Calendar,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CoverImage {
  _id: string
  url: string
  uploadedBy: { name: string }
  createdAt: string
}

export default function CoverImageManager() {
  const [coverImages, setCoverImages] = useState<CoverImage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const fetchCoverImages = async () => {
    try {
      setIsInitialLoading(true)
      const response = await fetch("/api/cover-images")
      const data = await response.json()
      if (response.ok) {
        setCoverImages(data.coverImages)
      } else {
        setError(data.error)
        toast.error(data.error || "Failed to fetch images", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (err) {
      setError("Failed to fetch cover images")
      toast.error("Failed to fetch cover images", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchCoverImages()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 5) {
      setError("Maximum 5 images allowed")
      toast.error("Maximum 5 images allowed", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }
    setFiles(selectedFiles)
    setError(null)

    if (selectedFiles.length > 0) {
      toast.success(`${selectedFiles.length} file(s) selected`, {
        icon: <Check className="h-5 w-5" />,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      setError("Please select at least one image")
      toast.error("Please select at least one image", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    files.forEach((file) => formData.append("images", file))

    try {
      const response = await fetch("/api/cover-images", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        setFiles([])
        fetchCoverImages()
        toast.success("Images uploaded successfully", {
          icon: <Check className="h-5 w-5" />,
        })
      } else {
        setError(data.error)
        toast.error(data.error || "Failed to upload images", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (err) {
      setError("Failed to upload images")
      toast.error("Failed to upload images", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSingleDelete = async (id: string) => {
    setDeleteDialogOpen(false)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cover-images/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (response.ok) {
        fetchCoverImages()
        setSelectedImages(selectedImages.filter((imgId) => imgId !== id))
        toast.success("Image deleted successfully", {
          icon: <Check className="h-5 w-5" />,
        })
      } else {
        setError(data.error)
        toast.error(data.error || "Failed to delete image", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (err) {
      setError("Failed to delete image")
      toast.error("Failed to delete image", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMultipleDelete = async () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image to delete")
      toast.error("Please select at least one image to delete", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    setDeleteDialogOpen(false)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cover-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedImages }),
      })
      const data = await response.json()

      if (response.ok) {
        fetchCoverImages()
        setSelectedImages([])
        toast.success(`${selectedImages.length} image(s) deleted successfully`, {
          icon: <Check className="h-5 w-5" />,
        })
      } else {
        setError(data.error)
        toast.error(data.error || "Failed to delete images", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (err) {
      setError("Failed to delete images")
      toast.error("Failed to delete images", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => (prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]))
  }

  const confirmSingleDelete = (id: string) => {
    setImageToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmMultipleDelete = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image to delete", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }
    setImageToDelete(null)
    setDeleteDialogOpen(true)
  }

  const viewImage = (url: string) => {
    setViewImageUrl(url)
    setViewDialogOpen(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-3xl font-bold flex items-center gap-2"
        >
          <ImageIcon className="h-7 w-7 text-primary" />
          Cover Image Manager
        </motion.h1>

        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1.5 md:gap-2 mt-3 md:mt-0"
          >
            <Button onClick={confirmMultipleDelete} variant="destructive" size="sm" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedImages.length})
            </Button>
            <Button onClick={() => setSelectedImages([])} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </motion.div>
        )}
      </div>

      {/* Upload Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 md:mb-8 bg-card rounded-lg border shadow-sm p-3 md:p-6"
      >
        <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Upload Images</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-3 md:p-6 text-center hover:bg-muted/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
              <ImageIcon className="h-12 w-12 text-primary/60" />
              <p className="text-base font-medium">Drag and drop or click to select files</p>
              <p className="text-sm text-muted-foreground">Maximum 5 images allowed</p>
            </label>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-muted/30 p-2 md:p-4 rounded-md"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Selected files:
                </p>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <ul className="space-y-1.5 md:space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm bg-background/50 p-2 rounded">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium truncate">{file.name}</span>
                    <span className="text-muted-foreground ml-auto">({(file.size / 1024).toFixed(1)} KB)</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || files.length === 0} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Image Gallery */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Image Gallery</h2>
        </div>

        {isInitialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg border overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : coverImages.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="text-xl font-medium">No images found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload some images to get started. Your uploaded images will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            <AnimatePresence>
              {coverImages.map((image) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative bg-card rounded-lg border overflow-hidden ${
                    selectedImages.includes(image._id) ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {/* Checkbox that only appears on hover */}
                    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Checkbox
                        checked={selectedImages.includes(image._id)}
                        onCheckedChange={() => toggleImageSelection(image._id)}
                        className="h-5 w-5 bg-background/80 backdrop-blur-sm"
                      />
                    </div>

                    {/* More options dropdown */}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewImage(image.url)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Image
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmSingleDelete(image._id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt="Cover image"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2 md:p-3 space-y-0.5 md:space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      <span>{image.uploadedBy.name}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      <span>
                        {new Date(image.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {imageToDelete
                ? "Are you sure you want to delete this image? This action cannot be undone."
                : `Are you sure you want to delete ${selectedImages.length} selected image(s)? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => (imageToDelete ? handleSingleDelete(imageToDelete) : handleMultipleDelete())}
              className="sm:w-auto w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {viewImageUrl && (
            <div className="relative w-full aspect-video">
              <Image src={viewImageUrl || "/placeholder.svg"} alt="Image preview" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}


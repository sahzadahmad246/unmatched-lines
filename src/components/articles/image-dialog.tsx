"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon } from "lucide-react"
import type { Editor } from "@tiptap/react"
import Image from "next/image"

interface ImageDialogProps {
  editor: Editor
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageDialog({ editor, isOpen, onOpenChange }: ImageDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFile(null)
      setPreviewUrl(null)
    }
  }

  const handleAddImage = () => {
    if (file) {
      // In a real application, you would upload the 'file' to a storage service
      // (e.g., Vercel Blob, AWS S3, Cloudinary) and get a public URL back.
      // For this example, we'll use a placeholder URL or the Data URL for demonstration.
      // const imageUrl = await uploadFile(file); // This would be your actual upload function

      // For demonstration, we'll use a placeholder or the data URL if available
      const imageUrl = previewUrl || "/placeholder.svg?height=400&width=600"

      editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run()
      resetForm()
      onOpenChange(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setAltText("")
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear the file input
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm() // Reset form when dialog closes
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>Select an image file and provide alt text.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="imageFile">Image File</Label>
            <Input id="imageFile" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Image Preview"
                  width={200}
                  height={150}
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text</Label>
            <Textarea
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddImage} disabled={!file}>
            <ImageIcon className="h-4 w-4 mr-2" /> Add Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

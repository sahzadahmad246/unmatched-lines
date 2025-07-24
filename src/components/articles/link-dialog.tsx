"use client"

import { useState, useEffect } from "react"
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
import { LinkIcon, Unlink } from "lucide-react"
import type { Editor } from "@tiptap/react"

interface LinkDialogProps {
  editor: Editor
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkDialog({ editor, isOpen, onOpenChange }: LinkDialogProps) {
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (isOpen) {
      setUrl(editor.getAttributes("link").href || "")
    }
  }, [isOpen, editor])

  const handleSetLink = () => {
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    }
    onOpenChange(false)
  }

  const handleUnsetLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Link</DialogTitle>
          <DialogDescription>Enter the URL for the link. Leave empty to unset.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleUnsetLink} disabled={!editor.isActive("link")}>
            <Unlink className="h-4 w-4 mr-2" /> Unset Link
          </Button>
          <Button onClick={handleSetLink}>
            <LinkIcon className="h-4 w-4 mr-2" /> Set Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import type { CreateArticleSchema } from "@/validators/articleValidator" // Assuming this path is correct

interface CoupletInputGroupProps {
  index: number
  control: Control<CreateArticleSchema>
  onRemove: () => void
}

export function CoupletInputGroup({ index, control, onRemove }: CoupletInputGroupProps) {
  const { register } = control
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2"
        aria-label={`Remove couplet ${index + 1}`}
      >
        <XIcon className="h-4 w-4" />
      </Button>
      <div>
        <Label htmlFor={`couplets.${index}.en`}>English</Label>
        <Textarea // Changed to Textarea
          id={`couplets.${index}.en`}
          {...register(`couplets.${index}.en`)}
          placeholder="English couplet (multi-line)"
          rows={3} // Added rows for better multi-line experience
        />
      </div>
      <div>
        <Label htmlFor={`couplets.${index}.hi`}>Hindi</Label>
        <Textarea // Changed to Textarea
          id={`couplets.${index}.hi`}
          {...register(`couplets.${index}.hi`)}
          placeholder="Hindi couplet (multi-line)"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor={`couplets.${index}.ur`}>Urdu</Label>
        <Textarea // Changed to Textarea
          id={`couplets.${index}.ur`}
          {...register(`couplets.${index}.ur`)}
          placeholder="Urdu couplet (multi-line)"
          rows={3}
        />
      </div>
    </div>
  )
}

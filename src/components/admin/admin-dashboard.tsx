"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const [contentType, setContentType] = useState("sher")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [poetName, setPoetName] = useState("")
  const [coverImage, setCoverImage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log({ contentType, title, content, poetName, coverImage })
    // Reset form
    setTitle("")
    setContent("")
    setPoetName("")
    setCoverImage("")
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sher">Sher</SelectItem>
              <SelectItem value="ghazal">Ghazal</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />

          <Input placeholder="Poet Name" value={poetName} onChange={(e) => setPoetName(e.target.value)} />

          <Input placeholder="Cover Image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />

          <Button type="submit">Add Content</Button>
        </form>
      </CardContent>
    </Card>
  )
}


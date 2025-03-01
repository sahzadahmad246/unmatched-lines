"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [contentType, setContentType] = useState("sher");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("published");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [poems, setPoems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all poems on mount
  useEffect(() => {
    fetch("/api/poem", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPoems(data.poems || []))
      .catch((err) => console.error("Error fetching poems:", err));
  }, []);
console.log(poems);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", contentType);
    formData.append("status", status);
    if (tags) formData.append("tags", tags); // Comma-separated tags
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      const url = editingId ? `/api/poem/${editingId}` : "/api/poem";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? "Poem updated!" : "Poem added!");
        setPoems((prev) =>
          editingId
            ? prev.map((p) => (p._id === editingId ? data.poem : p))
            : [...prev, data.poem]
        );
        resetForm();
      } else {
        setMessage(data.error || "Failed to save poem");
      }
    } catch (error) {
      console.error("Error saving poem:", error);
      setMessage("Failed to save poem");
    }
  };

  const handleEdit = (poem: any) => {
    setEditingId(poem._id);
    setTitle(poem.title);
    setContent(poem.content);
    setContentType(poem.category);
    setStatus(poem.status);
    setTags(poem.tags.join(", "));
    setPreview(poem.coverImage);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/poem/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPoems((prev) => prev.filter((p) => p._id !== id));
        setMessage("Poem deleted!");
      } else {
        setMessage("Failed to delete poem");
      }
    } catch (error) {
      console.error("Error deleting poem:", error);
      setMessage("Failed to delete poem");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setContentType("sher");
    setStatus("published");
    setTags("");
    setCoverImage(null);
    setPreview("");
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sher">Sher</SelectItem>
              <SelectItem value="ghazal">Ghazal</SelectItem>
              <SelectItem value="poem">Poem</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <img
                src={preview}
                alt="Cover Preview"
                className="mt-2 h-20 w-20 object-cover rounded"
              />
            )}
          </div>

          <Button type="submit">
            {editingId ? "Update Poem" : "Add Poem"}
          </Button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Poems</h3>
          {poems.length ? (
            poems.map((poem) => (
              <div
                key={poem._id}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>{poem.title}</span>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handleEdit(poem)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(poem._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            "No poems yet."
          )}
        </div>
      </CardContent>
    </Card>
  );
}
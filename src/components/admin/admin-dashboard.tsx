"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const [contentType, setContentType] = useState("sher");
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [contentUr, setContentUr] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("published");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [authorId, setAuthorId] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [poems, setPoems] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poemRes = await fetch("/api/poem", { credentials: "include" });
        const poemData = await poemRes.json();
        setPoems(poemData.poems || []);

        const authorRes = await fetch("/api/authors", { credentials: "include" });
        const authorData = await authorRes.json();
        setAuthors(authorData.authors || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (title: string, authorName: string, lang: string) => {
    const baseSlug = `${title}-${authorName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `${baseSlug}-${lang}-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorId) {
      setMessage("Please select an author.");
      return;
    }

    if (!titleEn || !titleHi || !titleUr || !contentEn || !contentHi || !contentUr) {
      setMessage("Title and content are required for all languages (English, Hindi, Urdu).");
      return;
    }

    const author = authors.find((a) => a._id === authorId);
    if (!author) {
      setMessage("Selected author not found.");
      return;
    }

    const slugEn = generateSlug(titleEn, author.name, "en");
    const slugHi = generateSlug(titleHi, author.name, "hi");
    const slugUr = generateSlug(titleUr, author.name, "ur");

    const formData = new FormData();
    formData.append("titleEn", titleEn);
    formData.append("titleHi", titleHi);
    formData.append("titleUr", titleUr);
    formData.append("contentEn", contentEn);
    formData.append("contentHi", contentHi);
    formData.append("contentUr", contentUr);
    formData.append("slugEn", slugEn);
    formData.append("slugHi", slugHi);
    formData.append("slugUr", slugUr);
    formData.append("category", contentType);
    formData.append("status", status);
    formData.append("authorId", authorId);
    if (tags) formData.append("tags", tags);
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
    setTitleEn(poem.title?.en || "");
    setTitleHi(poem.title?.hi || "");
    setTitleUr(poem.title?.ur || "");
    setContentEn(poem.content?.en || "");
    setContentHi(poem.content?.hi || "");
    setContentUr(poem.content?.ur || "");
    setContentType(poem.category);
    setStatus(poem.status);
    setTags(poem.tags.join(", "));
    setAuthorId(poem.author?._id || "");
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
    setTitleEn("");
    setTitleHi("");
    setTitleUr("");
    setContentEn("");
    setContentHi("");
    setContentUr("");
    setContentType("sher");
    setStatus("published");
    setTags("");
    setCoverImage(null);
    setAuthorId("");
    setPreview("");
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8 mb-16">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
          <Input
            placeholder="Title (Hindi)"
            value={titleHi}
            onChange={(e) => setTitleHi(e.target.value)}
            required
          />
          <Input
            placeholder="Title (Urdu)"
            value={titleUr}
            onChange={(e) => setTitleUr(e.target.value)}
            required
          />
          <Textarea
            placeholder="Content (English)"
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            required
          />
          <Textarea
            placeholder="Content (Hindi)"
            value={contentHi}
            onChange={(e) => setContentHi(e.target.value)}
            required
          />
          <Textarea
            placeholder="Content (Urdu)"
            value={contentUr}
            onChange={(e) => setContentUr(e.target.value)}
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
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author._id} value={author._id}>
                  {author.name}
                </SelectItem>
              ))}
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
                <span>
                  {poem.title?.en || "Untitled"} - {poem.author?.name || "Unknown Author"}
                </span>
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
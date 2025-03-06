"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Author = {
  _id: string;
  name: string;
};

export function AddPoemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
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

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const res = await fetch("/api/authors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch authors");
      
      const data = await res.json();
      setAuthors(data.authors || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast.error("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

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

  const resetForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorId) {
      toast.error("Please select an author");
      return;
    }

    if (!titleEn || !contentEn) {
      toast.error("Title and content are required (at least in English)");
      return;
    }
    
    setIsSubmitting(true);

    const author = authors.find((a) => a._id === authorId);
    if (!author) {
      toast.error("Selected author not found");
      setIsSubmitting(false);
      return;
    }

    const slugEn = generateSlug(titleEn, author.name, "en");
    const slugHi = titleHi ? generateSlug(titleHi, author.name, "hi") : "";
    const slugUr = titleUr ? generateSlug(titleUr, author.name, "ur") : "";

    const formData = new FormData();
    formData.append("titleEn", titleEn);
    formData.append("titleHi", titleHi);
    formData.append("titleUr", titleUr);
    formData.append("contentEn", contentEn);
    formData.append("contentHi", contentHi);
    formData.append("contentUr", contentUr);
    formData.append("slugEn", slugEn);
    if (slugHi) formData.append("slugHi", slugHi);
    if (slugUr) formData.append("slugUr", slugUr);
    formData.append("category", contentType);
    formData.append("status", status);
    formData.append("authorId", authorId);
    if (tags) formData.append("tags", tags);
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      const res = await fetch("/api/poem", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Poetry added successfully!");
        resetForm();
      } else {
        toast.error(data.error || "Failed to add poetry");
      }
    } catch (error) {
      console.error("Error adding poetry:", error);
      toast.error("Failed to add poetry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Poetry</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading authors...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <TabsList className="grid w-full grid-cols-3">
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
                    <Label htmlFor="content-en">Content (English)</Label>
                    <Textarea
                      id="content-en"
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      placeholder="Enter poetry content in English"
                      className="min-h-32"
                      required
                    />
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
                    <Label htmlFor="content-hi">Content (Hindi)</Label>
                    <Textarea
                      id="content-hi"
                      value={contentHi}
                      onChange={(e) => setContentHi(e.target.value)}
                      placeholder="Enter poetry content in Hindi"
                      className="min-h-32"
                    />
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
                    <Label htmlFor="content-ur">Content (Urdu)</Label>
                    <Textarea
                      id="content-ur"
                      value={contentUr}
                      onChange={(e) => setContentUr(e.target.value)}
                      placeholder="Enter poetry content in Urdu"
                      className="min-h-32"
                    />
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
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Poetry"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

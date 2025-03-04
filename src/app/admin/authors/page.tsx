"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthorManagement() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [authors, setAuthors] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/authors", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuthors(data.authors || []))
      .catch((err) => console.error("Error fetching authors:", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("city", city);
    if (image) formData.append("image", image);

    try {
      const url = editingId ? `/api/authors/${editingId}` : "/api/authors";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? "Author updated!" : "Author added!");
        setAuthors((prev) =>
          editingId
            ? prev.map((a) => (a._id === editingId ? data.author : a))
            : [...prev, data.author]
        );
        resetForm();
      } else {
        setMessage(data.error || "Failed to save author");
      }
    } catch (error) {
      console.error("Error saving author:", error);
      setMessage("Failed to save author");
    }
  };

  const handleEdit = (author: any) => {
    setEditingId(author._id);
    setName(author.name);
    setDob(author.dob ? new Date(author.dob).toISOString().split("T")[0] : "");
    setCity(author.city || "");
    setPreview(author.image || "");
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setAuthors((prev) => prev.filter((a) => a._id !== id));
        setMessage("Author deleted!");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to delete author");
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      setMessage("Failed to delete author");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDob("");
    setCity("");
    setImage(null);
    setPreview("");
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Manage Authors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <img
                src={preview}
                alt="Author Preview"
                className="mt-2 h-20 w-20 object-cover rounded"
              />
            )}
          </div>
          <Button type="submit">
            {editingId ? "Update Author" : "Add Author"}
          </Button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Authors</h3>
          {authors.length ? (
            authors.map((author) => (
              <div
                key={author._id}
                className="flex justify-between items-center p-2 border rounded"
              >
                <div>
                  <span>{author.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({author.slug})</span>
                </div>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handleEdit(author)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(author._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            "No authors yet."
          )}
        </div>
      </CardContent>
    </Card>
  );
}
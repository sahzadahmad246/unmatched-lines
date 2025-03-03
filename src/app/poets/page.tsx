"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Poets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch authors from API on mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch("/api/authors", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch authors");
        const data = await res.json();
        setAuthors(data.authors || []);
      } catch (err) {
        console.error("Error fetching authors:", err);
        setError("Failed to load poets");
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Loading poets...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">{error}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Poets</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search poets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <Card key={author._id}>
            <CardHeader>
              <CardTitle>{author.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Image
                  src={author.image || "/placeholder.svg?height=100&width=100"}
                  alt={author.name}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>
                  <p>
                    Born:{" "}
                    {author.dob
                      ? new Date(author.dob).getFullYear()
                      : "Unknown"}
                  </p>
                  <p>Place: {author.city || "Unknown"}</p>
                  <p>Ghazals: {author.ghazalCount}</p>
                  <p>Shers: {author.sherCount}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/poets/${author._id}`}>
                <Button>View Profile</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
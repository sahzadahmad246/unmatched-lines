"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Heart, BookOpen } from "lucide-react";

export default function Shers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shers, setShers] = useState<any[]>([]);
  const [likedPoems, setLikedPoems] = useState<string[]>([]); // Track liked poem IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shers and user liked poems on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all poems
        const poemRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemRes.ok) throw new Error("Failed to fetch shers");
        const poemData = await poemRes.json();
        const sherList = poemData.poems.filter((poem: any) => poem.category === "sher");
        setShers(sherList);

        // Fetch user's liked poems
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setLikedPoems(userData.user.likedPoems.map((id: any) => id.toString()));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load shers");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLikeToggle = async (poemId: string) => {
    const isLiked = likedPoems.includes(poemId);
    const url = isLiked ? "/api/user/like/remove" : "/api/user/like/add";
    const method = isLiked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setLikedPoems((prev) =>
          isLiked ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        setShers((prev) =>
          prev.map((sher) =>
            sher._id === poemId
              ? { ...sher, likeCount: isLiked ? sher.likeCount - 1 : sher.likeCount + 1 }
              : sher
          )
        );
      } else {
        alert(data.error || `Failed to ${isLiked ? "unlike" : "like"} sher`);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? "unliking" : "liking"} sher:`, error);
      alert(`Error ${isLiked ? "unliking" : "liking"} sher`);
    }
  };

  const handleAddToReadlist = async (poemId: string) => {
    try {
      const res = await fetch("/api/user/readlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Sher added to readlist!");
      } else {
        alert(data.error || "Failed to add to readlist");
      }
    } catch (error) {
      console.error("Error adding to readlist:", error);
      alert("Error adding to readlist");
    }
  };

  const filteredShers = shers.filter(
    (sher) =>
      sher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sher.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Loading shers...</h2>
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
      <h1 className="text-3xl font-bold mb-6">Explore Shers</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search shers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShers.map((sher) => (
          <Card key={sher._id}>
            <CardHeader>
              <Image
                src={sher.coverImage || "/placeholder.svg?height=200&width=300"}
                alt={sher.title}
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{sher.title}</CardTitle>
              <p className="text-gray-600">By {sher.author.name}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/poems/${sher._id}`}>
                <Button>Read</Button>
              </Link>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleLikeToggle(sher._id)}
                >
                  <Heart
                    className={`h-4 w-4 ${likedPoems.includes(sher._id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddToReadlist(sher._id)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        {filteredShers.length === 0 && (
          <p className="text-center col-span-full">No shers found.</p>
        )}
      </div>
    </div>
  );
}
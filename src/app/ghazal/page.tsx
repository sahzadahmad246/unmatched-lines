"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Heart, BookOpen } from "lucide-react";

export default function Ghazals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ghazals, setGhazals] = useState<any[]>([]);
  const [likedPoems, setLikedPoems] = useState<string[]>([]); // Track liked poem IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ghazals and user liked poems on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all poems
        const poemRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemRes.ok) throw new Error("Failed to fetch ghazals");
        const poemData = await poemRes.json();
        const ghazalList = poemData.poems.filter((poem: any) => poem.category === "ghazal");
        setGhazals(ghazalList);

        // Fetch user's liked poems
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setLikedPoems(userData.user.likedPoems.map((id: any) => id.toString()));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load ghazals");
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
        setGhazals((prev) =>
          prev.map((ghazal) =>
            ghazal._id === poemId
              ? { ...ghazal, likeCount: isLiked ? ghazal.likeCount - 1 : ghazal.likeCount + 1 }
              : ghazal
          )
        );
      } else {
        alert(data.error || `Failed to ${isLiked ? "unlike" : "like"} ghazal`);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? "unliking" : "liking"} ghazal:`, error);
      alert(`Error ${isLiked ? "unliking" : "liking"} ghazal`);
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
        alert("Ghazal added to readlist!");
      } else {
        alert(data.error || "Failed to add to readlist");
      }
    } catch (error) {
      console.error("Error adding to readlist:", error);
      alert("Error adding to readlist");
    }
  };

  const filteredGhazals = ghazals.filter(
    (ghazal) =>
      ghazal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ghazal.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Loading ghazals...</h2>
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
      <h1 className="text-3xl font-bold mb-6">Explore Ghazals</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search ghazals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGhazals.map((ghazal) => (
          <Card key={ghazal._id}>
            <CardHeader>
              <Image
                src={ghazal.coverImage || "/placeholder.svg?height=200&width=300"}
                alt={ghazal.title}
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{ghazal.title}</CardTitle>
              <p className="text-gray-600">By {ghazal.author.name}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/poems/${ghazal._id}`}>
                <Button>Read</Button>
              </Link>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleLikeToggle(ghazal._id)}
                >
                  <Heart
                    className={`h-4 w-4 ${likedPoems.includes(ghazal._id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddToReadlist(ghazal._id)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        {filteredGhazals.length === 0 && (
          <p className="text-center col-span-full">No ghazals found.</p>
        )}
      </div>
    </div>
  );
}
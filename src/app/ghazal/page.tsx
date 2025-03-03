"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Ghazals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ghazals, setGhazals] = useState<any[]>([]);
  const [readList, setReadList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poemRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemRes.ok) throw new Error("Failed to fetch ghazals");
        const poemData = await poemRes.json();
        const ghazalList = poemData.poems.filter((poem: any) => poem.category === "ghazal");
        console.log("Fetched Ghazals:", ghazalList); // Debug: Check data structure
        setGhazals(ghazalList);

        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
        } else if (userRes.status === 401) {
          setReadList([]);
        } else {
          throw new Error("Failed to fetch user data");
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

  const handleReadlistToggle = async (poemId: string) => {
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });
      if (res.ok) {
        setReadList((prev) =>
          isInReadlist
            ? prev.filter((id) => id !== poemId)
            : [...prev, poemId]
        );
        alert(`Ghazal ${isInReadlist ? "removed from" : "added to"} readlist!`);
      } else if (res.status === 401) {
        alert("Please sign in to manage your readlist.");
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${isInReadlist ? "remove from" : "add to"} readlist`);
      }
    } catch (error) {
      console.error(`Error ${isInReadlist ? "removing from" : "adding to"} readlist:`, error);
      alert("An error occurred while updating the readlist.");
    }
  };

  const filteredGhazals = ghazals.filter(
    (ghazal) =>
      ghazal.title?.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ghazal.author?.name && ghazal.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        {filteredGhazals.map((ghazal) => {
          const englishSlug = ghazal.slug?.en || ghazal._id; // Fallback to _id if slug.en is missing
          return (
            <Card key={ghazal._id}>
              <CardHeader>
                <Image
                  src={ghazal.coverImage || "/placeholder.svg?height=200&width=300"}
                  alt={ghazal.title?.en || "Ghazal Image"}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </CardHeader>
              <CardContent>
                <CardTitle>{ghazal.title?.en || "Untitled"}</CardTitle>
                <p className="text-gray-600">
                  By {ghazal.author?.name || "Unknown Author"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/poems/${englishSlug}`}>
                  <Button>Read</Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleReadlistToggle(ghazal._id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        readList.includes(ghazal._id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
        {filteredGhazals.length === 0 && (
          <p className="text-center col-span-full">No ghazals found.</p>
        )}
      </div>
    </div>
  );
}
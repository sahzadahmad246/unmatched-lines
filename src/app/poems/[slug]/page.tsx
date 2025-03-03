"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function PoemDetail() {
  const { slug } = useParams(); // Get slug from URL
  const router = useRouter();
  const [poem, setPoem] = useState<any>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "ur">("en");

  // Fetch poem and user readlist data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading starts as true
      setError(null); // Reset error state
      try {
        const poemRes = await fetch(`/api/poem?slug=${slug}`, {
          credentials: "include",
        });
        if (!poemRes.ok) {
          const errorText = await poemRes.text();
          throw new Error(
            `Failed to fetch poem: ${poemRes.status} - ${errorText}`
          );
        }
        const poemData = await poemRes.json();
        console.log("Poem Response:", poemData); // Debug: Log full response
        if (!poemData.poem) throw new Error("Poem not found in response");
        setPoem(poemData.poem);

        // Fetch user's readlist
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
        } else if (userRes.status === 401) {
          setReadList([]);
        } else {
          const errorText = await userRes.text();
          throw new Error(
            `Failed to fetch user data: ${userRes.status} - ${errorText}`
          );
        }
      } catch (error) {
        setError((error as Error).message || "Failed to load poem details");
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of outcome
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const handleReadlistToggle = async (poemId: string) => {
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist
      ? "/api/user/readlist/remove"
      : "/api/user/readlist/add";
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
          isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        setPoem((prev: any) => ({
          ...prev,
          readListCount: isInReadlist
            ? prev.readListCount - 1
            : prev.readListCount + 1,
        }));
        alert(`Poem ${isInReadlist ? "removed from" : "added to"} readlist!`);
      } else if (res.status === 401) {
        alert("Please sign in to manage your readlist.");
      } else {
        throw new Error("Failed to update readlist");
      }
    } catch (error) {
      console.error(
        `Error ${isInReadlist ? "removing from" : "adding to"} readlist:`,
        error
      );
      alert("An error occurred while updating the readlist.");
    }
  };

  const handleTabChange = (lang: "en" | "hi" | "ur") => {
    setActiveLang(lang);
    if (poem) {
      const newSlug = poem.slug[0][lang];
      router.push(`/poems/${newSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Loading poem...</h2>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          {error || "Poem not found"}
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="p-0">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=400&width=800"}
            alt={poem.title[0]?.[activeLang] || "Poem Image"}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-t-lg"
          />
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Tabs
            value={activeLang}
            onValueChange={(value) =>
              handleTabChange(value as "en" | "hi" | "ur")
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">Hindi</TabsTrigger>
              <TabsTrigger value="ur">Urdu</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold">
                  {poem.title?.en || "Untitled"}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  By {poem.author?.name || "Unknown Author"}
                </p>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed mt-4">
                {poem.content?.en}
              </div>
            </TabsContent>
            <TabsContent value="hi">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold">
                  {poem.title?.hi || "शीर्षक नहीं"}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  By {poem.author?.name || "अज्ञात लेखक"}
                </p>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed mt-4">
                {poem.content?.hi}
              </div>
            </TabsContent>
            <TabsContent value="ur">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold">
                  {poem.title?.ur || "عنوان نہیں"}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  By {poem.author?.name || "نامعلوم مصنف"}
                </p>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed mt-4">
                {poem.content?.ur}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Heart className="h-5 w-5 text-blue-500" /> {poem.readListCount}{" "}
                Readers
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReadlistToggle(poem._id)}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    readList.includes(poem._id)
                      ? "fill-red-500 text-red-500"
                      : ""
                  }`}
                />
                {readList.includes(poem._id)
                  ? "Remove from Readlist"
                  : "Add to Readlist"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

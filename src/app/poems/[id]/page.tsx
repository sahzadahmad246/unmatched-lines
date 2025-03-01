"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Heart, BookOpen, MessageSquare, Trash2 } from "lucide-react";

export default function PoemDetail() {
  const { id } = useParams(); // Get poem ID from URL
  const [poem, setPoem] = useState<any>(null);
  const [likedPoems, setLikedPoems] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch poem and user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const poemRes = await fetch(`/api/poem/${id}`, { credentials: "include" });
        if (!poemRes.ok) throw new Error("Failed to fetch poem");
        const poemData = await poemRes.json();
        const poemWithComments = {
          ...poemData.poem,
          comments: await Promise.all(
            poemData.poem.comments.map(async (commentId: string) => {
              const res = await fetch(`/api/comment/${commentId}`, { credentials: "include" });
              return res.ok ? (await res.json()).comment : null;
            })
          ).then((comments) => comments.filter(Boolean)),
        };
        setPoem(poemWithComments);

        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setLikedPoems(userData.user.likedPoems.map((id: any) => id.toString()));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load poem details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

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
      if (res.ok) {
        setLikedPoems((prev) =>
          isLiked ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        setPoem((prev: any) => ({
          ...prev,
          likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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
      if (res.ok) {
        setPoem((prev: any) => ({
          ...prev,
          readListCount: prev.readListCount + 1,
        }));
        alert("Added to readlist!");
      }
    } catch (error) {
      console.error("Error adding to readlist:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch("/api/user/comment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId: id, text: commentText }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPoem((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment],
          commentCount: prev.commentCount + 1,
        }));
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/user/comment/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
        credentials: "include",
      });
      if (res.ok) {
        setPoem((prev: any) => ({
          ...prev,
          comments: prev.comments.filter((c: any) => c._id !== commentId),
          commentCount: prev.commentCount - 1,
        }));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
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
        <h2 className="text-2xl font-bold text-red-500">{error || "Poem not found"}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="p-0">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=400&width=800"}
            alt={poem.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-t-lg"
          />
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <CardTitle className="text-3xl font-bold">{poem.title}</CardTitle>
            <p className="text-gray-600 mt-2">By {poem.author.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {poem.status === "draft" ? "Draft" : "Published"} on{" "}
              {new Date(poem.createdAt).toLocaleDateString()}
              {poem.updatedAt !== poem.createdAt && (
                <> • Updated on {new Date(poem.updatedAt).toLocaleDateString()}</>
              )}
            </p>
          </div>

          <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
            {poem.content}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Heart className="h-5 w-5 text-red-500" /> {poem.likeCount} Likes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-5 w-5 text-gray-500" /> {poem.commentCount} Comments
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-5 w-5 text-blue-500" /> {poem.readListCount} Readers
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLikeToggle(poem._id)}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${likedPoems.includes(poem._id) ? "fill-red-500 text-red-500" : ""}`}
                />
                {likedPoems.includes(poem._id) ? "Unlike" : "Like"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddToReadlist(poem._id)}
              >
                <BookOpen className="h-4 w-4 mr-2" /> Add to Readlist
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button onClick={handleAddComment}>Post</Button>
            </div>
            {poem.comments && poem.comments.length > 0 ? (
              poem.comments.map((comment: any) => (
                <div key={comment._id} className="flex justify-between items-start border-b py-2">
                  <div>
                    <p className="text-gray-800">{comment.text}</p>
                    <p className="text-sm text-gray-500">
                      By {comment.user.name} on {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {comment.user._id === sessionStorage.getItem("userId") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No comments yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
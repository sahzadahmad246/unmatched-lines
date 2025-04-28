"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FollowEntry {
  id: string;
  name: string;
  image?: string;
  slug?: string; // For authors (following list)
  followedAt: string;
}

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: string; // ID for users, slug for authors
  type: "user" | "author";
  listType: "followers" | "following";
  preFetchedList?: FollowEntry[];
  slug?: string;
}

export function FollowListDialog({
  open,
  onOpenChange,
  target,
  type,
  listType,
  preFetchedList,
  slug,
}: FollowListDialogProps) {
  const { data: session, status } = useSession();
  const [list, setList] = useState<FollowEntry[]>(preFetchedList || []);
  const [loading, setLoading] = useState(!preFetchedList);
  const [unfollowLoading, setUnfollowLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!open) return;

    if (preFetchedList && preFetchedList.length > 0) {
      setList(preFetchedList);
      setLoading(false);
    } else {
      const fetchList = async () => {
        setLoading(true);
        try {
          // Validate inputs
          if (!target || !type || !listType) {
            throw new Error("Invalid query parameters");
          }
          const queryParams = new URLSearchParams({
            target: encodeURIComponent(target),
            type,
            listType,
          });
          const res = await fetch(`/api/follow-lists?${queryParams.toString()}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error(`Failed to fetch ${listType}`);
          const data = await res.json();
          const entries = data[listType].map((entry: any) => ({
            id: entry.id,
            name: entry.name,
            image: entry.image,
            slug: entry.slug, // Only for authors (following list)
            followedAt: entry.followedAt,
          }));
          setList(entries);
        } catch (error) {
          console.error("Fetch Error:", error);
          toast.error(`Failed to load ${listType}`, {
            description: "Please try again later.",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchList();
    }
  }, [open, target, type, listType, preFetchedList]);

  const handleUnfollow = async (authorSlug: string, authorName: string) => {
    if (status !== "authenticated") {
      toast("Authentication required", {
        description: "Please sign in to unfollow poets.",
      });
      return;
    }

    setUnfollowLoading((prev) => ({ ...prev, [authorSlug]: true }));
    try {
      const res = await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: authorSlug, type: "author" }),
        credentials: "include",
      });

      if (res.ok) {
        setList((prev) => prev.filter((entry) => entry.slug !== authorSlug));
        toast("Unfollowed", {
          description: `You have unfollowed ${authorName}.`,
        });
      } else if (res.status === 401) {
        toast("Authentication required", {
          description: "Please sign in to unfollow poets.",
        });
      } else {
        const data = await res.json();
        toast("Error", {
          description: data.error || "Failed to unfollow poet.",
        });
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while unfollowing the poet.",
      });
    } finally {
      setUnfollowLoading((prev) => ({ ...prev, [authorSlug]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{listType === "followers" ? "Followers" : "Following"}</span>
            
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {listType === "followers" ? "followers" : "following"} yet.
            </p>
          ) : (
            <div className="space-y-4">
              {list.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.image || "/placeholder.svg"} alt={entry.name} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      {type === "author" && listType === "followers" ? (
                        <p className="text-sm font-medium">{entry.name}</p>
                      ) : entry.slug ? (
                        <Link href={`/poets/${entry.slug}`} className="text-sm font-medium hover:underline">
                          {entry.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium">{entry.name}</p>
                      )}
                      {entry.slug && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Poet
                        </Badge>
                      )}
                    </div>
                  </div>
                  {type === "user" && listType === "following" && session?.user?.id && entry.slug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(entry.slug!, entry.name)} // Non-null assertion with type guard
                      disabled={unfollowLoading[entry.slug] || false}
                      className="gap-2"
                    >
                      {unfollowLoading[entry.slug] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Unfollow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
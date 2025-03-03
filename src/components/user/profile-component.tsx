"use client";

import { useState, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfileComponent() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("reading-list");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => console.error(err));
    }
  }, [session]);

  const handleRemoveFromReadlist = async (poemId: string) => {
    try {
      const res = await fetch("/api/user/readlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
      });
      if (res.ok) {
        setUserData((prev: any) => ({
          ...prev,
          user: {
            ...prev.user,
            readList: prev.user.readList.filter((p: any) => p._id !== poemId),
          },
        }));
      }
    } catch (error) {
      console.error("Failed to remove from readlist", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <h2 className="text-2xl font-bold text-center">
          Please sign in to view your profile
        </h2>
        <Button onClick={() => signIn("google")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Profile</CardTitle>
          <div className="flex gap-2">
            <Button
              className="text-danger"
              variant="outline"
              onClick={() => signOut()}
            >
              Log Out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user?.image || ""} alt="Profile" />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {session.user?.name}
                </h3>
                <p className="text-muted-foreground">{session.user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  User ID: {session.user.id}
                </p>
              </div>
            </div>
            {userData?.user?.role === "admin" && (
              <Link href="/admin" className="self-center sm:self-start">
                <Button>Admin Dashboard</Button>
              </Link>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="reading-list">Reading List</TabsTrigger>
            </TabsList>
            <TabsContent value="reading-list" className="p-4 min-h-[200px]">
              {userData?.user?.readList?.length
                ? userData.user.readList.map((poem: any) => (
                    <div
                      key={poem._id}
                      className="flex justify-between items-center py-2"
                    >
                      <span>{poem.title}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFromReadlist(poem._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                : "No poems in your reading list yet."}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
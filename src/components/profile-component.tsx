"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function ProfileComponent() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("likes");

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">
          Please sign in to view your profile
        </h2>
        <Button onClick={() => signIn("google")}>Sign In</Button>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile</CardTitle>
        <Button className="text-danger" variant="outline" onClick={() => signOut()}>
          Log Out
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className=" flex justify-between ">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user?.image || ""} alt="Profile" />
              <AvatarFallback>
                {session.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{session.user?.name}</h3>
              <p className="text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
          <Link href="/admin">
            <Button className="mt-4">Admin Dashboard</Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex justify-between">
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="reading-list">Reading List</TabsTrigger>
          </TabsList>
          <TabsContent value="likes">
            Your liked content will appear here.
          </TabsContent>
          <TabsContent value="replies">
            Your replies will appear here.
          </TabsContent>
          <TabsContent value="reading-list">
            Your reading list will appear here.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

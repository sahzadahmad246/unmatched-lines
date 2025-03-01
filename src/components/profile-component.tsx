"use client"

import { useState } from "react"
import { useSession, signOut, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function ProfileComponent() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("likes")

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <h2 className="text-2xl font-bold text-center">Please sign in to view your profile</h2>
        <Button onClick={() => signIn("google")}>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Profile</CardTitle>
          <Button className="text-danger" variant="outline" onClick={() => signOut()}>
            Log Out
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user?.image || ""} alt="Profile" />
                <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold">{session.user?.name}</h3>
                <p className="text-muted-foreground">{session.user?.email}</p>
                <p className="text-sm text-muted-foreground">User ID: {session.user.id}</p>
              </div>
            </div>
            <Link href="/admin" className="self-center sm:self-start">
              <Button>Admin Dashboard</Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="replies">Replies</TabsTrigger>
              <TabsTrigger value="reading-list">Reading List</TabsTrigger>
            </TabsList>
            <TabsContent value="likes" className="p-4 min-h-[200px]">
              Your liked content will appear here.
            </TabsContent>
            <TabsContent value="replies" className="p-4 min-h-[200px]">
              Your replies will appear here.
            </TabsContent>
            <TabsContent value="reading-list" className="p-4 min-h-[200px]">
              Your reading list will appear here.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


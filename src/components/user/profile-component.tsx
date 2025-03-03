"use client"

import { useState, useEffect } from "react"
import { useSession, signOut, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { LogOut, BookOpen, Shield, User, Mail, BookmarkMinus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProfileComponent() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      setIsLoading(true)
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setUserData(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [session])

  const handleRemoveFromReadlist = async (poemId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/user/readlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
      })
      if (res.ok) {
        setUserData((prev: any) => ({
          ...prev,
          user: {
            ...prev.user,
            readList: prev.user.readList.filter((p: any) => p._id !== poemId),
          },
        }))
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to remove from readlist", error)
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-2xl font-bold">Loading profile...</h2>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-center">Please sign in to view your profile</h2>
        <Button onClick={() => signIn("google")} className="gap-2">
          <User className="h-4 w-4" />
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="overflow-hidden border-none shadow-lg">
        {/* Banner/Cover Image */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/40 relative">
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-md">
              <AvatarImage src={session.user?.image || ""} alt="Profile" />
              <AvatarFallback className="text-2xl sm:text-4xl">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm gap-1"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>

        <CardContent className="pt-20 sm:pt-24 px-4 sm:px-8 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold">{session.user?.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{session.user?.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{session.user?.id}</span>
                </Badge>
                {userData?.user?.role === "admin" && (
                  <Badge className="bg-primary gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Admin</span>
                  </Badge>
                )}
              </div>
            </div>

            {userData?.user?.role === "admin" && (
              <Link href="/admin" className="self-start mt-4 sm:mt-0">
                <Button className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h4 className="text-xl font-semibold">Reading List</h4>
              <Badge variant="secondary" className="ml-2">
                {userData?.user?.readList?.length || 0}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {userData?.user?.readList?.length ? (
                  userData.user.readList.map((poem: any) => (
                    <div
                      key={poem._id}
                      className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{poem.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromReadlist(poem._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      >
                        <BookmarkMinus className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mb-2 opacity-30" />
                    <p>No poems in your reading list yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


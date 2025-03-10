"use client"

import { useState, useEffect } from "react"
import { useSession, signOut, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import {
  LogOut,
  BookOpen,
  Shield,
  User,
  Mail,
  BookmarkMinus,
  Loader2,
  Feather,
  BookHeart,
  Sparkles,
  Settings,
  Grid3X3,
  BookMarked,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function ProfileComponent() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [poemToRemove, setPoemToRemove] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("saved")

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
          setIsLoading(false)
          toast.error("Failed to load profile", {
            description: "The verses of your profile couldn't be retrieved",
            icon: <Feather className="h-4 w-4" />,
          })
        })
    }
  }, [session])

  const handleRemoveFromReadlist = async (poemId: string, poemTitle: string) => {
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

        toast.success("Poem removed", {
          description: `"${poemTitle}" has been removed from your reading list.`,
          icon: <BookmarkMinus className="h-4 w-4" />,
          duration: 3000,
          position: "bottom-right",
          className: "border border-primary/20",
        })
      }
      setIsLoading(false)
      setPoemToRemove(null)
    } catch (error) {
      setIsLoading(false)
      setPoemToRemove(null)

      toast.error("Error", {
        description: "Failed to remove the poem. Please try again.",
        icon: <Feather className="h-4 w-4" />,
        duration: 3000,
      })
    }
  }

  const handleSignOut = () => {
    toast.success("Signed out successfully", {
      description: "We hope to see you again soon",
      icon: <Feather className="h-4 w-4" />,
      duration: 3000,
    })
    signOut()
  }

  const handleSignIn = () => {
    toast.loading("Signing you in...", {
      description: "Opening the door to poetry",
      duration: 3000,
    })
    signIn("google")
  }

  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Feather className="h-12 w-12 text-primary/70" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl sm:text-2xl font-bold"
        >
          Loading profile...
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full mx-auto px-4 py-12"
        >
          <Card className="overflow-hidden border shadow-md">
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-lg" />
                <User className="h-16 w-16 text-primary relative" />
              </motion.div>
            </div>

            <CardContent className="p-6 space-y-6 text-center">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl sm:text-2xl font-medium"
              >
                Welcome to <span className="italic text-primary">Unmatched Lines</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground"
              >
                Sign in to discover your personal anthology of saved poems and connect with fellow poetry enthusiasts.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Button
                  onClick={handleSignIn}
                  className="w-full gap-2 py-5 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                  Begin Your Journey
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <Separator className="my-4" />
                <blockquote className="text-muted-foreground italic text-sm mt-4">
                  "Poetry is the journal of a sea animal living on land, wanting to fly in the air."
                  <footer className="mt-1 font-medium text-foreground">— Carl Sandburg</footer>
                </blockquote>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-1"
        >
          <Card className="overflow-hidden border shadow-md bg-background">
            <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 relative" />

            <div className="px-4 pt-0 pb-5 relative">
              <Avatar className="h-20 w-20 border-4 border-background absolute -top-20 left-4">
                <AvatarImage src={session.user?.image || ""} alt="Profile" />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {session.user?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>

              <div className="mt-14 space-y-3">
                <h3 className="text-xl font-semibold">{session.user?.name}</h3>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs truncate">{session.user?.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Reader</span>
                  </Badge>
                  {userData?.user?.role === "admin" && (
                    <Badge className="bg-primary/90 gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Curator</span>
                    </Badge>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>

                  {userData?.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Curator Dashboard
                    </Link>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 mt-2 text-sm">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border border-primary/20 shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">Sign out?</AlertDialogTitle>
                        <AlertDialogDescription className="italic text-sm">
                          Your anthology will await your return, preserved just as you left it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="text-sm">Stay</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut} className="text-sm">
                          Sign out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-4 shadow-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Activity Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 p-3 rounded-md text-center">
                  <p className="text-2xl font-bold text-primary">{userData?.user?.readList?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Saved Poems</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md text-center">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Tabs defaultValue="saved" onValueChange={setActiveTab}>
                <TabsList className="mb-6 grid grid-cols-3 h-11">
                  <TabsTrigger value="saved" className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved Poems</span>
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Collections</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <BookHeart className="h-4 w-4" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="saved" className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Your Saved Poems</h3>
                    <Badge variant="secondary">{userData?.user?.readList?.length || 0} Poems</Badge>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      <p className="text-muted-foreground italic text-sm">Loading your collection...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {userData?.user?.readList?.length ? (
                          userData.user.readList.map((poem: any, index: number) => (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{
                                opacity: 0,
                                y: 10,
                                transition: { duration: 0.2 },
                              }}
                              transition={{ delay: 0.05 * index, duration: 0.3 }}
                              className="group relative"
                            >
                              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10">
                                <div className="flex items-center gap-3">
                                  <BookOpen className="h-4 w-4 text-primary/70" />
                                  <span className="italic text-sm">
                                    {typeof poem.title === "object" ? poem.title.en || "Untitled" : poem.title}
                                  </span>
                                </div>

                                <AlertDialog
                                  open={poemToRemove === poem._id}
                                  onOpenChange={(open) => !open && setPoemToRemove(null)}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setPoemToRemove(poem._id)}
                                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10 gap-1"
                                    >
                                      <BookmarkMinus className="h-4 w-4" />
                                      <span className="hidden sm:inline text-xs">Remove</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border border-destructive/20">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-lg">Remove this poem?</AlertDialogTitle>
                                      <AlertDialogDescription className="italic text-sm">
                                        Are you sure you wish to remove "
                                        {typeof poem.title === "object" ? poem.title.en || "Untitled" : poem.title}"
                                        from your collection?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-4">
                                      <AlertDialogCancel className="text-sm">Keep</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleRemoveFromReadlist(
                                            poem._id,
                                            typeof poem.title === "object" ? poem.title.en || "Untitled" : poem.title,
                                          )
                                        }
                                        className="bg-destructive hover:bg-destructive/90 text-sm"
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                          >
                            <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                            <p className="italic text-base mb-2">Your collection is empty</p>
                            <p className="text-xs max-w-md text-center">
                              Explore our collection and save poems that resonate with you
                            </p>

                            <div className="mt-6">
                              <Link href="/ghazal">
                                <Button variant="outline" className="gap-2 text-sm">
                                  <Sparkles className="h-4 w-4" />
                                  Discover Poems
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="collections">
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Grid3X3 className="h-12 w-12 mb-4 opacity-30" />
                    <p className="italic text-base mb-2">Collections coming soon</p>
                    <p className="text-xs max-w-md text-center">
                      Soon you'll be able to organize your favorite poems into custom collections
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <BookHeart className="h-12 w-12 mb-4 opacity-30" />
                    <p className="italic text-base mb-2">Activity feed coming soon</p>
                    <p className="text-xs max-w-md text-center">
                      Track your interactions with poems and connect with other poetry enthusiasts
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-muted-foreground italic text-xs">
            "Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in
            tranquility."
            <div className="mt-1 font-medium">— William Wordsworth</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


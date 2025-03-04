
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
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

  useEffect(() => {
    if (session) {
      setIsLoading(true)
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setUserData(data)
          setIsLoading(false)
          toast.success("Profile loaded", {
            description: "Welcome to your poetic sanctuary",
            icon: <Feather className="h-4 w-4" />,
            position: "top-center",
            duration: 3000,
          })
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
          description: `"${poemTitle}" has faded from your reading list.`,
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
        description: "The poem clings to your reading list. Please try again.",
        icon: <Feather className="h-4 w-4" />,
        duration: 3000,
      })
    }
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
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Feather className="h-12 w-12 text-primary/70" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold"
        >
          Turning the pages...
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-lg" />
          <User className="h-20 w-20 text-primary relative" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-3xl text-center max-w-md leading-relaxed"
        >
          <span className="italic">Sign in</span> to discover your personal anthology of saved poems
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Button
            onClick={() => {
              toast.loading("Opening the door to poetry...")
              signIn("google")
            }}
            className="gap-2 px-6 py-6 rounded-xl text-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <User className="h-5 w-5" />
            Begin Your Journey
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground text-center max-w-sm mt-4 italic text-sm"
        >
          "Poetry is the journal of a sea animal living on land, wanting to fly in the air."
          <div className="mt-1 font-medium">— Carl Sandburg</div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl italic mb-8 text-center"
      >
        Your Poetic Sanctuary
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -inset-1 rounded-xl bg-primary/5 blur-md"
        />

        <Card className="overflow-hidden border-none shadow-lg relative bg-background/80 backdrop-blur-sm">
          {/* Banner/Cover Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-40 sm:h-56 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 relative overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,120,255,0.1),transparent_70%)]"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-16 left-4 sm:left-8"
            >
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                <AvatarImage src={session.user?.image || ""} alt="Profile" />
                <AvatarFallback className="text-3xl sm:text-4xl bg-primary/10">
                  {session.user?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="absolute top-4 right-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm gap-1 hover:bg-background/90 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Depart</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border border-primary/20 shadow-lg">
                  <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl">Close your book of poems?</AlertDialogTitle>
                      <AlertDialogDescription className="italic">
                        Your anthology will await your return, preserved just as you left it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel className="font-serif">Stay</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          toast.success("Farewell", {
                            description: "Until our paths cross again in the garden of verses.",
                            icon: <Feather className="h-4 w-4" />,
                          })
                          signOut()
                        }}
                        className="font-serif"
                      >
                        Depart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </motion.div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          <CardContent className="pt-20 sm:pt-24 px-4 sm:px-8 pb-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-between gap-4"
            >
              <div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl sm:text-3xl"
                >
                  {session.user?.name}
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-2 text-muted-foreground mt-2"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm italic">{session.user?.email}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-2 mt-3"
                >
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
                </motion.div>
              </div>

              {userData?.user?.role === "admin" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="self-start mt-4 sm:mt-0"
                >
                  <Link href="/admin">
                    <Button className="gap-2 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" />
                      <Shield className="h-4 w-4" />
                      Curator's Gallery
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Separator className="bg-primary/20" />
            </motion.div>

            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.9 }}
              className="space-y-6"
            >
              <motion.div variants={slideUp} className="flex items-center gap-3">
                <BookHeart className="h-6 w-6 text-primary" />
                <h4 className="text-xl italic">Your Anthology</h4>
                <Badge variant="secondary" className="ml-2">
                  {userData?.user?.readList?.length || 0} Poems
                </Badge>
              </motion.div>

              {isLoading ? (
                <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-12 gap-4">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-10 w-10 text-primary/70" />
                  </motion.div>
                  <p className="text-muted-foreground italic">Gathering your verses...</p>
                </motion.div>
              ) : (
                <motion.div variants={fadeIn} className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {userData?.user?.readList?.length ? (
                      userData.user.readList.map((poem: any, index: number) => (
                        <motion.div
                          key={poem._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            transition: { duration: 0.2 },
                          }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="group relative"
                        >
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-between items-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                                <BookOpen className="h-5 w-5 text-primary/70" />
                              </motion.div>
                              <span className="italic">
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
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border border-destructive/20">
                                <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-serif">Remove this verse?</AlertDialogTitle>
                                    <AlertDialogDescription className="italic">
                                      Are you sure you wish to remove "
                                      {typeof poem.title === "object" ? poem.title.en || "Untitled" : poem.title}" from
                                      your anthology?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="font-serif">Keep</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveFromReadlist(
                                          poem._id,
                                          typeof poem.title === "object" ? poem.title.en || "Untitled" : poem.title,
                                        )
                                      }
                                      className="bg-destructive hover:bg-destructive/90 font-serif"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </motion.div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </motion.div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            delay: 0.2,
                          }}
                        >
                          <BookOpen className="h-16 w-16 mb-4 opacity-30" />
                        </motion.div>
                        <p className="italic text-lg mb-2">Your anthology awaits its first verse</p>
                        <p className="text-sm max-w-md text-center">
                          Explore our collection and save the poems that speak to your soul
                        </p>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="mt-6"
                        >
                          <Link href="/poems">
                            <Button variant="outline" className="gap-2">
                              <Sparkles className="h-4 w-4" />
                              Discover Poems
                            </Button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-muted-foreground italic mt-8 text-sm"
      >
        "Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in
        tranquility."
        <div className="mt-1 font-medium">— William Wordsworth</div>
      </motion.div>
    </div>
  )
}


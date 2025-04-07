"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Feather,
  LogOut,
  Music,
  Settings,
  User,
  HelpCircle,
  Info,
  BookAIcon,
  Book,
  Sparkles,
  BookHeart,
} from "lucide-react"
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
import { motion } from "framer-motion"

// Define the props type for MoreScreen
interface MoreScreenProps {
  onClose: () => void
}

export function MoreScreen({ onClose }: MoreScreenProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut()
  }

  const handleSignIn = () => {
    signIn("google")
  }

  const menuItems = [
    { href: "/poems/sher", icon: Feather, label: "Sher", description: "Explore beautiful couplets" },
    { href: "/poems/ghazal", icon: Music, label: "Ghazal", description: "Lyrical poetry expressions" },
    { href: "/library", icon: BookAIcon, label: "Library", description: "Your poetry collection" },
    { href: "/poets", icon: Book, label: "Poets", description: "Discover renowned poets" },
    { href: "/settings", icon: Settings, label: "Settings", description: "Customize your experience" },
    { href: "/help", icon: HelpCircle, label: "Help & Support", description: "Get assistance" },
    { href: "/about", icon: Info, label: "About Us", description: "Our poetic journey" },
  ]

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
      {/* User Profile Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="p-6 border-b bg-gradient-to-r from-primary/10 to-transparent relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/5 blur-xl"></div>
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full bg-primary/10 blur-lg"></div>

        {session ? (
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md ring-2 ring-background/50">
              <AvatarImage src={session.user?.image || ""} alt="Profile" />
              <AvatarFallback className="bg-primary/20">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{session.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
              <Link
                href="/profile"
                onClick={onClose}
                className="text-sm text-primary mt-1 inline-flex items-center gap-1 font-medium hover:underline"
              >
                <span>View Profile</span>
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col items-center gap-4 py-6 relative z-10"
          >
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md ring-2 ring-background/50">
              <AvatarFallback className="bg-primary/10">
                <User className="h-10 w-10 text-primary/70" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-lg">Welcome, Poetry Lover</h3>
              <p className="text-sm text-muted-foreground mb-4 italic font-serif">
                Sign in to create your poetry collection
              </p>
              <Button
                onClick={handleSignIn}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Sparkles className="h-4 w-4" />
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Menu Items */}
      <motion.div initial="hidden" animate="visible" variants={staggerItems} className="flex-1 overflow-auto py-4 px-2">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={fadeIn}
              custom={index}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Reading Stats for signed-in users */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-6 py-4 border-t border-b"
        >
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <BookHeart className="h-4 w-4 text-primary" />
            Your Poetry Journey
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">12</div>
              <div className="text-xs text-muted-foreground">Poems Read</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">5</div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">3</div>
              <div className="text-xs text-muted-foreground">Collections</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sign Out Button */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 border-t mt-auto bg-gradient-to-r from-transparent to-primary/10"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2 border-primary/20 hover:bg-primary/5">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-primary/20 shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-serif">Sign out?</AlertDialogTitle>
                <AlertDialogDescription className="italic text-sm font-serif">
                  Your anthology will await your return, preserved just as you left it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="text-sm">Stay</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut} className="text-sm bg-primary hover:bg-primary/90">
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      )}
    </div>
  )
}


"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Feather,
  LogOut,
  Music,
  User,
  HelpCircle,
  Info,
  BookAIcon,
  Book,
  Sparkles,
  FileIcon as FileUser,
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
    {
      href: "/sher",
      icon: Feather,
      label: "Sher",
      description: "Explore beautiful couplets",
      color: "from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      href: "/ghazal",
      icon: Music,
      label: "Ghazal",
      description: "Lyrical poetry expressions",
      color: "from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      href: "/nazm",
      icon: Book,
      label: "Nazm",
      description: "Explore soulful Nazms",
      color: "from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    {
      href: "/library",
      icon: BookAIcon,
      label: "Library",
      description: "Your poetry collection",
      color: "from-violet-500 to-purple-500 dark:from-violet-600 dark:to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
      textColor: "text-violet-700 dark:text-violet-300",
    },
    {
      href: "/poets",
      icon: FileUser,
      label: "Poets",
      description: "Discover renowned poets",
      color: "from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      textColor: "text-rose-700 dark:text-rose-300",
    },
    {
      href: "/help",
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get assistance",
      color: "from-cyan-500 to-sky-500 dark:from-cyan-600 dark:to-sky-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      textColor: "text-cyan-700 dark:text-cyan-300",
    },
    {
      href: "/about",
      icon: Info,
      label: "About Us",
      description: "Our poetic journey",
      color: "from-fuchsia-500 to-purple-500 dark:from-fuchsia-600 dark:to-purple-600",
      bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
      textColor: "text-fuchsia-700 dark:text-fuchsia-300",
    },
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
    <div className="flex flex-col h-full bg-gradient-to-b from-cyan-50/80 via-white to-cyan-50/50 dark:from-cyan-950/80 dark:via-background dark:to-cyan-950/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 dark:from-cyan-600 dark:to-blue-600 blur-3xl"></div>
        <div className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 blur-3xl"></div>
      </div>

      {/* User Profile Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="p-6 border-b border-cyan-200/30 dark:border-cyan-800/30 bg-gradient-to-r from-cyan-100/50 to-transparent dark:from-cyan-900/50 dark:to-transparent relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-cyan-200/30 dark:bg-cyan-800/30 blur-xl"></div>
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full bg-blue-200/30 dark:bg-blue-800/30 blur-lg"></div>

        {session ? (
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/40 to-blue-400/20 dark:from-cyan-600/40 dark:to-blue-600/20 rounded-full blur opacity-70"></div>
              <Avatar className="h-16 w-16 border-2 border-cyan-200/50 dark:border-cyan-700/50 shadow-md ring-2 ring-white dark:ring-background/50 relative">
                <AvatarImage src={session.user?.image || ""} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-background dark:from-cyan-900 dark:to-background">
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg text-cyan-800 dark:text-cyan-200">{session.user?.name}</h3>
              <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80">{session.user?.email}</p>
              <Link
                href="/profile"
                onClick={onClose}
                className="text-sm text-cyan-600 dark:text-cyan-400 mt-1 inline-flex items-center gap-1 font-medium hover:underline"
              >
                <span>View Profile</span>
                <Sparkles className="h-3 w-3 text-cyan-500 dark:text-cyan-300" />
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
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/40 to-blue-400/20 dark:from-cyan-600/40 dark:to-blue-600/20 rounded-full blur opacity-70"></div>
              <Avatar className="h-20 w-20 border-2 border-cyan-200/50 dark:border-cyan-700/50 shadow-md ring-2 ring-white dark:ring-background/50 relative">
                <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-background dark:from-cyan-900 dark:to-background">
                  <User className="h-10 w-10 text-cyan-600/70 dark:text-cyan-400/70" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg text-cyan-800 dark:text-cyan-200">Welcome, Poetry Lover</h3>
              <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mb-4 italic font-serif">
                Sign in to create your poetry collection
              </p>
              <Button
                onClick={handleSignIn}
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 shadow-sm hover:shadow-md transition-all"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:${item.bgColor} transition-colors group`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:shadow-md transition-all`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className={`font-medium block ${item.textColor}`}>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sign Out Button */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 border-t border-cyan-200/30 dark:border-cyan-800/30 mt-auto bg-gradient-to-r from-transparent to-cyan-100/50 dark:from-transparent dark:to-cyan-900/50"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-cyan-200/50 dark:border-cyan-800/50 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30 shadow-sm hover:shadow-md transition-all text-cyan-700 dark:text-cyan-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-cyan-200/50 dark:border-cyan-800/50 shadow-lg bg-gradient-to-b from-white to-cyan-50/50 dark:from-background dark:to-cyan-950/30 backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-serif text-cyan-800 dark:text-cyan-300">
                  Sign out?
                </AlertDialogTitle>
                <AlertDialogDescription className="italic text-sm font-serif text-cyan-600/80 dark:text-cyan-400/80">
                  Your anthology will await your return, preserved just as you left it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="text-sm border-cyan-200/50 dark:border-cyan-800/50 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                  Stay
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  className="text-sm bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 shadow-sm hover:shadow-md transition-all"
                >
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

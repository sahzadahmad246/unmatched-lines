"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Book, Feather, Music, BookAIcon, FileIcon as FileUser, Sparkles } from "lucide-react"
import { useState } from "react"
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
import { Logo } from "./home/logo"
import { MobileBottomNav } from "./home/mobile-bottom-nav"
import { motion } from "framer-motion"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showSignOutAlert, setShowSignOutAlert] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    {
      href: "/library",
      icon: <BookAIcon className="h-4 w-4" />,
      label: "Library",
    },
    { href: "/poets", icon: <FileUser className="h-4 w-4" />, label: "Poets" },
    {
      href: "/sher",
      icon: <Feather className="h-4 w-4" />,
      label: "Sher",
    },
    {
      href: "/ghazal",
      icon: <Music className="h-4 w-4" />,
      label: "Ghazal",
    },
    { href: "/nazm", icon: <Book className="h-4 w-4" />, label: "Nazm" },
  ]

  const handleSignOut = () => {
    signOut()
  }

  const handleSignIn = () => {
    signIn("google")
  }

  return (
    <>
      <nav className="border-b p-3 sticky top-0 z-40 bg-gradient-to-r from-cyan-50/80 via-background/95 to-blue-50/80 dark:from-cyan-950/80 dark:via-background/95 dark:to-blue-950/80 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-400 dark:from-cyan-600 dark:to-blue-600 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="flex items-center px-4 w-full relative z-10">
          {/* Logo - visible on all devices */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="ml-8 hidden md:flex items-center space-x-4">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className={`flex items-center py-1 px-2 transition-all relative group ${
                    isActive(link.href)
                      ? "text-cyan-700 dark:text-cyan-300 font-semibold"
                      : "hover:text-cyan-600 dark:hover:text-cyan-400"
                  }`}
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/80 via-blue-500 to-cyan-400/80 dark:from-cyan-500/80 dark:via-blue-400 dark:to-cyan-500/80 rounded-full transform origin-left transition-transform duration-300 ${
                      isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Profile - Desktop and Mobile */}
          <motion.div
            className="ml-auto flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full overflow-hidden p-0 bg-gradient-to-br from-cyan-100 to-transparent dark:from-cyan-900 dark:to-transparent hover:from-cyan-200 dark:hover:from-cyan-800 hover:to-blue-100/30 dark:hover:to-blue-900/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-transparent dark:from-cyan-800 dark:to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    <Avatar className="h-9 w-9 border border-cyan-200 dark:border-cyan-700 shadow-sm">
                      <AvatarImage src={session.user?.image || ""} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-background dark:from-cyan-900 dark:to-background">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-1 p-1 bg-gradient-to-b from-white to-cyan-50/50 dark:from-background dark:to-cyan-950/30 backdrop-blur-sm border-cyan-200/50 dark:border-cyan-800/50 shadow-lg"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem
                    asChild
                    className="px-3 py-2.5 rounded-md hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30 focus:bg-cyan-100/50 dark:focus:bg-cyan-900/30 transition-colors duration-200"
                  >
                    <Link href="/profile" className="w-full flex items-center">
                      <User className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="px-3 py-2.5 rounded-md hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30 focus:bg-cyan-100/50 dark:focus:bg-cyan-900/30 transition-colors duration-200"
                  >
                    <AlertDialog open={showSignOutAlert} onOpenChange={setShowSignOutAlert}>
                      <AlertDialogTrigger asChild>
                        <button className="w-full flex items-center text-sm cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          Log out
                        </button>
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
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  onClick={handleSignIn}
                  className="hidden md:flex gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 shadow-sm hover:shadow-md transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignIn}
                  className="md:hidden h-10 w-10 rounded-full bg-gradient-to-br from-cyan-100 to-transparent dark:from-cyan-900 dark:to-transparent hover:from-cyan-200 dark:hover:from-cyan-800 hover:to-blue-100/30 dark:hover:to-blue-900/30"
                >
                  <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Content wrapper with padding for bottom nav */}
      <div className="pb-0 md:pb-0">{/* This is where page content will be rendered */}</div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      {/* <Footer /> */}
    </>
  )
}

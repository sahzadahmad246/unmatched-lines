"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Book, Feather, Music, Menu, BookAIcon } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
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
import logo from "./../images/logo.png"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showSignOutAlert, setShowSignOutAlert] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/poets", icon: <Book className="h-4 w-4" />, label: "Poets" },
    { href: "/sher", icon: <Feather className="h-4 w-4" />, label: "Sher" },
    { href: "/ghazal", icon: <Music className="h-4 w-4" />, label: "Ghazal" },
    {
      href: "/library",
      icon: <BookAIcon className="h-4 w-4" />,
      label: "Library",
    },
  ]

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

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src={logo || "/placeholder.svg"}
            alt="Unmatched Lines"
            width={40}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-8 hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center py-1 px-2 transition-all ${
                isActive(link.href)
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "hover:text-primary hover:border-b-2 hover:border-primary/50"
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden md:flex items-center space-x-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt="Profile" />
                    <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <AlertDialog open={showSignOutAlert} onOpenChange={setShowSignOutAlert}>
                    <AlertDialogTrigger asChild>
                      <button className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
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
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleSignIn}>Sign In</Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full p-0">
              <div className="flex justify-between items-center p-4 border-b">
                <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt="Unmatched Lines"
                    width={32}
                    height={32}
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>

              {/* Mobile Navigation Links - at the top */}
              <div className="flex-1 overflow-auto py-4 px-6">
                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center text-lg py-2 ${
                        isActive(link.href)
                          ? "text-primary font-semibold border-l-4 border-primary pl-2"
                          : "hover:text-primary hover:border-l-4 hover:border-primary/50 hover:pl-2 transition-all"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile and Sign In buttons - at the bottom */}
              <div className="mt-auto border-t p-4">
                <div className="flex flex-row items-center justify-between">
                  {session ? (
                    <div className="flex items-center justify-between w-full">
                      <Link href="/profile" className="flex items-center" onClick={() => setIsOpen(false)}>
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={session.user?.image || ""} alt="Profile" />
                          <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Profile</span>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto">
                            <LogOut className="h-5 w-5" />
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
                            <AlertDialogAction
                              onClick={() => {
                                handleSignOut()
                                setIsOpen(false)
                              }}
                              className="text-sm"
                            >
                              Sign out
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        handleSignIn()
                        setIsOpen(false)
                      }}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}


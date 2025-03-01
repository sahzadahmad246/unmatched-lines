"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Book, Feather, Music, Globe, Menu, X } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

export default function Navbar() {
  const { data: session } = useSession()
  const [language, setLanguage] = useState("English")
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/poets", icon: <Book className="h-4 w-4" />, label: "Poets" },
    { href: "/sher", icon: <Feather className="h-4 w-4" />, label: "Sher" },
    { href: "/ghazal", icon: <Music className="h-4 w-4" />, label: "Ghazal" },
  ]

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          Unmatched Lines
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-8 hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center ${isActive(link.href) ? "text-primary font-semibold" : ""}`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("English")}>🇺🇸 English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("Hindi")}>🇮🇳 Hindi</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("Urdu")}>🇵🇰 Urdu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn("google")}>Sign In</Button>
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
                <Link href="/" className="font-bold text-xl" onClick={() => setIsOpen(false)}>
                  Unmatched Lines
                </Link>
                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
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
                      className={`flex items-center text-lg py-2 ${isActive(link.href) ? "text-primary font-semibold" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Language and Sign In buttons - at the bottom */}
              <div className="mt-auto border-t p-4">
                <div className="flex flex-row items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        {language}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLanguage("English")}>🇺🇸 English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("Hindi")}>🇮🇳 Hindi</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("Urdu")}>🇵🇰 Urdu</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                          <Link href="/profile" className="w-full flex items-center" onClick={() => setIsOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            signOut()
                            setIsOpen(false)
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={() => {
                        signIn("google")
                        setIsOpen(false)
                      }}
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


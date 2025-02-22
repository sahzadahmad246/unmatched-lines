"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Book, Feather, Music, Globe } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [language, setLanguage] = useState("English")
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          Unmatched Lines
        </Link>
        <div className="ml-8 flex items-center space-x-4">
          <Link href="/poets" className={`flex items-center ${isActive("/poets") ? "text-primary font-semibold" : ""}`}>
            <Book className="mr-2 h-4 w-4" />
            Poets
          </Link>
          <Link href="/sher" className={`flex items-center ${isActive("/sher") ? "text-primary font-semibold" : ""}`}>
            <Feather className="mr-2 h-4 w-4" />
            Sher
          </Link>
          <Link
            href="/ghazal"
            className={`flex items-center ${isActive("/ghazal") ? "text-primary font-semibold" : ""}`}
          >
            <Music className="mr-2 h-4 w-4" />
            Ghazal
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
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
      </div>
    </nav>
  )
}


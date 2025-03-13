"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Feather, LogOut, Music, Settings, User, HelpCircle, Info,} from "lucide-react"
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

export function MoreScreen() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut()
  }

  const handleSignIn = () => {
    signIn("google")
  }

  const menuItems = [
    { href: "/sher", icon: Feather, label: "Sher" },
    { href: "/ghazal", icon: Music, label: "Ghazal" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/help", icon: HelpCircle, label: "Help & Support" },
    { href: "/about", icon: Info, label: "About Us" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-transparent">
        {session ? (
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
              <AvatarImage src={session.user?.image || ""} alt="Profile" />
              <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{session.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
              <Link href="/profile" className="text-sm text-primary mt-1 inline-block font-medium">
                View Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
              <AvatarFallback>
                <User className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-lg">Welcome, Guest</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign in to create your poetry collection</p>
              <Button onClick={handleSignIn} className="w-full">
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary/70" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sign Out Button */}
      {session && (
        <div className="p-6 border-t  mt-auto bg-gradient-to-r from-transparent to-primary/10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2 border-primary/20">
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
      )}
    </div>
  )
}


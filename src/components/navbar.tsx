"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Book, Feather, Music, BookAIcon } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Logo } from "./home/logo";
import { MobileBottomNav } from "./home/mobile-bottom-nav";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/poets", icon: <Book className="h-4 w-4" />, label: "Poets" },
    { href: "/poems/sher", icon: <Feather className="h-4 w-4" />, label: "Sher" },
    { href: "/poems/ghazal", icon: <Music className="h-4 w-4" />, label: "Ghazal" },
    {
      href: "/library",
      icon: <BookAIcon className="h-4 w-4" />,
      label: "Library",
    },
  ];

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    signIn("google");
  };

  return (
    <>
      <nav className="border-b p-3 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="flex  items-center px-4 w-full">
          {/* Logo - visible on all devices */}
          <div className="flex items-center">
            <Logo />
          </div>

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

          {/* User Profile - Desktop and Mobile */}
          <div className="ml-auto flex items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt="Profile"
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
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
                    <AlertDialog
                      open={showSignOutAlert}
                      onOpenChange={setShowSignOutAlert}
                    >
                      <AlertDialogTrigger asChild>
                        <button className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-primary/20 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg">
                            Sign out?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="italic text-sm">
                            Your anthology will await your return, preserved
                            just as you left it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel className="text-sm">
                            Stay
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleSignOut}
                            className="text-sm"
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
                <Button onClick={handleSignIn} className="hidden md:flex">
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignIn}
                  className="md:hidden h-10 w-10"
                >
                  <User className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content wrapper with padding for bottom nav */}
      <div className="pb-0 md:pb-0">
        {/* This is where page content will be rendered */}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      {/* <Footer /> */}
    </>
  );
}

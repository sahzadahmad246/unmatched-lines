"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PenLine, Users, Home, Menu, FileText, Settings, ChevronLeft } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <Home className="w-5 h-5 mr-2" />,
    },
    {
      name: "Add Poetry",
      href: "/admin/add-poem",
      icon: <PenLine className="w-5 h-5 mr-2" />,
    },
    {
      name: "Manage Poems",
      href: "/admin/manage-poems",
      icon: <FileText className="w-5 h-5 mr-2" />,
    },
    {
      name: "Add Author",
      href: "/admin/add-author",
      icon: <Users className="w-5 h-5 mr-2" />,
    },
    {
      name: "Manage Authors",
      href: "/admin/manage-authors",
      icon: <Users className="w-5 h-5 mr-2" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-5 h-5 mr-2" />,
    },
  ]

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <Link href="/admin" className="text-xl font-bold flex items-center">
            Unmatched Lines Admin
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {navItems.slice(0, 3).map((item) => (
            <Button key={item.name} variant={isActive(item.href) ? "default" : "ghost"} asChild className="gap-2">
              <Link href={item.href}>
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}

          <Button variant="outline" asChild className="ml-4">
            <Link href="/">Back to Site</Link>
          </Button>
        </div>

        {/* Mobile Navigation - Only shown when sidebar is not visible */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Unmatched Lines</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    asChild
                    className="justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      {item.name}
                    </Link>
                  </Button>
                ))}

                <Button variant="outline" asChild className="mt-4 justify-start" onClick={() => setIsOpen(false)}>
                  <Link href="/">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Site
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}


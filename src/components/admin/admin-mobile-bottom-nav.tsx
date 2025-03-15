"use client"

import { Home, PenLine, FileText, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminMoreScreen } from "./admin-more-screen"

export function AdminMobileBottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Close the "More" screen when the pathname changes
  useEffect(() => {
    setIsMoreOpen(false)
  }, [pathname])

  const mainNavItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/add-poem", icon: PenLine, label: "Add Poem" },
    { href: "/admin/manage-poems", icon: FileText, label: "Manage" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden shadow-lg">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            }`}
          >
            <item.icon className={`h-5 w-5 mb-1 ${isActive(item.href) ? "text-primary" : ""}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger
            className={`flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary/70`}
          >
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-full sm:max-w-md">
            <AdminMoreScreen onClose={() => setIsMoreOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}


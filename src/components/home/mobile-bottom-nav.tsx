"use client"

import { Book, BookAIcon, Home, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MoreScreen } from "./more-screen"
import { motion } from "framer-motion"

export function MobileBottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Close the "More" screen when the pathname changes
  useEffect(() => {
    setIsMoreOpen(false)
  }, [pathname])

  const mainNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/poets", icon: Book, label: "Poets" },
    { href: "/library", icon: BookAIcon, label: "Library" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-cyan-50/95 via-cyan-50/80 to-background/90 dark:from-cyan-950/95 dark:via-cyan-950/80 dark:to-background/90 backdrop-blur-md border-t md:hidden shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-400 dark:from-cyan-600 dark:to-blue-600 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="flex items-center justify-around h-16 relative z-10">
        {mainNavItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className="w-full"
          >
            <Link
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full relative ${
                isActive(item.href)
                  ? "text-cyan-700 dark:text-cyan-300"
                  : "text-muted-foreground hover:text-cyan-600/70 dark:hover:text-cyan-400/70"
              }`}
            >
              {isActive(item.href) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-cyan-400/60 via-blue-500 to-cyan-400/60 dark:from-cyan-500/60 dark:via-blue-400 dark:to-cyan-500/60 rounded-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full mb-0.5 transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-gradient-to-br from-cyan-100 to-transparent dark:from-cyan-900 dark:to-transparent"
                    : "bg-transparent hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isActive(item.href) ? "text-cyan-700 dark:text-cyan-300 scale-110" : "scale-100"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${
                  isActive(item.href) ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}

        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger
            className={`flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-cyan-600/70 dark:hover:text-cyan-400/70 relative`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full mb-0.5 transition-all duration-300 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30">
                <MoreHorizontal className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
              </div>
              <span className="text-xs font-medium">More</span>
            </motion.div>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="p-0 w-full sm:max-w-md border-l border-cyan-200/50 dark:border-cyan-800/50"
          >
            <MoreScreen onClose={() => setIsMoreOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

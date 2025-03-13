"use client";

import { Book, BookAIcon, Home, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MoreScreen } from "./more-screen";

export function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/poets", icon: Book, label: "Poets" },
    { href: "/library", icon: BookAIcon, label: "Library" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden shadow-lg">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary/70"
            }`}
          >
            <item.icon
              className={`h-5 w-5 mb-1 ${
                isActive(item.href) ? "text-primary" : ""
              }`}
            />
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
            <MoreScreen />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

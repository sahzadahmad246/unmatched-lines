"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileBottomNav } from "@/components/admin/admin-mobile-bottom-nav"
import { SidebarProvider } from "@/components/ui/sidebar" // Adjust path as needed

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        {isAdminRoute ? (
          <>
            {/* Admin layout for /admin routes */}
            <div className="flex flex-1 w-full">
              {/* Admin Sidebar for desktop */}
              <div className="hidden md:block">
                <AdminSidebar />
              </div>
              {/* Main content */}
              <main className="flex-1 p-0 md:p-6 w-full mb-16">{children}</main>
            </div>
            {/* Admin Mobile Bottom Nav for mobile */}
            <div className="md:hidden">
              <AdminMobileBottomNav />
            </div>
          </>
        ) : (
          <>
            {/* Regular layout for non-admin routes */}
            <Navbar />
            <main className="flex-1 w-full p-0 md:p-6 mb-16">{children}</main>
          </>
        )}
      </div>
    </SidebarProvider>
  )
}


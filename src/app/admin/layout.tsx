"use client"

import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <main className="p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}


"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
// Import SidebarProvider if it's part of the same module or a different one
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Adjust the import path as needed

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {isAdminRoute ? (
        <SidebarProvider> {/* Wrap AdminSidebar with its provider */}
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
      ) : (
        <>
          <Navbar />
          {children}
        </>
      )}
    </>
  );
}
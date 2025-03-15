"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileBottomNav } from "@/components/admin/admin-mobile-bottom-nav";
import { SidebarProvider } from "@/components/ui/sidebar"; // Adjust path as needed

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        {isAdminRoute ? (
          <>
            {/* Admin layout for /admin routes */}
            <div className="flex flex-1">
              {/* Admin Sidebar for desktop */}
              <div className="hidden md:block">
                <AdminSidebar />
              </div>
              {/* Main content */}
              <main className="flex-1 p-4 md:p-6 pb-16 md:pb-6">
                {children}
              </main>
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
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
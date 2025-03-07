"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { PenLine, Users, Home, FileText, Settings, BookOpen, ChevronLeft, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  const isActive = (path: string) => {
    return pathname === path
  }

  // Mobile menu trigger that will be shown in the header
  const MobileMenuTrigger = () => (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(true)}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  )

  const isSidebarExpanded = state === "expanded" || isMobile

  return (
    <>
      {/* Mobile menu trigger for the header */}
      <div className="block md:hidden fixed top-4 left-4 z-50">
        <MobileMenuTrigger />
      </div>

      <Sidebar variant="floating" className="border-r" collapsible={isMobile ? "offcanvas" : "icon"}>
        <SidebarHeader className="flex flex-row items-center justify-between px-4 py-2">
          {isSidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-bold">Unmatched Lines</span>
            </motion.div>
          )}

          {isMobile ? (
            <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          ) : (
            <SidebarTrigger className="hidden md:flex" />
          )}
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Dashboard">
                <Link href="/admin" onClick={() => isMobile && setOpenMobile(false)}>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/add-poem")} tooltip="Add Poetry">
                <Link href="/admin/add-poem" onClick={() => isMobile && setOpenMobile(false)}>
                  <PenLine className="h-5 w-5" />
                  <span>Add Poetry</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/manage-poems")} tooltip="Manage Poems">
                <Link href="/admin/manage-poems" onClick={() => isMobile && setOpenMobile(false)}>
                  <FileText className="h-5 w-5" />
                  <span>Manage Poems</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/add-author")} tooltip="Add Author">
                <Link href="/admin/add-author" onClick={() => isMobile && setOpenMobile(false)}>
                  <Users className="h-5 w-5" />
                  <span>Add Author</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/manage-authors")} tooltip="Manage Authors">
                <Link href="/admin/manage-authors" onClick={() => isMobile && setOpenMobile(false)}>
                  <Users className="h-5 w-5" />
                  <span>Manage Authors</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/settings")} tooltip="Settings">
                <Link href="/admin/settings" onClick={() => isMobile && setOpenMobile(false)}>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Site">
                <Link href="/" onClick={() => isMobile && setOpenMobile(false)}>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Back to Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}


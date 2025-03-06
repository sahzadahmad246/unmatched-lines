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
import { PenLine, Users, Home, FileText, Settings, BookOpen, ChevronLeft } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar variant="floating" className="border-r" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-6 w-6" />
          <span className="text-lg font-bold">Unmatched Lines</span>
        </motion.div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Dashboard">
              <Link href="/admin">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/add-poem")} tooltip="Add Poetry">
              <Link href="/admin/add-poem">
                <PenLine className="h-5 w-5" />
                <span>Add Poetry</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/manage-poems")} tooltip="Manage Poems">
              <Link href="/admin/manage-poems">
                <FileText className="h-5 w-5" />
                <span>Manage Poems</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/add-author")} tooltip="Add Author">
              <Link href="/admin/add-author">
                <Users className="h-5 w-5" />
                <span>Add Author</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/manage-authors")} tooltip="Manage Authors">
              <Link href="/admin/manage-authors">
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
              <Link href="/admin/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Site">
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}


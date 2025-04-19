"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
} from "@/components/ui/sidebar";
import {
  PenLine,
  Users,
  Home,
  FileText,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Upload,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../home/logo";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = () => {
    signOut();
  };

  // Mobile menu trigger that will be shown in the header
  const MobileMenuTrigger = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setOpenMobile(true)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  const isSidebarExpanded = state === "expanded" || isMobile;

  return (
    <>
      {/* Mobile menu trigger for the header */}
      <div className="block md:hidden fixed top-4 left-4 z-50">
        <MobileMenuTrigger />
      </div>

      <Sidebar
        variant="floating"
        className="border-r"
        collapsible={isMobile ? "offcanvas" : "icon"}
      >
        <SidebarHeader className="flex flex-row items-center justify-between px-4 py-2">
          {isSidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center">
                <Logo />
              </div>
            </motion.div>
          )}

          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
            >
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
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin")}
                tooltip="Dashboard"
              >
                <Link
                  href="/admin"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/add-poem")}
                tooltip="Add Poetry"
              >
                <Link
                  href="/admin/add-poem"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <PenLine className="h-5 w-5" />
                  <span>Add Poetry</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/manage-poems")}
                tooltip="Manage Poems"
              >
                <Link
                  href="/admin/manage-poems"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>Manage Poems</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/add-author")}
                tooltip="Add Author"
              >
                <Link
                  href="/admin/add-author"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Add Author</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/manage-authors")}
                tooltip="Manage Authors"
              >
                <Link
                  href="/admin/manage-authors"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Authors</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/upload-images")}
                tooltip="Upload Images"
              >
                <Link
                  href="/admin/upload-images"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Images</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/analytics")}
                tooltip="Analytics"
              >
                <Link
                  href="/admin/analytics"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Site">
                <Link href="/" onClick={() => isMobile && setOpenMobile(false)}>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Back to Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {session && (
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton tooltip="Sign Out">
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-primary/20 shadow-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-serif">
                        Sign out?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="italic text-sm font-serif">
                        Are you sure you want to sign out of the admin panel?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel className="text-sm">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSignOut}
                        className="text-sm bg-primary hover:bg-primary/90"
                      >
                        Sign out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            )}
          </SidebarMenu>

          {session && (
            <div className="px-3 py-2">
              <div className="flex items-center space-x-3 rounded-md border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user?.image || ""} alt="Profile" />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

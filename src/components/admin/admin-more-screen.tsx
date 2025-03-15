"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Users, ChevronLeft, Upload, BarChart3 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"

// Define the props type for AdminMoreScreen
interface AdminMoreScreenProps {
  onClose: () => void
}

export function AdminMoreScreen({ onClose }: AdminMoreScreenProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut()
  }

  const adminMenuItems = [
    { href: "/admin/add-author", icon: Users, label: "Add Author", description: "Create new poet profiles" },
    { href: "/admin/manage-authors", icon: Users, label: "Manage Authors", description: "Edit or delete poets" },
    { href: "/admin/upload-images", icon: Upload, label: "Upload Images", description: "Add cover images" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics", description: "View site statistics" },
    { href: "/admin/settings", icon: Settings, label: "Settings", description: "Configure admin options" },
  ]

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
      {/* Admin Profile Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="p-6 border-b bg-gradient-to-r from-primary/10 to-transparent relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/5 blur-xl"></div>
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full bg-primary/10 blur-lg"></div>

        {session ? (
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md ring-2 ring-background/50">
              <AvatarImage src={session.user?.image || ""} alt="Profile" />
              <AvatarFallback className="bg-primary/20">{session.user?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{session.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
              <AvatarFallback className="bg-primary/20">A</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">Admin</h3>
              <p className="text-sm text-muted-foreground">Please sign in</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Menu Items */}
      <motion.div initial="hidden" animate="visible" variants={staggerItems} className="flex-1 overflow-auto py-4 px-2">
        <div className="space-y-1">
          {adminMenuItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={fadeIn}
              custom={index}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Separator className="my-4" />

        <motion.div variants={fadeIn} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <span className="font-medium block">Back to Site</span>
              <span className="text-xs text-muted-foreground">Return to the main website</span>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Sign Out Button */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 border-t mt-auto bg-gradient-to-r from-transparent to-primary/10"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2 border-primary/20 hover:bg-primary/5">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-primary/20 shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-serif">Sign out?</AlertDialogTitle>
                <AlertDialogDescription className="italic text-sm font-serif">
                  Are you sure you want to sign out of the admin panel?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut} className="text-sm bg-primary hover:bg-primary/90">
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      )}
    </div>
  )
}


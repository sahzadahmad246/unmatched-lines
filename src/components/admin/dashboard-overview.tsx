"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenLine, Users, FileText, BookOpen, BarChart3, Settings, ImageIcon, Sparkles } from "lucide-react"

export function DashboardOverview() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-3 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl -z-10" />
        <div className="p-3 md:p-6 lg:p-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            Welcome to your poetry management dashboard. Manage your poetry collection, authors, and content all in one
            place.
          </p>

          <div className="flex flex-wrap gap-1.5 md:gap-4 mt-3 md:mt-6">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full shadow-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">12 Poems this week</span>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full shadow-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">8 Authors</span>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">New features available</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3 px-0 md:px-0"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-primary to-primary/60 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                Add Poetry
              </CardTitle>
              <CardDescription>Add new poems, ghazals, and shers to your collection</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <PenLine className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Create and publish new poetry content with our easy-to-use editor.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button asChild className="w-full">
                <Link href="/admin/add-poem">
                  <PenLine className="mr-2 h-4 w-4" />
                  Add New Poetry
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-indigo-500 to-indigo-300 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Add Author
              </CardTitle>
              <CardDescription>Manage authors for your poetry collection</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-indigo-500" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Add biographical information and manage poet profiles.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Link href="/admin/add-author">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Author
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-amber-500 to-amber-300 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Manage Content
              </CardTitle>
              <CardDescription>Edit and organize your existing poetry collection</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-amber-500" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Update, categorize, and manage your published poetry content.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              >
                <Link href="/admin/manage-poems">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Poems
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-300 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Manage Authors
              </CardTitle>
              <CardDescription>Edit and organize existing poets info</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-emerald-500" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Update author profiles, biographies, and associated works.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Link href="/admin/manage-authors">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Authors
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-rose-500 to-rose-300 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-rose-500" />
                Cover Images
              </CardTitle>
              <CardDescription>Manage cover images for your poetry collection</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-rose-500" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Upload, organize, and manage cover images for your poems.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button asChild variant="outline" className="w-full border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                <Link href="/admin/cover-images">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Manage Images
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full overflow-hidden group px-0 md:px-4">
            <div className="absolute h-1 w-full bg-gradient-to-r from-violet-500 to-violet-300 top-0 left-0" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-violet-500" />
                Settings
              </CardTitle>
              <CardDescription>Configure your poetry platform settings</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-10 w-10 md:h-12 md:w-12 text-violet-500" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Customize appearance, manage permissions, and configure site options.
              </p>
            </CardContent>
            <CardFooter className="px-2 md:px-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Site Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}


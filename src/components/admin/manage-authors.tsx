"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Eye, User, MoreVertical, Plus, Check, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type Author = {
  _id: string
  name: string
  slug: string
  image: string
  dob: string
  city: string
  bio: string
  createdAt: string
  updatedAt: string
}

export default function ManageAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/authors", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch authors")

      const data = await res.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error("Error fetching authors:", error)
      toast.error("Failed to load authors", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
  }

  const deleteAuthor = async () => {
    if (!deleteId) return

    try {
      const res = await fetch(`/api/authors/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Author deleted successfully!", {
          icon: <Check className="h-5 w-5" />,
        })
        setAuthors((prev) => prev.filter((a) => a._id !== deleteId))
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete author", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error("Error deleting author:", error)
      toast.error("Failed to delete author", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setDeleteId(null)
    }
  }

  const filteredAuthors = authors.filter((author) => author.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Card view for mobile
  const AuthorCard = ({ author }: { author: Author }) => (
    <motion.div variants={item} className="rounded-lg border p-2 md:p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-1 md:gap-2">
        <div className="space-y-0.5 md:space-y-1">
          <h3 className="font-medium">{author.name}</h3>
          <div className="text-sm text-muted-foreground">{author.city || "Unknown location"}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/poets/${author.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View on Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/add-author?id=${author._id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => confirmDelete(author._id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="text-xs text-muted-foreground mt-3">Added: {new Date(author.createdAt).toLocaleDateString()}</div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-3 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-3 md:mb-6">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Manage Authors</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search authors..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link href="/admin/manage-authors" className="whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Author
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-2">
            {loading ? (
              <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="rounded-lg border p-4 animate-pulse">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                      <div className="h-8 w-8 bg-muted rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No authors found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {searchTerm
                    ? "No authors match your search."
                    : "No authors have been added yet. Click 'Add Author' to create one."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block rounded-md border w-full overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredAuthors.map((author) => (
                          <TableRow key={author._id}>
                            <TableCell className="font-medium py-3">{author.name}</TableCell>
                            <TableCell className="py-3">{author.city || "Unknown"}</TableCell>
                            <TableCell className="py-3 text-sm text-muted-foreground">
                              {new Date(author.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" asChild>
                                  <Link href={`/poets/${author.slug}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View on Site</span>
                                  </Link>
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                  <Link href={`/admin/add-author?id=${author._id}`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => confirmDelete(author._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <motion.div
                  className="grid lg:hidden gap-4 grid-cols-1 md:grid-cols-2"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence>
                    {filteredAuthors.map((author) => (
                      <AuthorCard key={author._id} author={author} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this author and cannot be undone. Please ensure no poems are associated with
              this author.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAuthor} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}


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
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  Search,
  Eye,
  BookOpen,
  MoreVertical,
  Filter,
  Plus,
  Check,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Poem = {
  _id: string
  title: {
    en?: string
    hi?: string
    ur?: string
  }
  content: {
    en?: string[]
    hi?: string[]
    ur?: string[]
  }
  slug: {
    en?: string
    hi?: string
    ur?: string
  }
  category: string
  status: string
  author: {
    _id: string
    name: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function ManagePoems() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewPoem, setViewPoem] = useState<Poem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

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
    fetchPoems()
  }, [])

  const fetchPoems = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/poem", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch poems")

      const data = await res.json()
      setPoems(data.poems || [])
    } catch (error) {
      console.error("Error fetching poems:", error)
      toast.error("Failed to load poems", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
  }

  const deletePoem = async () => {
    if (!deleteId) return

    try {
      const res = await fetch(`/api/poem/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast.success("Poetry deleted successfully!", {
          icon: <Check className="h-5 w-5" />,
        })
        setPoems((prev) => prev.filter((p) => p._id !== deleteId))
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete poetry", {
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error("Error deleting poetry:", error)
      toast.error("Failed to delete poetry", {
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setDeleteId(null)
    }
  }

  const viewPoemDetails = (poem: Poem) => {
    setViewPoem(poem)
    setViewDialogOpen(true)
  }

  const filteredPoems = poems.filter((poem) => {
    const matchesSearch =
      poem.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || poem.category === categoryFilter
    const matchesStatus = statusFilter === "all" || poem.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "sher":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Sher
          </Badge>
        )
      case "ghazal":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Ghazal
          </Badge>
        )
      case "poem":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Poem
          </Badge>
        )
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Published
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Draft
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Card view for mobile
  const PoemCard = ({ poem }: { poem: Poem }) => (
    <motion.div variants={item} className="rounded-lg border p-2 md:p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-1 md:gap-2">
        <div className="space-y-0.5 md:space-y-1">
          <h3 className="font-medium">{poem.title?.en || "Untitled"}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {poem.author?.name || "Unknown"}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => viewPoemDetails(poem)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/poems/${poem?.slug.en}`}>
                <Eye className="h-4 w-4 mr-2" />
                View on Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/add-poem?id=${poem._id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => confirmDelete(poem._id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3">
        {getCategoryBadge(poem.category)}
        {getStatusBadge(poem.status)}
      </div>
      <div className="flex items-center text-xs text-muted-foreground mt-3">
        <Calendar className="h-3 w-3 mr-1" />
        {new Date(poem.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
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
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Manage Poetry</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search poems or authors..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link href="/admin/add-poem" className="whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Poem
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sher">Sher</SelectItem>
                  <SelectItem value="ghazal">Ghazal</SelectItem>
                  <SelectItem value="poem">Poem</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
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
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-5 w-16 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPoems.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No poems found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                    ? "No poems match your current filters. Try adjusting your search or filters."
                    : "No poems have been added yet. Click the 'Add Poem' button to create your first poem."}
                </p>
                {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("")
                      setCategoryFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
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
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredPoems.map((poem) => (
                          <TableRow key={poem._id}>
                            <TableCell className="font-medium py-3">{poem.title?.en || "Untitled"}</TableCell>
                            <TableCell className="py-3">{poem.author?.name || "Unknown"}</TableCell>
                            <TableCell className="py-3">{getCategoryBadge(poem.category)}</TableCell>
                            <TableCell className="py-3">{getStatusBadge(poem.status)}</TableCell>
                            <TableCell className="py-3 text-sm text-muted-foreground">
                              {new Date(poem.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => viewPoemDetails(poem)}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                  <Link href={`/poems/${poem.slug.en}`}>
                                    <BookOpen className="h-4 w-4" />
                                    <span className="sr-only">View on Site</span>
                                  </Link>
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                  <Link href={`/admin/add-poem?id=${poem._id}`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => confirmDelete(poem._id)}
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
                    {filteredPoems.map((poem) => (
                      <PoemCard key={poem._id} poem={poem} />
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
              This will permanently delete this poetry and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePoem} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Poem Details</DialogTitle>
          </DialogHeader>
          {viewPoem && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">{viewPoem.title?.en || "Untitled"}</h2>
                <div className="flex flex-wrap gap-2">
                  {getCategoryBadge(viewPoem.category)}
                  {getStatusBadge(viewPoem.status)}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{viewPoem.author?.name || "Unknown"}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(viewPoem.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Content</h3>
                <div className="space-y-4 bg-muted/30 p-4 rounded-md">
                  {viewPoem.content?.en?.map((verse, index) => (
                    <p key={index} className="text-base">
                      {verse}
                    </p>
                  ))}
                </div>
              </div>

              {viewPoem.tags && viewPoem.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewPoem.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/admin/add-poem?id=${viewPoem._id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/poems/${viewPoem.slug.en}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    View on Site
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}


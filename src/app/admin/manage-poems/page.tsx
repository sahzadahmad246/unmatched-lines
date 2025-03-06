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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Eye, BookOpen, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Poem = {
  _id: string
  title: {
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

// Default export for the Next.js page
export default function ManagePoems() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
      toast.error("Failed to load poems")
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
        toast.success("Poetry deleted successfully!")
        setPoems((prev) => prev.filter((p) => p._id !== deleteId))
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete poetry")
      }
    } catch (error) {
      console.error("Error deleting poetry:", error)
      toast.error("Failed to delete poetry")
    } finally {
      setDeleteId(null)
    }
  }

  const filteredPoems = poems.filter(
    (poem) =>
      poem.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{poem.title?.en || "Untitled"}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/poem/${poem._id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/add-poem?id=${poem._id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => confirmDelete(poem._id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Author:</span>
          <span>{poem.author?.name || "Unknown"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Category:</span>
          <span>{getCategoryBadge(poem.category)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span>{getStatusBadge(poem.status)}</span>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Manage Poetry</span>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search poems or authors..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading poems...</div>
          ) : filteredPoems.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {searchTerm ? "No poems found matching your search." : "No poems added yet."}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredPoems.map((poem) => (
                        <TableRow key={poem._id}>
                          <TableCell className="font-medium">{poem.title?.en || "Untitled"}</TableCell>
                          <TableCell>{poem.author?.name || "Unknown"}</TableCell>
                          <TableCell>{getCategoryBadge(poem.category)}</TableCell>
                          <TableCell>{getStatusBadge(poem.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" asChild>
                                <Link href={`/poem/${poem._id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
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
              <div className="grid md:hidden gap-4 grid-cols-1">
                <AnimatePresence>
                  {filteredPoems.map((poem) => (
                    <PoemCard key={poem._id} poem={poem} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          <div className="mt-4 flex justify-end">
            <Button asChild>
              <Link href="/admin/add-poem">Add New Poetry</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
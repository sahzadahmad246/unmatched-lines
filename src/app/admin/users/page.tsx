"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAdminStore } from "@/store/admin-store"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, MapPin, Calendar, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { IUser } from "@/types/userTypes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

export default function UsersPage() {
  const { fetchAllUsers, searchUsers, deleteUserByIdentifier, loading } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [page, setPage] = useState(1)
  const [allUsers, setAllUsers] = useState<IUser[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const router = useRouter()
  const observer = useRef<IntersectionObserver | null>(null)

  // Fetch users with pagination
  const fetchUsers = useCallback(
    async (pageNum: number, reset = false) => {
      setIsFetching(true)
      try {
        let totalPages = 1
        if (debouncedSearchTerm.trim()) {
          await searchUsers(debouncedSearchTerm, pageNum, 10)
          const response = await fetch(
            `/api/usersearch?type=user&query=${encodeURIComponent(debouncedSearchTerm)}&page=${pageNum}&limit=10`,
          )
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
          const data = await response.json()
          totalPages = data.users.pagination.pages
          setAllUsers((prev) => (reset ? data.users.results : [...prev, ...data.users.results]))
        } else {
          await fetchAllUsers(pageNum, 10)
          const response = await fetch(`/api/users?page=${pageNum}&limit=10`)
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
          const data = await response.json()
          totalPages = data.pagination.totalPages
          setAllUsers((prev) => (reset ? data.users : [...prev, ...data.users]))
        }
        setHasMore(pageNum < totalPages)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch users")
      } finally {
        setIsFetching(false)
      }
    },
    [debouncedSearchTerm, fetchAllUsers, searchUsers],
  )

  // Reset and fetch users when search term changes
  useEffect(() => {
    setPage(1)
    setAllUsers([])
    setHasMore(true)
    fetchUsers(1, true)
  }, [debouncedSearchTerm, fetchUsers])

  // Fetch next page
  useEffect(() => {
    if (page > 1) {
      fetchUsers(page)
    }
  }, [page, fetchUsers])

  // Intersection Observer for infinite scroll
  const lastUserElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetching || !hasMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isFetching, hasMore],
  )

  const handleEdit = (user: IUser) => {
    router.push(`/admin/users/${user.slug}/edit`)
  }

  const handleDelete = async (user: IUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      const result = await deleteUserByIdentifier(user.slug)
      if (result.success) {
        toast.success("User deleted successfully")
        setAllUsers((prev) => prev.filter((u) => u.slug !== user.slug))
      } else {
        toast.error(result.message || "Failed to delete user")
      }
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "poet":
        return "default"
      default:
        return "secondary"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑"
      case "poet":
        return "✍️"
      default:
        return "👤"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-muted-foreground text-lg">Manage platform users and their roles</p>
          </div>
          <Button
            asChild
            className="shrink-0 h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{allUsers.filter((u) => u.role === "poet").length}</p>
                  <p className="text-sm text-muted-foreground">Poets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{allUsers.filter((u) => u.role === "admin").length}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allUsers.reduce((sum, u) => sum + (u.poemCount || 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Poems</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-primary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({allUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || (isFetching && page === 1) ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Poems</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-lg font-medium text-muted-foreground">No users found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        allUsers.map((user, index) => (
                          <TableRow
                            key={user._id}
                            ref={index === allUsers.length - 1 ? lastUserElementRef : null}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 ring-2 ring-border">
                                  <AvatarImage src={user.profilePicture?.url || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {user.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-semibold text-base truncate">{user.name}</div>
                                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                                {getRoleIcon(user.role)} {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user.poemCount || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{user.location || "Not specified"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(user)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {allUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-muted-foreground">No users found</p>
                      </div>
                    </div>
                  ) : (
                    allUsers.map((user, index) => (
                      <Card
                        key={user._id}
                        ref={index === allUsers.length - 1 ? lastUserElementRef : null}
                        className="border-2 border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar className="h-12 w-12 ring-2 ring-border shrink-0">
                                <AvatarImage src={user.profilePicture?.url || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-base truncate">{user.name}</div>
                                <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                                    {getRoleIcon(user.role)} {user.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{user.poemCount || 0}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Poems</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-xs truncate">
                                  {user.location
                                    ? user.location.substring(0, 8) + (user.location.length > 8 ? "..." : "")
                                    : "N/A"}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Location</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-xs">
                                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Joined</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Infinite Scroll Loading Indicator */}
                {isFetching && page > 1 && (
                  <div className="flex justify-center p-6 border-t border-border/50" role="status" aria-live="polite">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Loading more users...</span>
                    </div>
                  </div>
                )}

                {/* End of Results Indicator */}
                {!hasMore && allUsers.length > 0 && (
                  <div className="flex justify-center p-6 border-t border-border/50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">You have reached the end!</p>
                      <p className="text-xs text-muted-foreground">No more users to load</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

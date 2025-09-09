"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/store/admin-store"
import { Users, BookOpen, Eye, Plus, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IUser } from "@/types/userTypes"
import { TransformedArticle } from "@/types/articleTypes"

interface Stats {
  totalUsers: number;
  totalArticles: number;
  totalViews: number;
  totalBookmarks: number;
  recentUsers: IUser[];
  recentArticles: TransformedArticle[];
}

export default function AdminDashboard() {
  const { users, fetchAllUsers, loading: usersLoading } = useAdminStore()
  const [articles, setArticles] = useState<TransformedArticle[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalArticles: 0,
    totalViews: 0,
    totalBookmarks: 0,
    recentUsers: [],
    recentArticles: [],
  })

  useEffect(() => {
    fetchAllUsers(1, 100)
    fetchArticles()
  }, [fetchAllUsers])

  const fetchArticles = async () => {
    try {
      setArticlesLoading(true)
      const response = await fetch('/api/articles/list?limit=100')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setArticlesLoading(false)
    }
  }

 useEffect(() => {
  // Ensure articles and users are defined before processing
  if (!articles || !users) return;

  try {
    const totalViews = articles.reduce((sum, article) => sum + (article.viewsCount || 0), 0);
    const totalBookmarks = articles.reduce((sum, article) => sum + (article.bookmarkCount || 0), 0);
    
    const recentUsers: IUser[] = (users || [])
      .sort((a: IUser, b: IUser) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
      
    const recentArticles: TransformedArticle[] = articles
      .sort((a: TransformedArticle, b: TransformedArticle) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
      .slice(0, 5);

    setStats({
      totalUsers: users.length,
      totalArticles: articles.length,
      totalViews,
      totalBookmarks,
      recentUsers,
      recentArticles,
    });
  } catch (error) {
    console.error("Error processing dashboard data:", error);
  }
}, [users, articles]);

  const roleStats = users.reduce(
    (acc, user: IUser) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryStats = articles.reduce(
    (acc, article: TransformedArticle) => {
      const categories = article.category || []
      categories.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your poetry platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {roleStats.admin || 0} admins, {roleStats.poet || 0} poets, {roleStats.user || 0} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              {articles.filter((a: TransformedArticle) => a.publishedAt).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookmarks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User bookmarks</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture?.url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{user.poemCount} poems</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Articles</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/articles">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentArticles.map((article) => (
                  <div key={article._id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium line-clamp-1">{article.title}</h4>
                      <Badge variant={article.publishedAt ? "default" : "secondary"} className="text-xs ml-2">
                        {article.publishedAt ? "published" : "draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {article.category?.[0] || "General"}
                      </Badge>
                      <span>{article.viewsCount || 0} views</span>
                      <span>{article.bookmarkCount || 0} bookmarks</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(article.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Article Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
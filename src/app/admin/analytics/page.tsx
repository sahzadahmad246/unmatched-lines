"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  FileText, 
  Eye, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  totalUsers: number;
  totalArticles: number;
  totalPoems: number;
  totalViews: number;
  totalBookmarks: number;
  recentUsers: Array<{
    _id: string;
    name: string;
    slug: string;
    role: string;
    createdAt: string;
  }>;
  recentArticles: Array<{
    _id: string;
    title: string;
    poet: { name: string };
    viewsCount: number;
    bookmarkCount: number;
    createdAt: string;
  }>;
  recentPoems: Array<{
    _id: string;
    title: { en?: string; hi?: string; ur?: string };
    poet: { name: string };
    viewsCount: number;
    bookmarkCount: number;
    createdAt: string;
  }>;
  categoryStats: Record<string, number>;
  monthlyStats: {
    month: string;
    users: number;
    articles: number;
    poems: number;
    views: number;
  }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [usersRes, articlesRes, poemsRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/articles/list?limit=100"),
        fetch("/api/poems?limit=100")
      ])

      if (!usersRes.ok || !articlesRes.ok || !poemsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const [usersData, articlesData, poemsData] = await Promise.all([
        usersRes.json(),
        articlesRes.json(),
        poemsRes.json()
      ])

      const users = usersData.users || []
      const articles = articlesData.articles || []
      const poems = poemsData.poems || []

      // Calculate stats
      const totalViews = articles.reduce((sum: number, article: { viewsCount?: number }) => sum + (article.viewsCount || 0), 0) +
                        poems.reduce((sum: number, poem: { viewsCount?: number }) => sum + (poem.viewsCount || 0), 0)
      
      const totalBookmarks = articles.reduce((sum: number, article: { bookmarkCount?: number }) => sum + (article.bookmarkCount || 0), 0) +
                            poems.reduce((sum: number, poem: { bookmarkCount?: number }) => sum + (poem.bookmarkCount || 0), 0)

      // Category stats for articles
      const categoryStats = articles.reduce((acc: Record<string, number>, article: { category?: string[] }) => {
        if (article.category && Array.isArray(article.category)) {
          article.category.forEach((cat: string) => {
            acc[cat] = (acc[cat] || 0) + 1
          })
        }
        return acc
      }, {})

      // Recent items (last 5)
      const recentUsers = users
        .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      const recentArticles = articles
        .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      const recentPoems = poems
        .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      // Monthly stats (last 6 months)
      const monthlyStats = generateMonthlyStats(users, articles, poems)

      setAnalyticsData({
        totalUsers: users.length,
        totalArticles: articles.length,
        totalPoems: poems.length,
        totalViews,
        totalBookmarks,
        recentUsers,
        recentArticles,
        recentPoems,
        categoryStats,
        monthlyStats
      })

    } catch {
      toast.error("Failed to fetch analytics data")
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyStats = (users: Array<{ createdAt: string }>, articles: Array<{ createdAt: string; viewsCount?: number }>, poems: Array<{ createdAt: string; viewsCount?: number }>) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const monthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear()
      }).length

      const monthArticles = articles.filter(article => {
        const articleDate = new Date(article.createdAt)
        return articleDate.getMonth() === date.getMonth() && articleDate.getFullYear() === date.getFullYear()
      }).length

      const monthPoems = poems.filter(poem => {
        const poemDate = new Date(poem.createdAt)
        return poemDate.getMonth() === date.getMonth() && poemDate.getFullYear() === date.getFullYear()
      }).length

      const monthViews = articles.reduce((sum, article) => {
        const articleDate = new Date(article.createdAt)
        if (articleDate.getMonth() === date.getMonth() && articleDate.getFullYear() === date.getFullYear()) {
          return sum + (article.viewsCount || 0)
        }
        return sum
      }, 0) + poems.reduce((sum, poem) => {
        const poemDate = new Date(poem.createdAt)
        if (poemDate.getMonth() === date.getMonth() && poemDate.getFullYear() === date.getFullYear()) {
          return sum + (poem.viewsCount || 0)
        }
        return sum
      }, 0)

      months.push({
        month: monthStr,
        users: monthUsers,
        articles: monthArticles,
        poems: monthPoems,
        views: monthViews
      })
    }

    return months
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Button onClick={fetchAnalyticsData}>Refresh</Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform&apos;s performance</p>
        </div>
        <Button onClick={fetchAnalyticsData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poems</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPoems}</div>
            <p className="text-xs text-muted-foreground">Published poems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalBookmarks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User bookmarks</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Article Categories Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analyticsData.categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Growth (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Users</th>
                  <th className="text-right p-2">Articles</th>
                  <th className="text-right p-2">Poems</th>
                  <th className="text-right p-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyStats.map((stat) => (
                  <tr key={stat.month} className="border-b">
                    <td className="p-2 font-medium">{stat.month}</td>
                    <td className="p-2 text-right">{stat.users}</td>
                    <td className="p-2 text-right">{stat.articles}</td>
                    <td className="p-2 text-right">{stat.poems}</td>
                    <td className="p-2 text-right">{stat.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.slug}</p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.recentArticles.map((article) => (
                <div key={article._id} className="p-2 border rounded">
                  <p className="font-medium text-sm truncate">{article.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{article.poet?.name}</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{article.viewsCount || 0} views</Badge>
                      <Badge variant="outline" className="text-xs">{article.bookmarkCount || 0} bookmarks</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Poems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.recentPoems.map((poem) => (
                <div key={poem._id} className="p-2 border rounded">
                  <p className="font-medium text-sm truncate">{poem.title?.en || poem.title?.hi || poem.title?.ur}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{poem.poet?.name}</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{poem.viewsCount || 0} views</Badge>
                      <Badge variant="outline" className="text-xs">{poem.bookmarkCount || 0} bookmarks</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ArticleCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-200">
      <CardContent className="flex flex-col flex-grow justify-between p-4 pt-0">
        {/* Poet on left, Date on right */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 animate-pulse bg-gray-200">
              <AvatarFallback className="bg-gray-300"></AvatarFallback>
            </Avatar>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* First Couplet */}
        <CardDescription className="text-base mt-2 mb-4 border-l-4 border-gray-300 pl-4">
          <div className="h-5 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-11/12 bg-gray-200 rounded animate-pulse"></div>
        </CardDescription>
        {/* Views, Bookmarks, Copy, and More Menu */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-auto">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse ml-auto"></div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Crown } from "lucide-react";
import Link from "next/link";
import type { IPoet } from "@/types/userTypes";

interface PoetCardProps {
  poet: IPoet;
}

export default function PoetCard({ poet }: PoetCardProps) {
  return (
    <Card className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
              <AvatarImage
                src={poet.profilePicture?.url || "/placeholder.svg"}
                alt={poet.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold text-primary">
                {poet.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Poet Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-1">
              {poet.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              @{poet.slug}
            </p>
            {poet.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {poet.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
            >
              <FileText className="h-3 w-3 mr-1" />
              {poet.articleCount} Articles
            </Badge>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            size="sm"
          >
            <Link href={`/poet/${poet.slug}`}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

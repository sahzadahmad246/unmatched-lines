import PoetList from "@/components/poets/poet-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover Poets | Unmatched Lines",
  description: "Explore talented poets and their beautiful works. Discover new voices and connect with the poetry community.",
  openGraph: {
    title: "Discover Poets | Unmatched Lines",
    description: "Explore talented poets and their beautiful works. Discover new voices and connect with the poetry community.",
    type: "website",
  },
}

export default function PoetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/10">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-2 -left-2 h-4 w-4 bg-accent/20 rounded-full animate-pulse delay-300" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Discover Poets
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            Connect with talented poets from around the world. Explore their beautiful works, 
            discover new voices, and be inspired by the power of words.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-xl px-6 py-3 border border-primary/20 dark:border-primary/10">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Verified Poets</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/5 dark:to-primary/5 rounded-xl px-6 py-3 border border-accent/20 dark:border-accent/10">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Community Driven</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-xl px-6 py-3 border border-primary/20 dark:border-primary/10">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Inspiring Content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Poets List */}
        <PoetList />
      </div>
    </div>
  )
}

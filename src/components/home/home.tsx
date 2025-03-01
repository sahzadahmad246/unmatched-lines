"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Unmatched Lines</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover the beauty of poetry from renowned poets across different languages and traditions.
        </p>

        {!session && (
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/poets">Explore Poets</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Poets</CardTitle>
            <CardDescription>Discover renowned poets and their works</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore the lives and works of famous poets from various traditions and languages.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/poets">Browse Poets</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sher</CardTitle>
            <CardDescription>Explore beautiful couplets</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Discover the art of Sher, the eloquent couplets that capture profound emotions and thoughts.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/sher">Explore Sher</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ghazal</CardTitle>
            <CardDescription>Experience the lyrical form of poetry</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Immerse yourself in the melodious and structured form of Ghazal poetry.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/ghazal">Read Ghazals</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


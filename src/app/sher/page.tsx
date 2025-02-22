"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"

const shers = [
  { id: 1, title: "The Flame of Love", poet: "Rumi", image: "/placeholder.svg?height=200&width=300" },
  { id: 2, title: "The Mirror of Life", poet: "Ghalib", image: "/placeholder.svg?height=200&width=300" },
  { id: 3, title: "The Wine of Wisdom", poet: "Hafez", image: "/placeholder.svg?height=200&width=300" },
  { id: 4, title: "The Eagle's Flight", poet: "Iqbal", image: "/placeholder.svg?height=200&width=300" },
]

export default function Shers() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredShers = shers.filter(
    (sher) =>
      sher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sher.poet.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Shers</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search shers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShers.map((sher) => (
          <Card key={sher.id}>
            <CardHeader>
              <Image
                src={sher.image || "/placeholder.svg"}
                alt={sher.title}
                width={300}
                height={200}
                className="rounded-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{sher.title}</CardTitle>
              <p className="text-gray-600">By {sher.poet}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/shers/${sher.id}`}>
                <Button>Read</Button>
              </Link>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


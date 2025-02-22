"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"

const ghazals = [
  { id: 1, title: "The Whispers of Love", poet: "Rumi", image: "/placeholder.svg?height=200&width=300" },
  { id: 2, title: "Moonlit Nights", poet: "Ghalib", image: "/placeholder.svg?height=200&width=300" },
  { id: 3, title: "The Garden of Paradise", poet: "Hafez", image: "/placeholder.svg?height=200&width=300" },
  { id: 4, title: "Echoes of the Soul", poet: "Iqbal", image: "/placeholder.svg?height=200&width=300" },
]

export default function Ghazals() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGhazals = ghazals.filter(
    (ghazal) =>
      ghazal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ghazal.poet.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Ghazals</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search ghazals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGhazals.map((ghazal) => (
          <Card key={ghazal.id}>
            <CardHeader>
              <Image
                src={ghazal.image || "/placeholder.svg"}
                alt={ghazal.title}
                width={300}
                height={200}
                className="rounded-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{ghazal.title}</CardTitle>
              <p className="text-gray-600">By {ghazal.poet}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/ghazals/${ghazal.id}`}>
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


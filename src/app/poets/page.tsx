"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const poets = [
  {
    id: 1,
    name: "Rumi",
    birthDate: "1207",
    birthPlace: "Balkh",
    ghazals: 150,
    shers: 500,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Ghalib",
    birthDate: "1797",
    birthPlace: "Agra",
    ghazals: 200,
    shers: 700,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Hafez",
    birthDate: "1315",
    birthPlace: "Shiraz",
    ghazals: 180,
    shers: 600,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Iqbal",
    birthDate: "1877",
    birthPlace: "Sialkot",
    ghazals: 100,
    shers: 400,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function Poets() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPoets = poets.filter((poet) => poet.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Poets</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search poets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoets.map((poet) => (
          <Card key={poet.id}>
            <CardHeader>
              <CardTitle>{poet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Image
                  src={poet.image || "/placeholder.svg"}
                  alt={poet.name}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>
                  <p>Born: {poet.birthDate}</p>
                  <p>Place: {poet.birthPlace}</p>
                  <p>Ghazals: {poet.ghazals}</p>
                  <p>Shers: {poet.shers}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/poets/${poet.id}`}>
                <Button>View Profile</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


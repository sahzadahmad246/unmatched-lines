"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, AlertTriangle, Search, Filter } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { PoetCard } from "@/components/home/poet-card"
import { useMediaQuery } from "@/components/home/use-media-query"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Checkbox } from "@/components/ui/checkbox"

interface Poet {
  _id: string
  name: string
  slug: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

export default function Poets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [authors, setAuthors] = useState<Poet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch("/api/authors", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch authors")
        const data = await res.json()
        
        // Type assertion to ensure we're working with the correct type
        const authorsData = data.authors as Poet[] || []
        setAuthors(authorsData)
        
        // Extract unique cities for filtering
        const cities = [...new Set(authorsData.map(author => author.city).filter(Boolean))]
        setAvailableCities(cities as string[])
      } catch (err) {
        setError("Failed to load poets")
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [])

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  // Filter authors based on search term and selected cities
  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = selectedCities.length === 0 || (author.city && selectedCities.includes(author.city))
    return matchesSearch && matchesCity
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Loading poets...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{error}</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sticky search bar for mobile */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-background pt-4 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search poets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Explore Poets</h1>
          <p className="text-muted-foreground mt-1">
            Discover renowned poets and their beautiful works
          </p>
        </div>

        {/* Desktop search */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`relative max-w-sm w-full transition-all ${
              isSearchFocused ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search poets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Filter drawer for mobile */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Poets</DrawerTitle>
            <DrawerDescription>Filter poets by city</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            <div className="space-y-4">
              {availableCities.map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <Checkbox
                    id={`city-${city}`}
                    checked={selectedCities.includes(city)}
                    onCheckedChange={() => toggleCity(city)}
                  />
                  <label
                    htmlFor={`city-${city}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {city}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setFilterOpen(false)}>Apply Filters</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredAuthors.length}</span> poets
          {selectedCities.length > 0 && (
            <span> from {selectedCities.join(", ")}</span>
          )}
          {searchTerm && <span> matching "{searchTerm}"</span>}
        </p>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAuthors.map((author, index) => (
            <PoetCard 
              key={author._id}
              poet={author}
              variant="compact"
              index={index}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

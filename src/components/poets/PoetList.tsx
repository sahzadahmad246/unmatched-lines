"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PoetCard } from "@/components/poets/poet-card"
import { useMediaQuery } from "@/components/home/use-media-query"

export interface Poet {
  _id: string
  name: string
  slug: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

interface PoetListProps {
  poets: Poet[]
  loading?: boolean
  error?: string | null
  variant?: "grid" | "carousel"
  title?: string
  showViewAll?: boolean
  viewAllHref?: string
  featuredPoets?: boolean
  className?: string
}

// Alphabet array for filtering
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function PoetList({
  poets = [],
  loading = false,
  error = null,
  variant = "grid",
  title,
  showViewAll = false,
  viewAllHref = "/poets",
  featuredPoets = false,
  className = "",
}: PoetListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  useEffect(() => {
    if (poets.length > 0) {
      // Extract unique cities
      const cities = [...new Set(poets.map((poet) => poet.city).filter(Boolean))] as string[]
      setAvailableCities(cities)
    }
  }, [poets])

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  const toggleLetter = (letter: string) => {
    setSelectedLetters((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]))
  }

  const filteredPoets = poets.filter((poet) => {
    const matchesSearch = searchTerm.trim() === "" || poet.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = selectedCities.length === 0 || (poet.city && selectedCities.includes(poet.city))

    const matchesLetter =
      selectedLetters.length === 0 || selectedLetters.some((letter) => poet.name.toUpperCase().startsWith(letter))

    return matchesSearch && matchesCity && matchesLetter
  })

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = isMobile ? 220 : isTablet ? 320 : 400
      const scrollLeft = direction === "left" ? current.scrollLeft - scrollAmount : current.scrollLeft + scrollAmount

      current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      })
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold">{error}</h3>
          <p className="mt-2 text-sm text-muted-foreground">Please try again later or refresh the page.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )
    }

    if (filteredPoets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No poets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {(selectedCities.length > 0 || selectedLetters.length > 0) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedCities([])
                setSelectedLetters([])
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )
    }

    if (variant === "carousel") {
      return (
        <div className="relative">
          {filteredPoets.length > (isMobile ? 1 : isTablet ? 3 : 4) && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border-muted-foreground/30 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background/70 md:-left-6 md:h-10 md:w-10"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border-muted-foreground/30 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background/70 md:-right-6 md:h-10 md:w-10"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="flex w-full space-x-4 overflow-x-auto pb-4 pt-1 px-4 scrollbar-hide snap-x"
          >
            {filteredPoets.map((poet, index) => (
              <div key={poet._id} className="min-w-[160px] flex-none snap-start md:min-w-[200px] lg:min-w-[220px]">
                <PoetCard poet={poet} variant="compact" featured={featuredPoets} />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 px-4 sm:px-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredPoets.map((poet) => (
          <PoetCard key={poet._id} poet={poet} />
        ))}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header with title and search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center justify-between px-4 sm:px-0">
          {title && <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>}

          {showViewAll && featuredPoets && (
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <a href={viewAllHref}>
                View all poets
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {!featuredPoets && (
          <div className="flex items-center gap-2 px-4 sm:px-0">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <p className="text-sm text-muted-foreground whitespace-nowrap hidden md:block">
                {filteredPoets.length > 0 && (
                  <>
                    Showing <span className="font-medium">{filteredPoets.length}</span> poets
                  </>
                )}
              </p>

              <div
                className={`relative flex-1 md:w-64 md:max-w-sm ${isSearchFocused ? "ring-2 ring-ring ring-offset-2" : ""}`}
              >
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search poets..."
                  className="pl-8 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                    onClick={() => setSearchTerm("")}
                  >
                    <span className="sr-only">Clear</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                )}
              </div>

              <Sheet open={openFilter} onOpenChange={setOpenFilter}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Poets</SheetTitle>
                    <SheetDescription>Filter poets by alphabet or city</SheetDescription>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* Alphabet filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Filter by first letter</h3>
                      <div className="flex flex-wrap gap-1">
                        {ALPHABET.map((letter) => (
                          <Button
                            key={letter}
                            variant={selectedLetters.includes(letter) ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => toggleLetter(letter)}
                          >
                            {letter}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* City filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Filter by city</h3>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {availableCities.length > 0 ? (
                          availableCities.map((city) => (
                            <div key={city} className="flex items-center space-x-2">
                              <Checkbox
                                id={`city-${city}`}
                                checked={selectedCities.includes(city)}
                                onCheckedChange={() => toggleCity(city)}
                              />
                              <Label
                                htmlFor={`city-${city}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {city}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No cities available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="flex flex-row gap-3 sm:justify-end">
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </SheetClose>
                    {(selectedCities.length > 0 || selectedLetters.length > 0) && (
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setSelectedCities([])
                          setSelectedLetters([])
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {showViewAll && (
              <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                <a href={viewAllHref}>View all</a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter badges */}
      {(selectedCities.length > 0 || selectedLetters.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2 px-4 sm:px-0">
          {selectedLetters.map((letter) => (
            <Badge key={`letter-${letter}`} variant="secondary" className="flex items-center gap-1">
              {letter}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => toggleLetter(letter)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Remove {letter} filter</span>
              </button>
            </Badge>
          ))}

          {selectedCities.map((city) => (
            <Badge key={`city-${city}`} variant="secondary" className="flex items-center gap-1">
              {city}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => toggleCity(city)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Remove {city} filter</span>
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setSelectedCities([])
              setSelectedLetters([])
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results count for mobile */}
      {!featuredPoets && filteredPoets.length > 0 && (
        <div className="mb-4 px-4 sm:px-0 md:hidden">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredPoets.length}</span>{" "}
            {filteredPoets.length === 1 ? "poet" : "poets"}
            {searchTerm && (
              <span>
                {" "}
                for "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Poets list/grid */}
      {renderContent()}
    </div>
  )
}

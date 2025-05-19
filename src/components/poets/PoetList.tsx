// src/components/poets/PoetList.tsx
"use client";

import { useEffect, useRef,useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PoetCard } from "@/components/poets/poet-card";
import { useStore } from "@/lib/store";
import { useMediaQuery } from "@/components/home/use-media-query";
import { Author } from "@/types/author";

export interface PoetListProps {
  initialPoets: Author[];
  initialMeta: { page: number; total: number; pages: number; hasMore: boolean };
}

// Alphabet array for filtering
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function PoetList({ initialPoets, initialMeta }: PoetListProps) {
  const {
    poets,
    poetMeta,
    poetSearchQuery,
    poetFilters,
    loading,
    error,
    fetchPoets,
    setPoetSearchQuery,
    setPoetFilters,
  } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Initialize Zustand with SSR data
  useEffect(() => {
    fetchPoets({
      page: initialMeta.page,
      limit: 20,
      reset: true,
    });
  }, [initialMeta, fetchPoets]);

  // Lazy loading
  useEffect(() => {
    const meta = poetMeta || initialMeta;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta.hasMore && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchPoets({
            page: meta.page + 1,
            limit: 20,
            search: poetSearchQuery,
            cities: poetFilters.cities,
            letters: poetFilters.letters,
          }).finally(() => {
            isFetchingRef.current = false;
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [poetMeta, initialMeta, poetSearchQuery, poetFilters, fetchPoets]);

  // Available cities
  const availableCities = [...new Set(poets.map((poet) => poet.city).filter(Boolean))] as string[];

  const filteredPoets = poets.length > 0 ? poets : initialPoets;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = isMobile ? 220 : isTablet ? 320 : 400;
      const scrollLeft =
        direction === "left" ? current.scrollLeft - scrollAmount : current.scrollLeft + scrollAmount;

      current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  const renderContent = () => {
    if (loading && filteredPoets.length === 0) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-200 dark:bg-gray-800 p-3 text-gray-600 dark:text-gray-400">
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
          <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">{error}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please try again later or refresh the page.
          </p>
          <Button
            className="mt-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (filteredPoets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-200 dark:bg-gray-800 p-3">
            <Search className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">No poets found</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {(poetFilters.cities.length > 0 || poetFilters.letters.length > 0) && (
            <Button
              variant="outline"
              className="mt-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setPoetFilters({ cities: [], letters: [] })}
            >
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div
        className="grid grid-cols-2 gap-4 px-4 sm:px-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        ref={sectionRef}
      >
        {filteredPoets.map((poet) => (
          <PoetCard key={poet._id} poet={poet} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header with title and search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center justify-between px-4 sm:px-0">
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white md:text-3xl">
            Poets
          </h2>
        </div>

        <div className="flex items-center gap-2 px-4 sm:px-0">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap hidden md:block">
              {filteredPoets.length > 0 && (
                <>
                  Showing <span className="font-medium">{filteredPoets.length}</span> poets
                </>
              )}
            </p>

            <div
              className={`relative flex-1 md:w-64 md:max-w-sm ${
                isSearchFocused ? "ring-2 ring-gray-300 dark:ring-gray-700 ring-offset-2" : ""
              }`}
            >
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search poets..."
                className="pl-8 pr-4 bg-white dark:bg-gray-950 text-black dark:text-white border-gray-200 dark:border-gray-700"
                value={poetSearchQuery}
                onChange={(e) => {
                  setPoetSearchQuery(e.target.value);
                  fetchPoets({
                    page: 1,
                    limit: 20,
                    search: e.target.value,
                    cities: poetFilters.cities,
                    letters: poetFilters.letters,
                    reset: true,
                  });
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {poetSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    setPoetSearchQuery("");
                    fetchPoets({
                      page: 1,
                      limit: 20,
                      cities: poetFilters.cities,
                      letters: poetFilters.letters,
                      reset: true,
                    });
                  }}
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
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isMobile ? "bottom" : "right"}
                className="overflow-y-auto bg-white dark:bg-gray-950"
              >
                <SheetHeader>
                  <SheetTitle className="text-black dark:text-white">Filter Poets</SheetTitle>
                  <SheetDescription className="text-gray-600 dark:text-gray-400">
                    Filter poets by alphabet or city
                  </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  {/* Alphabet filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-black dark:text-white">
                      Filter by first letter
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {ALPHABET.map((letter) => (
                        <Button
                          key={letter}
                          variant={poetFilters.letters.includes(letter) ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs ${
                            poetFilters.letters.includes(letter)
                              ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-black"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            const newLetters = poetFilters.letters.includes(letter)
                              ? poetFilters.letters.filter((l) => l !== letter)
                              : [...poetFilters.letters, letter];
                            setPoetFilters({ letters: newLetters });
                            fetchPoets({
                              page: 1,
                              limit: 20,
                              search: poetSearchQuery,
                              cities: poetFilters.cities,
                              letters: newLetters,
                              reset: true,
                            });
                          }}
                        >
                          {letter}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* City filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-black dark:text-white">Filter by city</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {availableCities.length > 0 ? (
                        availableCities.map((city) => (
                          <div key={city} className="flex items-center space-x-2">
                            <Checkbox
                              id={`city-${city}`}
                              checked={poetFilters.cities.includes(city)}
                              onCheckedChange={() => {
                                const newCities = poetFilters.cities.includes(city)
                                  ? poetFilters.cities.filter((c) => c !== city)
                                  : [...poetFilters.cities, city];
                                setPoetFilters({ cities: newCities });
                                fetchPoets({
                                  page: 1,
                                  limit: 20,
                                  search: poetSearchQuery,
                                  cities: newCities,
                                  letters: poetFilters.letters,
                                  reset: true,
                                });
                              }}
                            />
                            <Label
                              htmlFor={`city-${city}`}
                              className="text-sm font-medium text-black dark:text-white"
                            >
                              {city}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No cities available</p>
                      )}
                    </div>
                  </div>
                </div>

                <SheetFooter className="flex flex-row gap-3 sm:justify-end">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  {(poetFilters.cities.length > 0 || poetFilters.letters.length > 0) && (
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => {
                        setPoetFilters({ cities: [], letters: [] });
                        fetchPoets({
                          page: 1,
                          limit: 20,
                          search: poetSearchQuery,
                          reset: true,
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Filter badges */}
      {(poetFilters.cities.length > 0 || poetFilters.letters.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2 px-4 sm:px-0">
          {poetFilters.letters.map((letter) => (
            <Badge
              key={`letter-${letter}`}
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {letter}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 focus:ring-offset-2"
                onClick={() => {
                  const newLetters = poetFilters.letters.filter((l) => l !== letter);
                  setPoetFilters({ letters: newLetters });
                  fetchPoets({
                    page: 1,
                    limit: 20,
                    search: poetSearchQuery,
                    cities: poetFilters.cities,
                    letters: newLetters,
                    reset: true,
                  });
                }}
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

          {poetFilters.cities.map((city) => (
            <Badge
              key={`city-${city}`}
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {city}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 focus:ring-offset-2"
                onClick={() => {
                  const newCities = poetFilters.cities.filter((c) => c !== city);
                  setPoetFilters({ cities: newCities });
                  fetchPoets({
                    page: 1,
                    limit: 20,
                    search: poetSearchQuery,
                    cities: newCities,
                    letters: poetFilters.letters,
                    reset: true,
                  });
                }}
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
            className="h-7 px-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => {
              setPoetFilters({ cities: [], letters: [] });
              fetchPoets({
                page: 1,
                limit: 20,
                search: poetSearchQuery,
                reset: true,
              });
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results count for mobile */}
      {filteredPoets.length > 0 && (
        <div className="mb-4 px-4 sm:px-0 md:hidden">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{filteredPoets.length}</span>{" "}
            {filteredPoets.length === 1 ? "poet" : "poets"}
            {poetSearchQuery && (
              <span>
                {" "}
                for "<span className="font-medium">{poetSearchQuery}</span>"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Poets grid */}
      {renderContent()}
    </div>
  );
}
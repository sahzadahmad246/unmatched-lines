"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define color palette types
type ColorPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  darkBackground: string
  text: string
  darkText: string
}

// Define a wide range of color palettes (light to medium colors)
const colorPalettes: ColorPalette[] = [
  // Lavender Dream
  {
    primary: "from-violet-100 via-purple-100 to-fuchsia-100",
    secondary: "from-fuchsia-100 via-purple-100 to-violet-100",
    accent: "text-violet-600",
    background: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50",
    darkBackground: "dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900",
    text: "text-violet-700",
    darkText: "dark:text-violet-300",
  },
  // Ocean Breeze
  {
    primary: "from-blue-100 via-sky-100 to-cyan-100",
    secondary: "from-cyan-100 via-sky-100 to-blue-100",
    accent: "text-blue-600",
    background: "bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50",
    darkBackground: "dark:from-blue-900 dark:via-sky-900 dark:to-cyan-900",
    text: "text-blue-700",
    darkText: "dark:text-blue-300",
  },
  // Sunset Glow
  {
    primary: "from-amber-100 via-orange-100 to-rose-100",
    secondary: "from-rose-100 via-orange-100 to-amber-100",
    accent: "text-amber-600",
    background: "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50",
    darkBackground: "dark:from-amber-900 dark:via-orange-900 dark:to-rose-900",
    text: "text-amber-700",
    darkText: "dark:text-amber-300",
  },
  // Spring Garden
  {
    primary: "from-emerald-100 via-green-100 to-teal-100",
    secondary: "from-teal-100 via-green-100 to-emerald-100",
    accent: "text-emerald-600",
    background: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50",
    darkBackground: "dark:from-emerald-900 dark:via-green-900 dark:to-teal-900",
    text: "text-emerald-700",
    darkText: "dark:text-emerald-300",
  },
  // Berry Smoothie
  {
    primary: "from-pink-100 via-rose-100 to-red-100",
    secondary: "from-red-100 via-rose-100 to-pink-100",
    accent: "text-pink-600",
    background: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50",
    darkBackground: "dark:from-pink-900 dark:via-rose-900 dark:to-red-900",
    text: "text-pink-700",
    darkText: "dark:text-pink-300",
  },
  // Tropical Paradise
  {
    primary: "from-yellow-100 via-lime-100 to-green-100",
    secondary: "from-green-100 via-lime-100 to-yellow-100",
    accent: "text-lime-600",
    background: "bg-gradient-to-br from-yellow-50 via-lime-50 to-green-50",
    darkBackground: "dark:from-yellow-900 dark:via-lime-900 dark:to-green-900",
    text: "text-lime-700",
    darkText: "dark:text-lime-300",
  },
  // Cool Mint
  {
    primary: "from-cyan-100 via-teal-100 to-emerald-100",
    secondary: "from-emerald-100 via-teal-100 to-cyan-100",
    accent: "text-teal-600",
    background: "bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50",
    darkBackground: "dark:from-cyan-900 dark:via-teal-900 dark:to-emerald-900",
    text: "text-teal-700",
    darkText: "dark:text-teal-300",
  },
  // Soft Peach
  {
    primary: "from-orange-100 via-amber-100 to-yellow-100",
    secondary: "from-yellow-100 via-amber-100 to-orange-100",
    accent: "text-orange-600",
    background: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
    darkBackground: "dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900",
    text: "text-orange-700",
    darkText: "dark:text-orange-300",
  },
]

// Create context
type ColorContextType = {
  currentPalette: ColorPalette
  transitionStyle: React.CSSProperties
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

export function ColorTransitionProvider({ children }: { children: React.ReactNode }) {
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [currentPalette, setCurrentPalette] = useState(colorPalettes[0])
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({
    transition: "all 5s ease-in-out",
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (paletteIndex + 1) % colorPalettes.length
      setPaletteIndex(nextIndex)
      setCurrentPalette(colorPalettes[nextIndex])
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [paletteIndex])

  return <ColorContext.Provider value={{ currentPalette, transitionStyle }}>{children}</ColorContext.Provider>
}

export function useColorTransition() {
  const context = useContext(ColorContext)
  if (context === undefined) {
    throw new Error("useColorTransition must be used within a ColorTransitionProvider")
  }
  return context
}

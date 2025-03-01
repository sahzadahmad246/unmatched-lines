import type React from "react"
import { Providers } from "./providers"
import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "Next.js Auth Setup",
  description: "Next.js Auth with Google and MongoDB",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar /> 
          {children}
        </Providers>
      </body>
    </html>
  )
}

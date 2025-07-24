"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Navigation from "./Navigation"
import { AdminNavigation } from "./admin-navigation"
import { useEffect, useState } from 'react'; // Import useState and useEffect

interface ConditionalNavigationProps {
  children: React.ReactNode
}

export default function ConditionalNavigation({ children }: ConditionalNavigationProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false); // State to track if we're on the client

  useEffect(() => {
    setIsClient(true); // Set to true once the component mounts on the client
  }, []);

  // On the server, always render the default Navigation (or a loading state)
  // This ensures the server-rendered HTML is consistent.
  if (!isClient) {
    return <Navigation>{children}</Navigation>; // Or a simple loading spinner if preferred
  }

  // Once on the client, use the actual pathname
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminNavigation>{children}</AdminNavigation>;
  }

  return <Navigation>{children}</Navigation>;
}
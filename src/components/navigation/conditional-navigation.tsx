"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Navigation from "./Navigation"
import { AdminNavigation } from "./admin-navigation"
import { useEffect, useState } from 'react'

interface ConditionalNavigationProps {
  children: React.ReactNode
}

export default function ConditionalNavigation({ children }: ConditionalNavigationProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render the same structure on server and client
  // Use CSS to hide/show based on route
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div>
      <div className={mounted && isAdminRoute ? 'block' : 'hidden'}>
        <AdminNavigation>{children}</AdminNavigation>
      </div>
      <div className={mounted && !isAdminRoute ? 'block' : 'hidden'}>
        <Navigation>{children}</Navigation>
      </div>
      {!mounted && <Navigation>{children}</Navigation>}
    </div>
  );
}
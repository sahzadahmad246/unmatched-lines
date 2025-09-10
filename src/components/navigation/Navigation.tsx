// src/components/navigation/Navigation.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import MobileNav from "./MobileNav";
import DesktopNav from "./DesktopNav";
import { useIsMobile } from "@/hooks/use-mobile";


// Circular loader for desktop
const CircularLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface NavigationProps {
  children: ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false once isMobile is determined
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsLoading(false);
    }
  }, [isMobile]);

  if (isLoading) {
    return <CircularLoader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isMobile ? (
        <MobileNav>{children}</MobileNav>
      ) : (
        <DesktopNav>{children}</DesktopNav>
      )}
    </div>
  );
}
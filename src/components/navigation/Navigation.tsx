// src/components/navigation/Navigation.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import MobileNav from "./MobileNav";
import DesktopNav from "./DesktopNav";
import { useIsMobile } from "@/hooks/use-mobile";

// Mobile skeleton loader
const MobileSkeleton = () => (
  <div className="min-h-screen bg-background text-foreground">
    {/* Mobile Header */}
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
    </div>

    {/* Main Content */}
    <div className="p-4 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto animate-pulse" />
        <div className="w-48 h-8 bg-muted rounded mx-auto animate-pulse" />
        <div className="space-y-2">
          <div className="w-80 h-4 bg-muted rounded mx-auto animate-pulse" />
          <div className="w-72 h-4 bg-muted rounded mx-auto animate-pulse" />
          <div className="w-64 h-4 bg-muted rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Poetry Post Card */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
              <div className="w-20 h-3 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-4 bg-muted rounded animate-pulse" />
        </div>

        {/* Poetry Text */}
        <div className="space-y-2 py-4">
          <div className="w-full h-4 bg-muted rounded animate-pulse" />
          <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
        </div>

        {/* Image Placeholder */}
        <div className="w-full h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>

    {/* Bottom Navigation */}
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-1 p-2">
            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
            <div className="w-8 h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
  // Initial guess based on window width (no state needed)
  const initialIsMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : true;

  // Set loading to false once isMobile is determined
  useEffect(() => {
    if (isMobile !== undefined) {
      setIsLoading(false);
    }
  }, [isMobile]);

  if (isLoading) {
    return initialIsMobile ? <MobileSkeleton /> : <CircularLoader />;
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
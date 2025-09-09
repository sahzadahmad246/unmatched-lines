"use client";

import { useState, useEffect } from "react";
import { useExplore } from "@/contexts/ExploreContext";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyHeader({ children, className }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isExploreOpen } = useExplore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        className
      )}
      style={{
        right: isExploreOpen ? "420px" : "0",
        transition: "right 0.3s ease, transform 0.3s ease, opacity 0.3s ease"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {children}
      </div>
    </div>
  );
}

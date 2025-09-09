"use client";

import { useExplore } from "@/contexts/ExploreContext";
import { cn } from "@/lib/utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export default function ResponsiveWrapper({ children, className, maxWidth = "4xl" }: ResponsiveWrapperProps) {
  const { isExploreOpen } = useExplore();

  return (
    <div
      className={cn(
        "transition-all duration-300 mx-auto",
        `max-w-${maxWidth}`,
        isExploreOpen ? "mr-[420px]" : "mr-0",
        className
      )}
    >
      {children}
    </div>
  );
}

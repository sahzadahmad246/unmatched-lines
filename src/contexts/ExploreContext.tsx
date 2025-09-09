"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ExploreContextType {
  isExploreOpen: boolean;
  setIsExploreOpen: (open: boolean) => void;
  toggleExplore: () => void;
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const toggleExplore = () => {
    setIsExploreOpen(!isExploreOpen);
  };

  return (
    <ExploreContext.Provider value={{ isExploreOpen, setIsExploreOpen, toggleExplore }}>
      {children}
    </ExploreContext.Provider>
  );
}

export function useExplore() {
  const context = useContext(ExploreContext);
  if (context === undefined) {
    throw new Error("useExplore must be used within an ExploreProvider");
  }
  return context;
}

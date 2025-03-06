"use client";

import React, { createContext, useContext, useState } from "react";

type AdminContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

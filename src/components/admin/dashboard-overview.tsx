"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Users, FileText } from 'lucide-react';

export function DashboardOverview() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pt-20 border-red-500 ">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your poetry collection and authors from one place.
        </p>
      </motion.div>

      <motion.div 
        className="grid gap-6 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Add Poetry</CardTitle>
              <CardDescription>
                Add new poems, ghazals, and shers to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PenLine className="h-12 w-12 text-primary/80" />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/add-poem">Add New Poetry</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Add Author</CardTitle>
              <CardDescription>
                Manage authors for your poetry collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-12 w-12 text-primary/80" />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/add-author">Add New Author</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Manage Content</CardTitle>
              <CardDescription>
                Edit and organize your existing poetry collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileText className="h-12 w-12 text-primary/80" />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/manage-poems">Manage Poems</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
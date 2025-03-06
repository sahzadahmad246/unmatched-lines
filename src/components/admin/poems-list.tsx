"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Search } from 'lucide-react';
import Link from "next/link";

export default function PoemsList() {
  const [poems, setPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, poemId: "" });

  useEffect(() => {
    fetchPoems();
  }, []);

  const fetchPoems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/poem", { credentials: "include" });
      const data = await res.json();
      setPoems(data.poems || []);
    } catch (error) {
      console.error("Error fetching poems:", error);
      toast.error("Failed to load poems");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/poem/${deleteDialog.poemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        setPoems((prev) => prev.filter((p) => p._id !== deleteDialog.poemId));
        toast.success("Poem deleted successfully");
      } else {
        toast.error("Failed to delete poem");
      }
    } catch (error) {
      console.error("Error deleting poem:", error);
      toast.error("Failed to delete poem");
    } finally {
      setDeleteDialog({ open: false, poemId: "" });
    }
  };

  const filteredPoems = poems.filter(poem => 
    poem.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poem.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search poems or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link href="/admin/add-poem">Add New Poem</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPoems.length > 0 ? (
                      filteredPoems.map((poem, i) => (
                        <motion.tr
                          key={poem._id}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={item}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">{poem.title?.en || "Untitled"}</TableCell>
                          <TableCell>{poem.author?.name || "Unknown"}</TableCell>
                          <TableCell className="capitalize">{poem.category}</TableCell>
                          <TableCell>
                            <Badge variant={poem.status === "published" ? "default" : "outline"} className="capitalize">
                              {poem.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/poem/${poem.slug?.en || ''}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/admin/edit-poem/${poem._id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setDeleteDialog({ open: true, poemId: poem._id })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No poems found.
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poem and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

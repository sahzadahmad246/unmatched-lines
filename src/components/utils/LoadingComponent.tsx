"use client";

import { Feather } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingComponent() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        <Feather className="h-16 w-16 text-primary/60" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl sm:text-2xl font-bold mt-6 font-serif italic"
      >
        Loading poetic treasures...
      </motion.h2>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "250px" }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-4"
      />
    </div>
  );
}
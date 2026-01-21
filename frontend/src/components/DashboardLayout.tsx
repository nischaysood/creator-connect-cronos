"use client";

import { Sidebar } from "./Sidebar";

import { motion, AnimatePresence } from "framer-motion";

import { Suspense } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#05050a] to-[#05050a] text-[#f8fafc] selection:bg-primary/30 relative">
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
            <Suspense fallback={<div className="w-64 h-screen fixed left-0 top-0 bg-[#05050a] border-r border-white/5" />}>
                <Sidebar />
            </Suspense>
            <div className="pl-64 flex flex-col min-h-screen">
                <main className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

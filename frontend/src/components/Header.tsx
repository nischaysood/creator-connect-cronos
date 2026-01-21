"use client";

import { Search, Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
    return (
        <header className="h-20 border-b border-white/5 glass sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search campaigns, creators..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-white transition-all relative">
                        <Mail className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-white transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e293b]" />
                    </button>
                </div>
            </div>
        </header>
    );
}

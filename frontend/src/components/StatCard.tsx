"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    icon?: React.ReactNode;
    className?: string;
}

export function StatCard({ title, value, trend, icon, className }: StatCardProps) {
    return (
        <div className={cn(
            "p-6 rounded-3xl glass border border-white/5 relative overflow-hidden group hover:border-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300",
            className
        )}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                </button>
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
                <p className="text-3xl font-bold tracking-tight text-white mb-2">{value}</p>

                {trend && (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                            trend.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend.value}
                        </div>
                    </div>
                )}
            </div>

            {/* Background Decor */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
        </div>
    );
}

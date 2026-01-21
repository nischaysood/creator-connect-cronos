"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ExternalLink,
    ShieldCheck,
    ArrowUpRight,
    TrendingUp,
    MapPin,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandCardProps {
    brand: {
        id: string;
        name: string;
        logo: string;
        mission: string;
        location: string;
        website: string;
        activeCampaigns: number;
        verified: boolean;
        category: string;
    };
}

export function BrandCard({ brand }: BrandCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all hover:bg-white/[0.05] flex flex-col h-full"
        >
            {/* Glossy Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full group-hover:bg-purple-500/20 transition-colors pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 p-2 bg-black/40 group-hover:border-purple-500/30 transition-colors">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                        {brand.verified && (
                            <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1 border-2 border-[#05050a] shadow-lg">
                                <ShieldCheck className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {brand.category}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {brand.location}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        {brand.name}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {brand.mission}
                    </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Active Campaigns</span>
                        <span className="text-lg font-bold text-white flex items-center gap-2">
                            {brand.activeCampaigns}
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </span>
                    </div>
                    <a
                        href={`https://${brand.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Globe className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

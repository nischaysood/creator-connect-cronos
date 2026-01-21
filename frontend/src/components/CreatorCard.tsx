"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Instagram,
    Twitter,
    Youtube,
    Star,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    Check
} from "lucide-react";

interface CreatorCardProps {
    creator: {
        id: string;
        name: string;
        handle: string;
        niche: string[];
        platform: "Instagram" | "YouTube" | "TikTok" | "X";
        followers: string;
        engagement: string;
        aiScore: number;
        imageUrl?: string;
    };
    onInvite: () => void;
}

export function CreatorCard({ creator, onInvite }: CreatorCardProps) {

    // Platform Icon Logic
    const PlatformIcon = {
        "Instagram": Instagram,
        "YouTube": Youtube,
        "TikTok": Zap, // Using Zap as placeholder for TikTok
        "X": Twitter
    }[creator.platform] || Instagram;

    // Platform Color Logic
    const platformColor = {
        "Instagram": "from-pink-500 to-purple-500",
        "YouTube": "from-red-500 to-red-600",
        "TikTok": "from-black to-gray-800 border-gray-700",
        "X": "from-blue-400 to-blue-600"
    }[creator.platform] || "from-indigo-500 to-purple-600";

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative h-[350px] w-full rounded-[24px] p-[1px] bg-gradient-to-b from-white/10 to-white/0 hover:from-purple-500/50 hover:to-indigo-500/50 transition-all duration-300"
        >
            {/* Inner Card Background */}
            <div className="absolute inset-[1px] rounded-[23px] bg-[#0A0A12]/90 backdrop-blur-xl z-0" />

            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-all duration-500 z-0" />

            {/* Content Container */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">

                {/* Header: Avatar, Platform, Score */}
                <div className="flex justify-between items-start">
                    {/* Avatar Group */}
                    <div className="relative">
                        <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${platformColor} shadow-lg shadow-purple-500/10`}>
                            <div className="w-16 h-16 rounded-[14px] bg-[#0B0B15] overflow-hidden relative">
                                {creator.imageUrl ? (
                                    <div className="w-full h-full bg-cover bg-center duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${creator.imageUrl})` }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-white/5">
                                        {creator.name.substring(0, 1)}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Platform Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#0A0A12] border border-white/10 p-1 rounded-full shadow-lg">
                            <div className={`p-1.5 rounded-full bg-gradient-to-br ${platformColor} text-white`}>
                                <PlatformIcon size={12} fill="currentColor" className="drop-shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-bold tracking-tight">{creator.aiScore} AI Score</span>
                        </div>
                    </div>
                </div>

                {/* Identity Section */}
                <div className="mt-4">
                    <h3 className="text-xl font-bold text-white leading-tight font-heading group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
                        {creator.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <span>@{creator.handle}</span>
                        {creator.aiScore > 90 && (
                            <Check size={12} className="text-blue-400 ml-0.5" strokeWidth={3} />
                        )}
                    </div>
                </div>

                {/* Metrics Grid - Glass Cards */}
                <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-[72px]">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            <Users size={12} className="text-purple-400" /> Followers
                        </div>
                        <div className="text-xl font-bold text-white font-heading">{creator.followers}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-[72px]">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            <TrendingUp size={12} className="text-pink-400" /> Engagement
                        </div>
                        <div className="text-xl font-bold text-white font-heading">{creator.engagement}</div>
                    </div>
                </div>

                {/* Footer: Tags & Invite CTA */}
                <div className="flex items-center justify-between gap-3 mt-auto">
                    <div className="flex gap-1.5 flex-wrap">
                        {creator.niche.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-medium text-gray-300 group-hover:border-white/10 transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onInvite();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all duration-200 border border-white/10"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

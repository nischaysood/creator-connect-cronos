"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Instagram,
    Twitter,
    Youtube,
    Clock,
    Users,
    Play,
    ShieldCheck,
    FileVideo,
    Mic2,
    Zap,
    ArrowRight,
    ExternalLink
} from "lucide-react";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
import SubmitWorkModal from "./SubmitWorkModal";
import { calculateMatchScore, getMatchColor } from "@/lib/matchingEngine";

interface CampaignCardProps {
    id: number;
    campaign: any;
    role: "brand" | "creator";
    isEnrolled?: boolean;
    onJoin: () => void;
    onSubmit: () => void;
}

export function CampaignCard({ id, campaign, role, isEnrolled, onJoin, onSubmit }: CampaignCardProps) {
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Destructure contract data
    const detailsRaw = campaign[2];
    const reward = campaign[3];
    const maxCreators = Number(campaign[4]);
    const deadline = Number(campaign[9]);
    const isExpired = deadline > 0 && Date.now() / 1000 > deadline;

    // Parse metadata
    let meta = {
        name: "Campaign #" + id,
        desc: "Create content for this brand.",
        platform: "Instagram",
        type: "Reel",
        tags: [] as string[]
    };

    try {
        const parsed = JSON.parse(detailsRaw);
        if (parsed.name) meta = parsed;
    } catch (e) {
        meta.name = detailsRaw || `Campaign #${id}`;
        meta.desc = detailsRaw;
    }

    const PlatformIcon = {
        "Instagram": Instagram,
        "X (Twitter)": Twitter,
        "YouTube Shorts": Youtube,
        "TikTok": Play
    }[meta.platform] || Instagram;

    const accentClass = role === 'creator' ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-indigo-600';
    const accentText = role === 'creator' ? 'text-cyan-400' : 'text-purple-400';
    const accentBg = role === 'creator' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400';
    const accentBorder = role === 'creator' ? 'border-cyan-500/30' : 'border-purple-500/30';
    const accentGlow = role === 'creator' ? 'shadow-cyan-500/20' : 'shadow-purple-500/20';
    const accentBtn = role === 'creator' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-purple-600 hover:bg-purple-500';

    const daysLeft = deadline > 0 ? Math.max(0, Math.ceil((deadline - Date.now() / 1000) / 86400)) : 0;

    return (
        <>
            <motion.div
                className={cn(
                    "relative w-full rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden",
                    isHovered ? cn("border-opacity-100 shadow-2xl", accentBorder, accentGlow) : "border-white/10 shadow-lg"
                )}
                style={{ minHeight: "380px" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                {/* Ambient Glow Effect */}
                <motion.div
                    className={cn(
                        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-500",
                        role === 'creator' ? 'bg-cyan-500/30' : 'bg-purple-500/30'
                    )}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                />
                <motion.div
                    className={cn(
                        "absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-500",
                        role === 'creator' ? 'bg-blue-500/20' : 'bg-indigo-500/20'
                    )}
                    animate={{ opacity: isHovered ? 0.8 : 0 }}
                />

                {/* Header */}
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br", accentClass)}
                                whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                            >
                                {meta.name.substring(0, 1).toUpperCase()}
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{meta.name}</h3>
                                <p className="text-xs text-gray-400">by Brand {campaign[1].toString().substring(0, 6)}...</p>
                            </div>
                        </div>
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur-sm",
                            isExpired
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", isExpired ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                            {isExpired ? "Ended" : "Active"}
                        </div>
                    </div>

                    {/* AI Match Score (Creator only) */}
                    {role === 'creator' && (
                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm",
                                getMatchColor(calculateMatchScore(campaign, []))
                            )}>
                                <Zap className="w-3.5 h-3.5" />
                                {calculateMatchScore(campaign, [])}% Match
                            </div>
                        </motion.div>
                    )}

                    {/* Reward */}
                    <div className="mb-4">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Reward per Creator</div>
                        <div className="text-3xl font-bold text-white font-outfit tracking-tight">
                            {formatEther(reward)} <span className={cn("text-lg", accentText)}>MNEE</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="relative z-10 grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                            <PlatformIcon className="w-3 h-3 text-pink-400" />
                            Platform
                        </div>
                        <div className="text-xs text-white font-medium">{meta.platform}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                            <Users className="w-3 h-3 text-green-400" />
                            Spots
                        </div>
                        <div className="text-xs text-white font-medium">{maxCreators} max</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            Time
                        </div>
                        <div className="text-xs text-white font-medium">{isExpired ? "Ended" : `${daysLeft}d left`}</div>
                    </div>
                </div>

                {/* Tags */}
                <div className="relative z-10 flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-medium border border-white/5">
                        <ShieldCheck className="w-3 h-3 inline mr-1 text-blue-400" />AI Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-medium border border-white/5">
                        <FileVideo className="w-3 h-3 inline mr-1 text-purple-400" />{meta.type}
                    </span>
                </div>

                {/* CTA */}
                <div className="relative z-10 flex flex-col gap-2">
                    {role === 'creator' ? (
                        <>
                            <motion.button
                                disabled={isEnrolled || isExpired}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJoin();
                                }}
                                className={cn(
                                    "w-full py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2",
                                    (isEnrolled || isExpired)
                                        ? "bg-slate-700/50 cursor-not-allowed opacity-50"
                                        : cn(accentBtn, "shadow-lg", isHovered && accentGlow)
                                )}
                                whileHover={!isEnrolled && !isExpired ? { scale: 1.02 } : {}}
                                whileTap={!isEnrolled && !isExpired ? { scale: 0.98 } : {}}
                            >
                                {isEnrolled ? "Already Applied" : isExpired ? "Deadline Passed" : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        Apply Now
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                            {isEnrolled && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSubmitModalOpen(true);
                                    }}
                                    className="w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Submit Work
                                </button>
                            )}
                        </>
                    ) : (
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                onJoin();
                            }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Manage Campaign
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {isSubmitModalOpen && (
                <SubmitWorkModal
                    isOpen={isSubmitModalOpen}
                    onClose={() => setIsSubmitModalOpen(false)}
                    campaignId={BigInt(id)}
                    campaignTitle={meta.name}
                />
            )}
        </>
    );
}

// Keep the old name as an alias for backwards compatibility
export { CampaignCard as CampaignFlipCard };

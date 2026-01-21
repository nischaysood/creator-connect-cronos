"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Star, Award, ExternalLink, Share2, Instagram, Youtube } from "lucide-react";

export default function CreatorProfile() {
    const params = useParams();
    const address = params.address as string;

    // Mock Data for "Premium" Feel
    const reputationScore = 98;
    const completedCampaigns = 14;
    const totalEarned = "4,250 MNEE";

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#05050a] to-[#05050a] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-colors text-xs font-bold">
                        <Share2 className="w-3 h-3" />
                        Share Profile
                    </button>
                </div>

                {/* Profile Card */}
                <div className="p-1 glass-panel rounded-[2.5rem] relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />

                    <div className="bg-[#0a0a0f]/80 backdrop-blur-xl rounded-[2.4rem] p-10 border border-white/5 relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                                    <div className="w-full h-full rounded-[1.3rem] overflow-hidden bg-black flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white/20">IMG</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 p-2 bg-[#05050a] rounded-xl border border-white/10 shadow-xl">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold font-heading">
                                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Creator Profile"}
                                        </h1>
                                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                            Verified Pro
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground max-w-lg">
                                        Digital content creator specializing in Tech Reviews and Web3 Education.
                                        Verified by Creator Connect Neural Agents.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <Instagram className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 min-w-[200px]">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        Score
                                    </div>
                                    <span className="text-xl font-bold text-white">{reputationScore}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Award className="w-4 h-4 text-purple-400" />
                                        Completed
                                    </div>
                                    <span className="text-xl font-bold text-white">{completedCampaigns}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio / History */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Verified Campaign History
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group p-6 rounded-3xl glass border border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                            #{220 + i}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Tech Unboxing Series</h3>
                                            <p className="text-xs text-muted-foreground">Brand: TechCorp Inc.</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <span className="text-xs text-muted-foreground">Payout</span>
                                    <span className="text-sm font-bold text-primary">500 MNEE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

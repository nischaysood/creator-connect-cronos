"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CreatorCard } from "@/components/CreatorCard";
import { Search, Filter, Loader2 } from "lucide-react";
import { useReadContract, useReadContracts } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/constants";

export default function CreatorsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: profileAddresses } = useReadContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "getAllProfileAddresses",
    });

    const { data: profilesData, isLoading } = useReadContracts({
        contracts: (profileAddresses || []).map((addr) => ({
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: "profiles",
            args: [addr],
        }))
    });

    const creators = (profilesData || [])
        .map(res => res.result)
        .filter((p: any) => p && (p.exists || p[5]) && (p.role === "creator" || p[4] === "creator"))
        .map((p: any) => {
            const name = p.name || p[1];
            const bio = p.bio || p[2];
            const avatar = p.avatar || p[3];
            const wallet = p.wallet || p[0];

            return {
                id: wallet,
                name: name || "Unknown Creator",
                handle: name ? name.toLowerCase().replace(/\s+/g, '_') : 'user',
                avatar: avatar,
                category: bio || "General",
                verified: p.role === "creator" || p[4] === "creator", // Check role for verification
                // Remove hardcoded engagement data to avoid misleading "demo" look. 
                // Alternatively, can set to null or 0.
                followers: "0",
                engagement: "0%",
                aiScore: 0,
                niche: bio ? [bio] : [],
                platform: "YouTube" as const, // Default platform
                imageUrl: avatar
            };
        });

    const handleInvite = (name: string) => {
        alert(`Invitation sent to ${name}!`);
    };

    if (!mounted) return null;

    const filteredCreators = creators.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Discover Creators</h1>
                        <p className="text-gray-400">Find and collaborate with AI-verified talent for your campaigns.</p>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search creators..."
                                className="pl-9 pr-4 py-2.5 rounded-xl bg-[#0B0B15] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50 w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 rounded-xl bg-[#0B0B15] border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Creators Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCreators.map((creator) => (
                            <CreatorCard
                                key={creator.id}
                                creator={creator}
                                onInvite={() => handleInvite(creator.name)}
                            />
                        ))}

                        {filteredCreators.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold">No creators found yet.</p>
                                <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest font-bold">Be the first to join!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

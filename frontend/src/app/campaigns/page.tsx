"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignFlipCard } from "@/components/CampaignFlipCard";
import { CampaignManager } from "@/components/CampaignManager";
import { CreateCampaignWizard } from "@/components/CreateCampaignWizard";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import {
    useReadContract,
    useReadContracts,
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt
} from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/constants";

// Extract main logic to a separate component
function CampaignsContent() {
    const { address } = useAccount();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const [role, setRole] = useState<"brand" | "creator">("brand");
    const [searchTerm, setSearchTerm] = useState("");
    const [mounted, setMounted] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
        const savedRole = localStorage.getItem("user-role") as "brand" | "creator" | null;
        const queryRole = searchParams.get('role') as "brand" | "creator" | null;
        if (queryRole) setRole(queryRole);
        else if (savedRole) setRole(savedRole);
    }, [searchParams]);

    const { writeContract, data: hash } = useWriteContract();

    // 1. Get total number of campaigns
    const { data: campaignCount, refetch: refetchCount } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "nextCampaignId",
        query: {
            refetchInterval: 2000,
        }
    });

    const numCampaigns = Number(campaignCount || 0);

    // 2. Fetch ALL campaigns
    const { data: campaignsData, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useReadContracts({
        contracts: Array.from({ length: numCampaigns }, (_, i) => ({
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: "campaigns",
            args: [BigInt(i)],
        })),
        query: {
            refetchInterval: 2000,
        }
    });

    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchCount();
            refetchCampaigns();
        }
    }, [isConfirmed, refetchCount, refetchCampaigns]);

    // Process Campaigns safely
    const allCampaigns = (campaignsData || []).map((res) => {
        if (res.result) return res.result;
        return null;
    }).filter((c): c is any => c !== null);

    // Filter Logic
    const filteredCampaigns = allCampaigns.slice().reverse().filter((c: any) => {
        // c is the contract tuple
        // [id, brand, details, reward, max, dep, paid, active, created]
        if (!c || !c[2]) return false;

        try {
            const meta = JSON.parse(c[2]);
            const searchLower = searchTerm.toLowerCase();
            return (meta.name || "").toLowerCase().includes(searchLower) ||
                (meta.desc || "").toLowerCase().includes(searchLower);
        } catch (e) {
            return String(c[2]).toLowerCase().includes(searchTerm.toLowerCase());
        }
    });

    const handleJoin = (id: number) => {
        if (role === 'brand') {
            const campaign = campaignsData?.[id]?.result;
            if (campaign) setSelectedCampaign(campaign);
        } else {
            writeContract({
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "enroll",
                args: [BigInt(id)],
            });
        }
    };

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <div className="space-y-8 relative">

                {/* WIZARD MODAL */}
                {isWizardOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsWizardOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 h-[90vh] overflow-y-auto">
                            <CreateCampaignWizard onSuccess={() => {
                                setIsWizardOpen(false);
                                refetchCount();
                                refetchCampaigns();
                                alert("Campaign Launched Successfully!");
                            }} />
                            <button
                                onClick={() => setIsWizardOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* CAMPAIGN MANAGER MODAL */}
                {selectedCampaign && (
                    <CampaignManager
                        id={Number(selectedCampaign[0])}
                        campaign={selectedCampaign}
                        onClose={() => setSelectedCampaign(null)}
                    />
                )}

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
                        <p className="text-gray-400 mt-1">Manage, track, and optimize your marketing efforts.</p>
                    </div>
                    <div className="flex gap-4">
                        {role === 'brand' && (
                            <button
                                onClick={() => setIsWizardOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                            >
                                <Plus className="w-4 h-4" />
                                New Campaign
                            </button>
                        )}
                    </div>
                </div>

                {/* FILTERS & SEARCH */}
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search campaigns..."
                            className="w-full bg-transparent border-none text-white focus:outline-none pl-10 py-2"
                        />
                    </div>
                </div>

                {/* CAMPAIGN GRID */}
                {isLoadingCampaigns ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map((c: any) => (
                            <CampaignFlipCard
                                key={Number(c[0])}
                                id={Number(c[0])}
                                campaign={c}
                                role={role}
                                onJoin={() => handleJoin(Number(c[0]))}
                                onSubmit={() => { }}
                            />
                        ))}

                        {/* Empty Slot Placeholder - Only for Brands */}
                        {role === 'brand' && (
                            <button
                                onClick={() => setIsWizardOpen(true)}
                                className="group h-[340px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-white/5 transition-all min-h-[300px]"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-purple-400" />
                                </div>
                                <span className="font-bold text-gray-500 group-hover:text-white">Create New Campaign</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

import { Suspense } from "react";

export default function CampaignsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <CampaignsContent />
        </Suspense>
    );
}

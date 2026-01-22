"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSearchParams } from "next/navigation";
import { CreateCampaignWizard } from "@/components/CreateCampaignWizard";
import { CampaignFlipCard } from "@/components/CampaignFlipCard";
import { CampaignManager } from "@/components/CampaignManager";
import { StatCard } from "@/components/StatCard";
import { OnboardingModal } from "@/components/OnboardingModal";
import {
    Users,
    Target,
    Wallet,
    Zap,
    Plus,
    CheckCircle2,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useReadContracts,
    useWaitForTransactionReceipt,
    useWatchContractEvent,
} from "wagmi";
import { formatUnits } from "viem";
import { ESCROW_ADDRESS, ESCROW_ABI, USDC_ADDRESS, USDC_ABI, USDC_DECIMALS } from "@/constants";
import { CreatorEnrollments } from "@/components/CreatorEnrollments";

function DashboardContent() {
    const { address, isConnected } = useAccount();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') as "brand" | "creator" | null;

    const [role, setRole] = useState<"brand" | "creator" | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const savedRole = localStorage.getItem("user-role") as "brand" | "creator" | null;
        if (initialRole) {
            setRole(initialRole);
            localStorage.setItem("user-role", initialRole);
            setIsRoleModalOpen(false);
        } else if (savedRole) {
            setRole(savedRole);
            setIsRoleModalOpen(false);
        } else {
            setIsRoleModalOpen(true);
        }
    }, [initialRole]);

    const handleRoleChange = (newRole: "brand" | "creator") => {
        setRole(newRole);
        localStorage.setItem("user-role", newRole);
        setIsRoleModalOpen(false);
        // Ensure enrollments are fetched for the new role if needed
        refetchEnrollments();
    };

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

    // Profile Check
    const { data: userProfile, refetch: refetchProfile, isRefetching } = useReadContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "profiles",
        args: [address!],
        query: { enabled: !!address }
    });

    const hasProfile = userProfile && ((userProfile as any).exists || (userProfile as any)[5]);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (mounted && !isRefetching) {
            if (!isConnected) {
                // Force onboarding check if role is selected to prompt registration
                setShowOnboarding(true);
            } else if (userProfile !== undefined) {
                setShowOnboarding(!hasProfile);
            }
        }
    }, [mounted, isConnected, userProfile, hasProfile, isRefetching]);

    const { writeContract, data: hash } = useWriteContract();

    // 1. Get total number of campaigns
    const { data: campaignCount, refetch: refetchCount } = useReadContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "nextCampaignId",
    });

    const numCampaigns = Number(campaignCount || 0);

    // 2. Fetch ALL campaigns
    const { data: campaignsData, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useReadContracts({
        contracts: Array.from({ length: numCampaigns }, (_, i) => ({
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: "campaigns",
            args: [BigInt(i)],
        }))
    });

    // 3. User Balance
    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address!],
        query: { enabled: !!address }
    });

    // 4. Fetch Enrollments for ALL campaigns to find User's participation
    const { data: allEnrollments, refetch: refetchEnrollments } = useReadContracts({
        contracts: Array.from({ length: numCampaigns }, (_, i) => ({
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: "getCampaignEnrollments",
            args: [BigInt(i)],
        })),
        query: { enabled: numCampaigns > 0 }
    });

    // Process Enrollments
    const userEnrollments = React.useMemo(() => {
        if (!allEnrollments || !campaignsData || !address) return [];

        const myJobs: any[] = [];
        allEnrollments.forEach((res: any, index: number) => {
            if (res.result) {
                const campaignEntry = campaignsData[index]?.result as any[];
                const enrollment = res.result.find((e: any) => e.creator.toLowerCase() === address.toLowerCase());
                if (enrollment && campaignEntry) {
                    myJobs.push({
                        campaign: {
                            id: index,
                            details: campaignEntry[2],
                            rewardPerCreator: campaignEntry[3],
                        },
                        enrollment
                    });
                }
            }
        });
        return myJobs;
    }, [allEnrollments, campaignsData, address]);

    const totalEarned = userEnrollments.reduce((acc, job) =>
        job.enrollment.isPaid ? acc + BigInt(job.campaign.rewardPerCreator) : acc, BigInt(0)
    );

    const potentialEarnings = userEnrollments.reduce((acc, job) =>
        !job.enrollment.isPaid ? acc + BigInt(job.campaign.rewardPerCreator) : acc, BigInt(0)
    );

    const activeJobsCount = userEnrollments.filter(j => !j.enrollment.isPaid).length;

    // Handle Transactions & Events
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Watch for Campaign Creation (Global Sync)
    useWatchContractEvent({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        eventName: 'CampaignCreated',
        onLogs(logs) {
            console.log('Campaign Created Event detected!', logs);
            refetchCount();
            refetchCampaigns();
            refetchBalance();
        },
    });

    useEffect(() => {
        if (isConfirmed) {
            refetchCount();
            refetchCampaigns();
            refetchEnrollments();
        }
    }, [isConfirmed, refetchCount, refetchCampaigns, refetchEnrollments]);

    const handleJoin = (id: number) => {
        if (role === 'brand') {
            const campaign = campaignsData?.[id]?.result;
            if (campaign) setSelectedCampaign(campaign);
        } else {
            writeContract({
                address: ESCROW_ADDRESS as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: "enroll",
                args: [BigInt(id)],
            });
        }
    };

    const handleSubmit = () => { };

    // Filter valid campaigns
    const activeCampaigns = React.useMemo(() => {
        if (!campaignsData) return [];
        return campaignsData
            .map((res: any, idx: number) => {
                if (res?.result) {
                    const campaign = [...res.result];
                    campaign[0] = BigInt(idx);
                    return campaign;
                }
                // Log missing result if index < count
                if (process.env.NODE_ENV === 'development') console.log(`Campaign ${idx} data missing:`, res);
                return null;
            })
            .filter((c: any) => {
                if (c === null) return false;
                // For Creators: Only show ACTIVE campaigns (Index 7 is isActive)
                if (role === 'creator' && !c[7]) return false;
                return true;
            })
            .reverse();
    }, [campaignsData]);

    const isLoading = isLoadingCampaigns || (numCampaigns > 0 && !campaignsData);

    if (!role && !isRoleModalOpen) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 relative">
                {/* ONBOARDING MODAL */}
                {showOnboarding && role && (
                    <OnboardingModal
                        role={role}
                        onSuccess={() => {
                            setShowOnboarding(false);
                            refetchProfile();
                        }}
                    />
                )}
                {/* ROLE SELECTION OVERLAY */}
                {isRoleModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                        <div className="relative z-10 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center mb-12">
                                <h2 className="text-sm font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">Onboarding</h2>
                                <h1 className="text-5xl font-bold font-outfit text-white">Choose Your Profile</h1>
                                <p className="text-gray-400 mt-4 text-lg">Select how you want to interact with the CreatorConnect protocol.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button
                                    onClick={() => handleRoleChange("brand")}
                                    className="group p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/[0.05] text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-8 border border-purple-500/30">
                                            <Target className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">I'm a Brand</h3>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            I want to launch campaigns, manage content budgets, and verify marketing performance.
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRoleChange("creator")}
                                    className="group p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-cyan-500/50 transition-all hover:bg-white/[0.05] text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-8 border border-cyan-500/30">
                                            <Users className="w-8 h-8 text-cyan-400" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">I'm a Creator</h3>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            I want to discover brand deals, submit my content, and receive instant stablecoin payouts.
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* WIZARD MODAL */}
                {isWizardOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsWizardOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 h-[90vh] overflow-y-auto">
                            <CreateCampaignWizard onSuccess={async () => {
                                setIsWizardOpen(false);
                                console.log("Wizard success. Refetching...");
                                await refetchCount();
                                // We don't await refetchCampaigns because the count update will trigger a new fetch cycle anyway
                                alert("Campaign Launched Successfully! Dashboard will update shortly.");
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
                        onRefetch={() => {
                            refetchCampaigns();
                            refetchBalance();
                        }}
                    />
                )}

                {/* Role Switcher & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white capitalize">{role} Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Connected as <span className="text-primary font-medium">{role === 'brand' ? 'Advertiser' : 'Content Creator'}</span>
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {role === 'brand' ? (
                        <>
                            <StatCard
                                title="Active Campaigns"
                                value={numCampaigns.toString()}
                                trend={{ value: "+2", isUp: true }}
                                icon={<Target className="w-5 h-5 text-purple-500" />}
                            />
                            <StatCard
                                title="Total Creators"
                                value="12"
                                trend={{ value: "+8%", isUp: true }}
                                icon={<Users className="w-5 h-5 text-purple-500" />}
                            />
                            <StatCard
                                title="Wallet Balance"
                                value={`${usdcBalance ? Number(formatUnits(usdcBalance as bigint, USDC_DECIMALS)).toFixed(2) : '0.00'} USDC`}
                                icon={<Wallet className="w-5 h-5 text-purple-500" />}
                            />
                            <StatCard
                                title="AI Verifications"
                                value="24"
                                trend={{ value: "+15%", isUp: true }}
                                icon={<Zap className="w-5 h-5 text-purple-500" />}
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Earned"
                                value={`${Number(formatUnits(totalEarned, USDC_DECIMALS)).toFixed(2)} USDC`}
                                trend={{ value: "Lifetime", isUp: true }}
                                icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                            />
                            <StatCard
                                title="Active Jobs"
                                value={activeJobsCount.toString()}
                                trend={{ value: "In Progress", isUp: true }}
                                icon={<Target className="w-5 h-5 text-cyan-400" />}
                            />
                            <StatCard
                                title="Wallet Balance"
                                value={`${usdcBalance ? Number(formatUnits(usdcBalance as bigint, USDC_DECIMALS)).toFixed(2) : '0.00'} USDC`}
                                trend={{ value: "Available", isUp: true }}
                                icon={<Wallet className="w-5 h-5 text-cyan-400" />}
                            />
                            <StatCard
                                title="Success Rate"
                                value="100%"
                                trend={{ value: "Perfect", isUp: true }}
                                icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            />
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col gap-12">
                    {/* MY ENROLLMENTS (Creator Only) */}
                    {role === 'creator' && userEnrollments.length > 0 && (
                        <CreatorEnrollments
                            enrollments={userEnrollments}
                            onRefetch={() => {
                                refetchCampaigns();
                                refetchEnrollments();
                            }}
                        />
                    )}

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Target className={cn("w-5 h-5", role === 'brand' ? "text-purple-500" : "text-cyan-400")} />
                                {role === 'brand' ? 'Your Campaigns' : 'Discover New Opportunities'}
                            </h2>
                            {role === 'brand' && (
                                <button
                                    onClick={() => setIsWizardOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Campaign
                                </button>
                            )}
                            <button
                                onClick={() => { refetchCount(); refetchCampaigns(); refetchBalance(); }}
                                className="p-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                                title="Refresh Data"
                            >
                                <TrendingUp className="w-4 h-4" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                                <p>Loading Campaigns...</p>
                            </div>
                        ) : activeCampaigns.length === 0 ? (
                            <div className="p-12 glass border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Target className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No Active Campaigns</h3>
                                <p className="text-gray-400 max-w-sm mb-6">
                                    {role === 'brand' ? "Launch your first campaign to start attracting creators." : "Check back later for new opportunities."}
                                </p>
                                {role === 'brand' && (
                                    <button onClick={() => setIsWizardOpen(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold">Create Campaign</button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeCampaigns.map((campaign: any) => {
                                    const cId = Number(campaign[0]);
                                    const isEnrolled = userEnrollments.some(job => Number(job.campaign.id) === cId);
                                    return (
                                        <CampaignFlipCard
                                            key={cId}
                                            id={cId}
                                            campaign={campaign}
                                            role={role as "brand" | "creator"}
                                            isEnrolled={isEnrolled}
                                            onJoin={() => handleJoin(cId)}
                                            onSubmit={() => handleSubmit()}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function Dashboard() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        }>
            <DashboardContent />
        </React.Suspense>
    );
}

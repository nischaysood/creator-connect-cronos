"use client";

import React from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
    ExternalLink,
    Wallet,
    Loader2
} from "lucide-react";
import { formatEther, formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { USDC_DECIMALS } from "@/constants";
import SubmitWorkModal from "./SubmitWorkModal";

interface CreatorEnrollmentsProps {
    enrollments: any[]; // Array of { campaign, enrollmentData }
    onRefetch: () => void;
}

export function CreatorEnrollments({ enrollments, onRefetch }: CreatorEnrollmentsProps) {
    const [selectedCampaign, setSelectedCampaign] = React.useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    My Active Campaigns
                </h3>
                <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {enrollments.length} Campaigns Enrolled
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {enrollments.length === 0 ? (
                    <div className="min-w-[300px] p-8 rounded-2xl border border-dashed border-white/10 flex flex-col items-center text-center space-y-3">
                        <Wallet className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400 text-sm">No campaigns joined yet.</p>
                    </div>
                ) : (
                    enrollments.map((item, idx) => {
                        const { campaign, enrollment } = item;
                        let meta = { name: "Campaign #" + campaign.id, desc: "" };
                        try { const parsed = JSON.parse(campaign.details); if (parsed.name) meta = { ...meta, ...parsed }; } catch { }

                        const isPaid = enrollment.isPaid;
                        const isVerified = enrollment.isVerified;
                        const hasSubmitted = enrollment.submissionUrl && enrollment.submissionUrl.length > 0;
                        const isRejected = enrollment.isRejected;

                        return (
                            <div
                                key={idx}
                                className="min-w-[280px] max-w-[320px] group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex-shrink-0"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                                        {meta.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{meta.name}</h4>
                                        <span className="text-cyan-400 font-bold text-xs">{formatUnits(campaign.rewardPerCreator, USDC_DECIMALS)} USDC</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Status</span>
                                        <div className="mt-1">
                                            {isPaid ? (
                                                <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            ) : isRejected ? (
                                                <span className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                                                    <XCircle className="w-3 h-3" /> Rejected
                                                </span>
                                            ) : isVerified ? (
                                                <span className="flex items-center gap-1 text-blue-400 font-bold text-xs bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                </span>
                                            ) : hasSubmitted ? (
                                                <span className="flex items-center gap-1 text-yellow-400 font-bold text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                                                    <Clock className="w-3 h-3" /> Review
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400 font-bold text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                    Joined
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!isPaid && (
                                        <button
                                            onClick={() => setSelectedCampaign(campaign)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1",
                                                (hasSubmitted && !isRejected)
                                                    ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                                    : "bg-cyan-600 text-white hover:bg-cyan-500" // Primary color for Retry/Submit
                                            )}
                                        >
                                            {isRejected ? "Retry" : hasSubmitted ? "Update" : "Submit"}
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedCampaign && (
                <SubmitWorkModal
                    isOpen={!!selectedCampaign}
                    onClose={() => {
                        setSelectedCampaign(null);
                        onRefetch();
                    }}
                    campaignId={BigInt(selectedCampaign.id)}
                    campaignTitle={selectedCampaign.details ? JSON.parse(selectedCampaign.details).name : "Campaign"}
                />
            )}
        </div>
    );
}

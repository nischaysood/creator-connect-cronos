"use client";

import React, { useState } from "react";
import {
    X,
    Users,
    Zap,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Loader2
} from "lucide-react";
import { EscrowProgress } from "./EscrowProgress";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/constants";

interface CampaignManagerProps {
    id: number;
    campaign: any;
    onClose: () => void;
    onRefetch?: () => void;
}

// Component to show submission history for a specific campaign
function CampaignSubmissionHistory({ campaignId }: { campaignId: number }) {
    const [submissions, setSubmissions] = React.useState<any[]>([]);

    React.useEffect(() => {
        try {
            const allHistory = JSON.parse(localStorage.getItem('submission-history') || '[]');
            const campaignSubs = allHistory.filter((s: any) => s.campaignId === campaignId);
            setSubmissions(campaignSubs);
        } catch { }
    }, [campaignId]);

    if (submissions.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-500 opacity-50" />
                <p className="text-gray-400 text-sm">No AI verifications yet for this campaign.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {submissions.map((sub, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${sub.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {sub.verified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-mono text-white text-sm">{sub.creatorAddress?.slice(0, 8)}...{sub.creatorAddress?.slice(-6)}</div>
                                <div className="text-xs text-gray-500">{new Date(sub.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xl font-bold ${sub.score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {sub.score}%
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase">Match</div>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">URL:</span>
                            <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline truncate">
                                {sub.url}
                            </a>
                        </div>
                        <div className="text-xs text-gray-400">{sub.reason}</div>

                        {sub.matchedRequirements?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {sub.matchedRequirements.map((req: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px]">
                                        ✓ {req}
                                    </span>
                                ))}
                            </div>
                        )}
                        {sub.missedRequirements?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {sub.missedRequirements.map((req: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[10px]">
                                        ✗ {req}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[10px] text-gray-500">
                        <span>{sub.platform} • {sub.contentType}</span>
                        <span className={sub.verified ? 'text-emerald-400' : 'text-red-400'}>
                            {sub.verified ? '💰 Paid' : '❌ Rejected'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CampaignManager({ id, campaign, onClose, onRefetch }: CampaignManagerProps) {
    const [activeTab, setActiveTab] = useState<"submissions" | "analytics" | "settings">("submissions");
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    // Fetch Enrollments
    const { data: enrollments, refetch } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "getCampaignEnrollments",
        args: [BigInt(id)],
        query: {
            refetchInterval: 2000,
        }
    });

    // Fetch Campaign Details
    const { data: campaignDataRaw } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "campaigns",
        args: [BigInt(id)],
        query: { refetchInterval: 2000 }
    });
    const campaignData = campaignDataRaw as unknown as any[];

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    React.useEffect(() => {
        if (isConfirmed) {
            setVerifyingId(null);
            refetch();
            if (onRefetch) onRefetch();
            alert("Transaction Confirmed!");
        }
    }, [isConfirmed, refetch, onRefetch]);

    const handleVerify = (creatorAddress: string) => {
        setVerifyingId(creatorAddress);
        writeContract({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "verifyAndRelease",
            args: [BigInt(id), creatorAddress as `0x${string}`, true, BigInt(100)],
        });
    };

    // Parse Metadata
    let meta = { name: "Campaign #" + id, desc: "" };
    try {
        meta = JSON.parse(campaign[2]);
    } catch (e) {
        meta.name = campaign[2] || `Campaign #${id}`;
    }

    // @ts-ignore
    const submissionsList = (enrollments as any[]) || [];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-5xl h-[80vh] bg-[#05050A] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="h-20 border-b border-white/5 bg-white/5 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                            #{id}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{meta.name}</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {submissionsList.length} Creators</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                <span className="flex items-center gap-1 text-emerald-400"><Zap className="w-3 h-3" /> Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-black/20 rounded-lg p-1">
                            {["submissions", "analytics", "settings"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                                        activeTab === tab ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* Escrow Visualization */}
                    <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Smart Contract Status</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-mono text-emerald-400">0x...{ESCROW_ADDRESS.substring(38)}</span>
                            </div>
                        </div>
                        <EscrowProgress status={submissionsList.some((s: any) => s.isPaid) ? 4 : submissionsList.some((s: any) => s.isVerified) ? 3 : submissionsList.length > 0 ? 2 : 1} />
                    </div>

                    {activeTab === "submissions" && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Creator Submissions</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search creator..."
                                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 w-64"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-400 uppercase tracking-widest">
                                            <th className="p-4 font-medium">Creator</th>
                                            <th className="p-4 font-medium">Submission</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {submissionsList.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                                    No creators have joined this campaign yet.
                                                </td>
                                            </tr>
                                        )}
                                        {submissionsList.map((sub: any, idx: number) => (
                                            <SubmissionRow
                                                key={idx}
                                                sub={sub}
                                                campaignId={id}
                                                onVerify={() => refetch()}
                                                onManualVerify={() => handleVerify(sub.creator)}
                                                isPendingTx={(isPending || isConfirming) && verifyingId === sub.creator}
                                                isConfirming={isConfirming && verifyingId === sub.creator}
                                                requirements={campaign[2]}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-500" />
                                    AI Verification History
                                </h3>
                                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                                    Campaign #{id}
                                </span>
                            </div>

                            <CampaignSubmissionHistory campaignId={id} />
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-xl space-y-6">
                            <h3 className="text-xl font-bold text-white">Campaign Settings</h3>
                            <div className="space-y-4">
                                {/* PAUSE / RESUME */}
                                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-yellow-400">
                                            {campaignData?.[7] ? "Pause Campaign" : "Resume Campaign"}
                                        </h4>
                                        <p className="text-xs text-gray-400">
                                            {campaignData?.[7] ? "Temporarily stop new creators from joining." : "Re-activate campaign to allow enrollments."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            writeContract({
                                                address: ESCROW_ADDRESS,
                                                abi: ESCROW_ABI,
                                                functionName: "toggleCampaignStatus",
                                                args: [BigInt(id), !campaignData?.[7]],
                                            });
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
                                            campaignData?.[7] ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                        )}
                                    >
                                        {campaignData?.[7] ? "Pause" : "Resume"}
                                    </button>
                                </div>

                                {/* END & REFUND */}
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-red-400">End Campaign & Refund</h4>
                                        <p className="text-xs text-gray-400">Permanently close and withdraw unused budget.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure? This will END the campaign and refund remaining budget.")) {
                                                writeContract({
                                                    address: ESCROW_ADDRESS,
                                                    abi: ESCROW_ABI,
                                                    functionName: "withdrawRemainingFunds",
                                                    args: [BigInt(id)],
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                                    >
                                        End & Refund
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function SubmissionRow({ sub, campaignId, onVerify, onManualVerify, isPendingTx, isConfirming, requirements }: { sub: any, campaignId: number, onVerify: () => void, onManualVerify: () => void, isPendingTx: boolean, isConfirming: boolean, requirements: string }) {
    const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
    const [aiResult, setAiResult] = useState<any>(null);

    const runAiAnalysis = async () => {
        setAiStatus('analyzing');
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                body: JSON.stringify({
                    url: sub.submissionUrl,
                    campaignId: campaignId.toString(),
                    creatorAddress: sub.creator,
                    campaignRequirements: requirements
                }),
            });
            const data = await res.json();
            setAiStatus('success');
            setAiResult(data);

            // Store submission in localStorage for analytics history
            try {
                const existingHistory = JSON.parse(localStorage.getItem('submission-history') || '[]');
                const newSubmission = {
                    url: sub.submissionUrl,
                    campaignId,
                    creatorAddress: sub.creator,
                    verified: data.verified,
                    score: data.score,
                    reason: data.reason,
                    platform: data.details?.platform,
                    contentType: data.details?.contentType,
                    matchedRequirements: data.aiAnalysis?.detectedHashtags || [],
                    missedRequirements: data.aiAnalysis?.brandMentions || [],
                    timestamp: new Date().toISOString(),
                    txHash: data.txHash
                };
                existingHistory.unshift(newSubmission);
                // Keep only last 50 submissions
                localStorage.setItem('submission-history', JSON.stringify(existingHistory.slice(0, 50)));
            } catch (e) {
                console.log('Failed to save submission history:', e);
            }

            if (data.txHash) {
                console.log("Payout triggered for creator:", sub.creator);
                setTimeout(onVerify, 2000);
            }
        } catch (e) {
            setAiStatus('error');
        }
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500" />
                    <div className="flex flex-col">
                        <span className="font-mono text-gray-300 text-xs">{sub.creator.substring(0, 6)}...{sub.creator.substring(38)}</span>
                        {aiResult && (
                            <span className={cn(
                                "text-[10px] font-bold mt-1",
                                aiResult.verified ? "text-green-400" : "text-red-400"
                            )}>
                                AI Score: {aiResult.score}/100
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="p-4">
                {sub.submissionUrl ? (
                    <div className="flex flex-col gap-1">
                        <a href={sub.submissionUrl} target="_blank" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            View Content
                        </a>
                        {aiStatus === 'idle' && !sub.isPaid && (
                            <button
                                onClick={runAiAnalysis}
                                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                <Zap className="w-3 h-3" />
                                Run AI Analysis
                            </button>
                        )}
                        {aiStatus === 'analyzing' && (
                            <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                            </span>
                        )}
                        {aiResult && (
                            <span className="text-[10px] text-gray-500">
                                {aiResult.reason.substring(0, 30)}...
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-500 italic">Not submitted</span>
                )}
            </td>
            <td className="p-4">
                {sub.isPaid ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Paid & Verified
                    </span>
                ) : sub.isRejected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Rejected
                    </span>
                ) : sub.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Verified (Unpaid)
                    </span>
                ) : sub.submissionUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                        <Clock className="w-3 h-3 animate-pulse" /> Pending Review
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 text-gray-400 text-xs font-bold border border-gray-500/20">
                        Joined
                    </span>
                )}
            </td>
            <td className="p-4 text-right">
                {!sub.isPaid && sub.submissionUrl && aiStatus === 'success' && aiResult?.verified && aiResult?.txHash && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Payout Automated
                    </span>
                )}
                {!sub.isPaid && sub.submissionUrl && aiStatus === 'success' && aiResult?.verified && !aiResult?.txHash && (
                    <span className="text-[10px] text-yellow-400 font-bold flex items-center justify-end gap-1" title="Verification passed but payout failed. Check verifier permissions.">
                        <XCircle className="w-3 h-3" /> Payout Failed
                    </span>
                )}
            </td>
        </tr>
    );
}

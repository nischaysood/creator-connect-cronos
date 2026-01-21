"use client";

import React, { useState, useEffect } from "react";
import {
    Megaphone,
    Upload,
    Instagram,
    Hash,
    Link as LinkIcon,
    AtSign,
    DollarSign,
    Wallet,
    ArrowRight,
    Check,
    Loader2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI, USDC_ADDRESS, USDC_ABI, USDC_DECIMALS } from "@/constants";

// Types
type Step = 1 | 2 | 3;

export function CreateCampaignWizard({ onSuccess }: { onSuccess: () => void }) {
    const [step, setStep] = useState<Step>(1);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        name: "",
        description: "",
        logo: null as File | null,

        // Step 2
        platform: "Instagram",
        contentType: "Reel",
        hashtags: [] as string[],
        hashtagInput: "",
        audioLink: "",
        mentions: "",

        // Step 3
        budget: "",
        rewardPerCreator: "",
        token: "USDC", // Changed from MNEE to USDC
        duration: "7" // Default 7 days
    });

    // Contract interactions
    const [txStep, setTxStep] = useState<"idle" | "approving" | "creating">("idle");
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    // Handle contract flow
    useEffect(() => {
        if (isConfirmed && txStep === "approving") {
            setTxStep("creating");
            // Execute Create Campaign
            // NOTE: In a real app we would store the advanced metadata (IPFS/Backend)
            // For now, we pack the essential "Details" string with the new fields
            const detailsJson = JSON.stringify({
                name: formData.name,
                desc: formData.description,
                platform: formData.platform,
                type: formData.contentType,
                tags: formData.hashtags
            });

            const maxCreators = Math.floor(Number(formData.budget) / Number(formData.rewardPerCreator));

            writeContract({
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "createCampaign",
                args: [detailsJson, parseUnits(formData.rewardPerCreator, USDC_DECIMALS), BigInt(maxCreators), BigInt(formData.duration)],
            });
        } else if (isConfirmed && txStep === "creating") {
            setTxStep("idle");
            onSuccess();
        }
    }, [isConfirmed, txStep, formData, writeContract]);

    useEffect(() => {
        if (hash) {
            console.log("Transaction submitted:", hash);
        }
        if (error) {
            console.error("Contract Error:", error);
        }
    }, [hash, error]);


    const handleNext = () => setStep(s => Math.min(s + 1, 3) as Step);
    const handleBack = () => setStep(s => Math.max(s - 1, 1) as Step);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && formData.hashtagInput) {
            e.preventDefault();
            setFormData(prev => ({
                ...prev,
                hashtags: [...prev.hashtags, prev.hashtagInput],
                hashtagInput: ""
            }));
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            hashtags: prev.hashtags.filter(t => t !== tag)
        }));
    };

    const handleDeploy = () => {
        if (!formData.budget || !formData.rewardPerCreator) return;
        setTxStep("approving");
        // Approve Token Usage
        writeContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "approve",
            args: [ESCROW_ADDRESS, parseUnits(formData.budget, USDC_DECIMALS)],
        });
    };

    const estimatedCreators = (formData.budget && formData.rewardPerCreator)
        ? Math.floor(Number(formData.budget) / Number(formData.rewardPerCreator))
        : 0;

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header / Progress */}
            <div className="bg-white/5 p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-outfit text-white">New Campaign</h2>
                    <span className="text-xs font-mono text-purple-400">STEP {step} OF 3</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="p-8 min-h-[400px]">
                {/* STEP 1: Details */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campaign Title</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="e.g. Summer DeFi Launch"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[120px]"
                                placeholder="Explain the campaign goals, key styling notes, and deliverables..."
                            />
                        </div>
                        <div className="p-6 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-purple-500/30 hover:bg-white/5 transition-colors cursor-pointer group">
                            <Upload className="w-8 h-8 mb-2 group-hover:text-purple-400 transition-colors" />
                            <span className="text-sm font-medium">Upload Brand Assets</span>
                            <span className="text-xs text-gray-600 mt-1">Drag & drop logo or banner</span>
                        </div>
                    </div>
                )}

                {/* STEP 2: Content Req */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 w-5 h-5 text-pink-500" />
                                    <select
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500/50"
                                    >
                                        <option className="bg-gray-900 text-white">Instagram</option>
                                        <option className="bg-gray-900 text-white">TikTok</option>
                                        <option className="bg-gray-900 text-white">X (Twitter)</option>
                                        <option className="bg-gray-900 text-white">YouTube Shorts</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content Type</label>
                                <select
                                    value={formData.contentType}
                                    onChange={e => setFormData({ ...formData, contentType: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500/50"
                                >
                                    <option className="bg-gray-900 text-white">Reel / Short</option>
                                    <option className="bg-gray-900 text-white">Static Post</option>
                                    <option className="bg-gray-900 text-white">Story</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Required Hashtags</label>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 flex flex-wrap gap-2 focus-within:border-purple-500/50 transition-colors">
                                {formData.hashtags.map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center gap-1">
                                        #{tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                                    </span>
                                ))}
                                <input
                                    value={formData.hashtagInput}
                                    onChange={e => setFormData({ ...formData, hashtagInput: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none min-w-[120px] px-2 py-1"
                                    placeholder="Type & Enter..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audio Link (Opt)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        value={formData.audioLink}
                                        onChange={e => setFormData({ ...formData, audioLink: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50"
                                        placeholder="Specific audio..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mentions</label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        value={formData.mentions}
                                        onChange={e => setFormData({ ...formData, mentions: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50"
                                        placeholder="@brandaccount"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Payment */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
                        <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 flex gap-4 items-start">
                            <Wallet className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-sm font-bold text-white">Smart Contract Escrow</h4>
                                <p className="text-xs text-gray-400 mt-1">
                                    Your funds will be locked in the smart contract and only released when the AI Agent verifies a creator's submission.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Budget</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500/50"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Per Creator</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        value={formData.rewardPerCreator}
                                        onChange={e => setFormData({ ...formData, rewardPerCreator: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500/50"
                                        placeholder="50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campaign Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 14, 30].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setFormData({ ...formData, duration: days.toString() })}
                                        className={cn(
                                            "py-2 rounded-xl text-xs font-bold border transition-all",
                                            formData.duration === days.toString()
                                                ? "bg-purple-500 text-white border-purple-500"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:border-purple-500/30"
                                        )}
                                    >
                                        {days} Days
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm text-gray-400">Currency</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFormData({ ...formData, token: "USDC" })}
                                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", formData.token === "USDC" ? "bg-purple-500 text-white border-purple-500" : "border-white/10 text-gray-400")}
                                >
                                    MNEE
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, token: "USDC" })}
                                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", formData.token === "USDC" ? "bg-blue-500 text-white border-blue-500" : "border-white/10 text-gray-400")}
                                >
                                    USDC (Recommended)
                                </button>
                            </div>
                        </div>

                        {/* Summary Calc */}
                        <div className="p-6 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 text-center">
                            <div className="text-sm text-gray-400 mb-1">This campaign will fund</div>
                            <div className="text-4xl font-bold text-white font-outfit">
                                {estimatedCreators} <span className="text-xl text-purple-400">Creators</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20">
                {step > 1 ? (
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Back
                    </button>
                ) : (
                    <div />
                )}

                {step < 3 ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                    >
                        Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleDeploy}
                        disabled={txStep !== "idle" || isConfirming || estimatedCreators <= 0}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:scale-100"
                    >
                        {txStep === "approving" ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isConfirming ? "Mining Approval..." : "Approving USDC..."}
                            </>
                        ) : txStep === "creating" ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isConfirming ? "Mining Campaign..." : "Creating Campaign..."}
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Launch Campaign
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 mx-6 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                    <p className="font-bold flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3" /> Error Detected
                    </p>
                    {error.message.includes("User rejected") ? "Transaction rejected in wallet." : error.message.slice(0, 100) + "..."}
                    <p className="mt-2 text-[10px] opacity-70 italic">Tip: If stuck, try resetting your MetaMask account (Settings &gt; Advanced &gt; Clear activity tab data).</p>
                </div>
            )}
        </div>
    );
}

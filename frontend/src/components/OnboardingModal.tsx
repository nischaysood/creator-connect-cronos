"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Camera,
    Type,
    Rocket,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    X,
    Wallet
} from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/constants";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
    role: "brand" | "creator";
    onSuccess: () => void;
}

const BRAND_AVATARS = [
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=400&h=400",
];

const CREATOR_AVATARS = [
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1557683311-483a3998852d?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1560015534-cee980ba7e13?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1560015534-08f3199859f8?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1560015534-91b9fe1fe1fc?auto=format&fit=crop&q=80&w=400&h=400",
];

export function OnboardingModal({ role, onSuccess }: OnboardingModalProps) {
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("");
    const [useCustomAvatar, setUseCustomAvatar] = useState(false);

    const avatars = role === "brand" ? BRAND_AVATARS : CREATOR_AVATARS;

    const { writeContract, data: hash, error: writeError, isPending: isWriting } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const isPending = isWriting || isConfirming;

    const handleSubmit = async () => {
        writeContract({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "registerProfile",
            args: [name, bio, avatar, role],
            // Hardhat local node gas estimation can be flaky, forcing a limit helps
            gas: BigInt(500000),
        });
    };

    React.useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }
    }, [isSuccess, onSuccess]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-xl overflow-hidden rounded-[40px] bg-[#05050a] border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shrink-0" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

                <div className="p-10 relative overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-10"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Welcome Aboard!</h2>
                                <p className="text-gray-400">Your profile is now live on the blockchain.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                            {role === 'brand' ? 'Brand Registry' : 'Creator Induction'}
                                        </div>
                                        <h2 className="text-4xl font-bold text-white tracking-tight">
                                            Complete Your <span className="text-purple-500">Identity</span>
                                        </h2>
                                        <p className="text-gray-400 mt-2">Create your on-chain profile to start collaborating.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Step</p>
                                        <p className="text-2xl font-bold text-white">{step}/2</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {step === 1 ? (
                                        <div className="space-y-4">
                                            <div className="group space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Type className="w-3 h-3" />
                                                    {role === 'brand' ? 'Company Name' : 'Display Name'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder={role === 'brand' ? "e.g. EcoTrend" : "e.g. Alex Rivera"}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                                                />
                                            </div>
                                            <div className="group space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {role === 'brand' ? 'Industry / Niche' : 'Your Niche'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    placeholder={role === 'brand' ? "e.g. Sustainable Fashion" : "e.g. Tech Reviews & Lifestyle"}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Camera className="w-3 h-3" />
                                                    {useCustomAvatar ? "Custom Avatar URL" : "Choose your Avatar"}
                                                </label>

                                                {!useCustomAvatar ? (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {avatars.map((url, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setAvatar(url)}
                                                                className={cn(
                                                                    "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105",
                                                                    avatar === url ? "border-purple-500 ring-4 ring-purple-500/20" : "border-white/10 grayscale hover:grayscale-0"
                                                                )}
                                                            >
                                                                <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                                                                {avatar === url && (
                                                                    <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                setUseCustomAvatar(true);
                                                                setAvatar("");
                                                            }}
                                                            className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/20 transition-all"
                                                        >
                                                            <Type className="w-5 h-5" />
                                                            <span className="text-[10px] font-bold uppercase">Custom</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={avatar}
                                                            onChange={(e) => setAvatar(e.target.value)}
                                                            placeholder="https://..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                                                        />
                                                        <button
                                                            onClick={() => setUseCustomAvatar(false)}
                                                            className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
                                                        >
                                                            ← Back to Selection
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {avatar && (
                                                <div className="flex flex-col items-center gap-3 py-4 border-t border-white/5">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Identity Preview</p>
                                                    <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-4 ring-purple-500/20">
                                                        <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-sm font-bold text-white mt-1">{name}</p>
                                                    <p className="text-xs text-gray-400 capitalize">{role}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {step === 2 && (
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
                                        >
                                            Back
                                        </button>
                                    )}
                                    {!address ? (
                                        <button
                                            onClick={openConnectModal}
                                            className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Connect Wallet to Register
                                        </button>
                                    ) : (
                                        <button
                                            disabled={step === 1 ? !name || !bio : !avatar || isPending}
                                            onClick={step === 1 ? () => setStep(2) : handleSubmit}
                                            className="flex-[2] py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-white/5"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                                    Confirming on chain...
                                                </>
                                            ) : (
                                                <>
                                                    {step === 1 ? "Next Step" : "Initialize Identity"}
                                                    <Rocket className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {writeError && (
                                    <p className="text-center text-red-500 text-xs font-medium animate-pulse">
                                        Error: {writeError.message.slice(0, 50)}...
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

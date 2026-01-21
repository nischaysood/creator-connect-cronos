"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";
import { useToast } from "@/components/ToastProvider";

interface SubmitWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: bigint;
    campaignTitle: string;
}

export default function SubmitWorkModal({ isOpen, onClose, campaignId, campaignTitle }: SubmitWorkModalProps) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const { showToast } = useToast();

    const { data: hash, isPending: isWritePending, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Show toast when submission is successful
    useEffect(() => {
        if (isSuccess) {
            showToast({
                type: 'success',
                title: '🎉 Work Submitted!',
                message: `Your content for "${campaignTitle}" has been submitted. The brand will be notified!`,
                duration: 6000
            });
        }
    }, [isSuccess, campaignTitle, showToast]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) {
            setError("Please enter a valid URL");
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch (_) {
            setError("Invalid URL format");
            return;
        }

        writeContract({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "submitContent",
            args: [campaignId, url],
        });
    };

    const handleClose = () => {
        setUrl("");
        setError("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
                    >
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Submit Work</h3>
                                    <p className="text-sm text-slate-400 mt-1">For: {campaignTitle}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {isSuccess ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-2">Submission Successful!</h4>
                                        <p className="text-slate-400 mb-6">
                                            Your work has been submitted for verification. The brand will review it shortly.
                                        </p>
                                        <button
                                            onClick={handleClose}
                                            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Content URL
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                                    <LinkIcon className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={url}
                                                    onChange={(e) => {
                                                        setUrl(e.target.value);
                                                        setError("");
                                                    }}
                                                    placeholder="https://tweet.com/..."
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                                />
                                            </div>
                                            {error && (
                                                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{error}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <p className="text-sm text-blue-200">
                                                <span className="font-semibold">Tip:</span> Make sure your content is public so our AI agent can verify it.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isWritePending || isConfirming || !url}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <div className="relative flex items-center justify-center gap-2">
                                                {(isWritePending || isConfirming) && (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                )}
                                                <span>
                                                    {isWritePending
                                                        ? "Confirm in Wallet..."
                                                        : isConfirming
                                                            ? "Submitting..."
                                                            : "Submit Work"}
                                                </span>
                                            </div>
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

import React from "react";
import { Check, Lock, Loader2, ShieldCheck, DollarSign } from "lucide-react";

interface EscrowProgressProps {
    status: number; // 0: Created, 1: Funded/Locked, 2: Submitted, 3: Verified, 4: Released
}

export function EscrowProgress({ status }: EscrowProgressProps) {
    const steps = [
        { label: "Created", icon: ShieldCheck },
        { label: "Funded", icon: Lock },
        { label: "Work Submitted", icon: Loader2 },
        { label: "Verified", icon: Check },
        { label: "Paid", icon: DollarSign },
    ];

    const currentStep = Math.min(status, 4);

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full z-0 transition-all duration-1000"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isActive = index === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center gap-3">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                    ${isActive
                                        ? "bg-[#0B0B15] border-purple-500 text-purple-400 scale-125 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]"
                                        : isCompleted
                                            ? "bg-purple-500 border-purple-500 text-white"
                                            : "bg-[#0B0B15] border-white/10 text-gray-600"}
                                `}
                            >
                                <Icon size={isActive ? 18 : 16} className={isActive && step.label === "Work Submitted" ? "animate-spin" : ""} />
                            </div>
                            <span
                                className={`
                                    absolute -bottom-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider
                                    ${isActive ? "text-white" : isCompleted ? "text-purple-400" : "text-gray-600"}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

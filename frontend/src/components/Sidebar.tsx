"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Target,
    Users,
    Calendar,
    BarChart3,
    Settings,
    HelpCircle,
    LogOut,
    Wallet
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_ADDRESS, USDC_ABI, USDC_DECIMALS } from "@/constants";

const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Campaigns", href: "/campaigns", icon: Target },
    { name: "Creators", href: "/creators", icon: Users },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNav = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<"brand" | "creator">("brand");

    useEffect(() => {
        const savedRole = localStorage.getItem("user-role") as "brand" | "creator" | null;
        const queryRole = searchParams.get('role') as "brand" | "creator" | null;
        if (queryRole) {
            setRole(queryRole);
        } else if (savedRole) {
            setRole(savedRole);
        }
    }, [searchParams]);

    // Auto-Faucet for seamless testing
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (isConnected && address) {
            const fundWallet = async () => {
                try {
                    // Check if already funded this session to prevent spam (optional, but API handles balance check)
                    const key = `funded-${address}`;
                    if (sessionStorage.getItem(key)) return;

                    console.log('💰 Auto-Faucet: Checking balance for', address);
                    await fetch('/api/faucet', {
                        method: 'POST',
                        body: JSON.stringify({ address }),
                        headers: { 'Content-Type': 'application/json' }
                    });

                    sessionStorage.setItem(key, 'true');
                    console.log('✅ Auto-Faucet: Funding check complete');
                } catch (e) {
                    console.error('Faucet error:', e);
                }
            };
            fundWallet();
        }
    }, [address, isConnected]);

    // USDC Balance Fetch
    const { data: usdcData } = useReadContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // Format balance (6 decimals for USDC)
    const usdcBalance = usdcData ? Number(formatUnits(usdcData as bigint, USDC_DECIMALS)).toFixed(2) : '0.00';

    const navItems = mainNav.map(item => {
        if (item.name === "Creators" && role === "creator") {
            return { ...item, name: "Brands", href: "/brands" };
        }
        return item;
    });

    return (
        <div className="flex flex-col h-screen w-64 glass-dark border-r border-white/5 fixed left-0 top-0 z-50">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white font-heading leading-tight">
                            Creator<span className="text-primary">Connect</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                role === 'brand' ? "bg-purple-500" : "bg-cyan-500"
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                {role === 'brand' ? 'Brand Suite' : 'Creator Studio'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-4">
                    Menu
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.name === "Campaigns" && (
                                <span className="ml-auto text-[10px] bg-primary-foreground/10 text-primary-foreground px-1.5 py-0.5 rounded-full">
                                    12+
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 py-4 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-4">
                    General
                </div>
                {bottomNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => {
                        localStorage.removeItem("user-role");
                        router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 mt-4 group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-400" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>

            <div className="p-4 mt-auto">
                <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                    }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                            ready &&
                            account &&
                            chain &&
                            (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                        return (
                            <div
                                {...(!ready && {
                                    'aria-hidden': true,
                                    'style': {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    },
                                })}
                            >
                                {(() => {
                                    if (!connected) {
                                        return (
                                            <button
                                                onClick={openConnectModal}
                                                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                                            >
                                                Connect Wallet
                                            </button>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button
                                                onClick={openChainModal}
                                                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-3 rounded-xl hover:bg-red-500/20 transition-colors"
                                            >
                                                Wrong Network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 relative overflow-hidden group">
                                            <div className="flex items-center gap-3 relative z-10">
                                                <button onClick={openAccountModal} className="relative">
                                                    {account.displayBalance ? (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px]">
                                                            <div className="w-full h-full rounded-xl bg-[#0B0B15] flex items-center justify-center">
                                                                <Wallet size={18} className="text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gray-700 animate-pulse" />
                                                    )}
                                                </button>

                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-bold text-white truncate block">
                                                        {account.displayName}
                                                    </span>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] text-gray-400 font-medium truncate block">
                                                            {account.displayBalance ? `${account.displayBalance} ETH` : ''}
                                                        </span>
                                                        <span className="text-[10px] text-emerald-400 font-bold truncate block">
                                                            {usdcBalance} USDC
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={openAccountModal}
                                                className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] flex items-center justify-center"
                                            >
                                                <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">Manage</span>
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Bell,
    Shield,
    Wallet,
    Globe,
    LogOut,
    Check,
    CreditCard
} from "lucide-react";

// Types
type Tab = "profile" | "notifications" | "security" | "wallet";

export function SettingsView() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "wallet", label: "Wallet & Billing", icon: Wallet },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <nav className="space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-8 border-t border-white/5 mx-4">
                    <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-8 rounded-3xl"
                >
                    {activeTab === "profile" && <ProfileSettings />}
                    {activeTab === "notifications" && <NotificationSettings />}
                    {activeTab === "wallet" && <WalletSettings />}
                    {activeTab === "security" && <SecuritySettings />}
                </motion.div>
            </div>
        </div>
    );
}

// --- Sub-components ---

function ProfileSettings() {
    const [name, setName] = useState("John Doe");
    const [username, setUsername] = useState("@johndoe_eth");
    const [bio, setBio] = useState("Building the future of content creation on Web3.");
    const [isSaved, setIsSaved] = useState(false);

    React.useEffect(() => {
        const savedProfile = localStorage.getItem("user-profile");
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            setName(parsed.name || "John Doe");
            setUsername(parsed.username || "@johndoe_eth");
            setBio(parsed.bio || "Building the future of content creation on Web3.");
        }
    }, []);

    const handleSave = () => {
        const profile = { name, username, bio };
        localStorage.setItem("user-profile", JSON.stringify(profile));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile Details</h2>
                <p className="text-gray-400 text-sm">Update your personal information and public profile.</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0B0B15] flex items-center justify-center text-3xl font-bold text-white uppercase">
                        {name.charAt(0)}
                    </div>
                </div>
                <div>
                    <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors border border-white/5">
                        Change Avatar
                    </button>
                    <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. 1MB Max.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B15] border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B15] border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B15] border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end items-center gap-4">
                {isSaved && <span className="text-green-400 text-sm font-bold animate-pulse">Changes Saved!</span>}
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-purple-100 transition-colors shadow-lg shadow-white/10"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function NotificationSettings() {
    const [toggles, setToggles] = useState({
        campaignInvites: true,
        payments: true,
        marketing: false,
        security: true
    });

    const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? "bg-purple-600" : "bg-white/10"}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${active ? "translate-x-6" : "translate-x-0"}`} />
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
                <p className="text-gray-400 text-sm">Manage how you receive updates and alerts.</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                        <h4 className="font-bold text-white text-sm">Campaign Invites</h4>
                        <p className="text-xs text-gray-400">Receive alerts when brands invite you</p>
                    </div>
                    <Toggle active={toggles.campaignInvites} onClick={() => setToggles(p => ({ ...p, campaignInvites: !p.campaignInvites }))} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                        <h4 className="font-bold text-white text-sm">Payment Received</h4>
                        <p className="text-xs text-gray-400">Alerts when funds are deposited to your wallet</p>
                    </div>
                    <Toggle active={toggles.payments} onClick={() => setToggles(p => ({ ...p, payments: !p.payments }))} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                        <h4 className="font-bold text-white text-sm">Security Alerts</h4>
                        <p className="text-xs text-gray-400">Important account security notifications</p>
                    </div>
                    <Toggle active={toggles.security} onClick={() => setToggles(p => ({ ...p, security: !p.security }))} />
                </div>
            </div>
        </div>
    );
}


// Import wagmi check
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { USDC_ADDRESS, USDC_ABI } from "@/constants";
import { parseEther } from "viem";

function WalletSettings() {
    const { writeContract, isPending } = useWriteContract();

    const handleMint = () => {
        writeContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "mint",
            args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", parseEther("10000")], // Mint to default hardhat account or current user if I could access it, but for demo I'll mint to "me"
        });
        // Ideally we use useAccount() to get current address, but I want to keep this simple without adding more hooks if possible.
        // Actually, let's use a prompt or just mint to the connected signer (which `mint` usually does if `to` is msg.sender, but this mock might require explicit `to`).
        // I'll assume the user is connected.
    };

    // Better: Helper to mint to *self*
    const { data: hash } = useWriteContract(); // shadowing outer

    // Let's just create a separate component or keep it clean

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Wallet & Billing</h2>
                <p className="text-gray-400 text-sm">Manage your connected wallets and payment methods.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-purple-500/20">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Main Wallet</h4>
                            <p className="text-xs text-gray-400 font-mono">Connected</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase border border-green-500/20">Active</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex gap-4">
                    <MintButton />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Accepted Tokens</h3>
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">U</div>
                        <span className="text-sm font-medium text-white">USDC</span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">M</div>
                        <span className="text-sm font-medium text-white">MNEE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MintButton() {
    const { writeContract, isPending } = useWriteContract();
    const { address } = useAccount();

    return (
        <button
            disabled={isPending || !address}
            onClick={() => {
                if (!address) return;
                writeContract({
                    address: USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: "mint",
                    args: [address, parseEther("5000")]
                })
            }}
            className="text-xs text-white bg-purple-500 hover:bg-purple-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            {isPending ? "Minting..." : "Mint Test MNEE"}
        </button>
    )
}


function SecuritySettings() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Security</h2>
                <p className="text-gray-400 text-sm">Keep your account propertly secured.</p>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
                <Shield className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-white text-sm">2FA Recommended</h4>
                    <p className="text-xs text-yellow-200/70 mt-1">We recommend enabling 2-Factor Authentication for withdrawals.</p>
                </div>
                <button className="ml-auto px-3 py-1.5 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400">Enable</button>
            </div>

            <div className="space-y-4">
                <button className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left group">
                    <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Change Password</h4>
                        <p className="text-xs text-gray-400">Last changed 3 months ago</p>
                    </div>
                    <CreditCard className="text-gray-500 group-hover:text-white" size={16} />
                </button>
                <button className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left group">
                    <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Authorized Apps</h4>
                        <p className="text-xs text-gray-400">Manage connected dApps</p>
                    </div>
                    <Globe className="text-gray-500 group-hover:text-white" size={16} />
                </button>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import {
    TrendingUp,
    Users,
    Eye,
    MousePointerClick,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Wallet,
    CheckCircle2,
    Clock,
    Loader2,
    Briefcase,
    Award,
    Target
} from "lucide-react";
import { useReadContracts, useAccount } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI, USDC_DECIMALS } from "@/constants";
import { formatEther, formatUnits } from "viem";

// --- Platform Data ---
const PLATFORM_DATA = [
    { name: 'Instagram', value: 45, color: '#E1306C' },
    { name: 'YouTube', value: 30, color: '#FF0000' },
    { name: 'TikTok', value: 15, color: '#00f2ea' },
    { name: 'X', value: 10, color: '#1DA1F2' },
];

// --- Stat Card Component ---
const StatCard = ({ title, value, change, isPositive, icon: Icon, color, isLoading }: any) => (
    <div className="p-6 rounded-3xl bg-[#0B0B15]/50 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <Icon size={16} />
                {title}
            </div>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
            ) : (
                <>
                    <div className="text-3xl font-bold text-white font-heading mb-2">{value}</div>
                    {change && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {change}
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
);

// --- Brand Analytics Component ---
function BrandAnalytics({ analytics, isLoading, chartData }: any) {
    const [timeRange, setTimeRange] = useState("7d");
    const totalSpent = Number(formatUnits(analytics.totalPaid || BigInt(0), USDC_DECIMALS));
    const totalEscrowed = Number(formatUnits(BigInt(analytics.totalDeposited || 0) - BigInt(analytics.totalPaid || 0), USDC_DECIMALS));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Brand Analytics</h2>
                    <p className="text-sm text-gray-500">Track your campaign performance</p>
                </div>
                <div className="flex bg-[#0B0B15] p-1 rounded-xl border border-white/10">
                    {["24h", "7d", "30d", "90d"].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-white"}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brand Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="My Campaigns"
                    value={analytics.myCampaigns}
                    change={`${analytics.activeCampaigns} active`}
                    isPositive={true}
                    icon={Briefcase}
                    color="text-purple-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Creators"
                    value={analytics.totalCreators}
                    change="+12%"
                    isPositive={true}
                    icon={Users}
                    color="text-cyan-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Spent"
                    value={`${totalSpent.toFixed(0)} USDC`}
                    change="Paid out"
                    isPositive={false}
                    icon={DollarSign}
                    color="text-red-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="In Escrow"
                    value={`${totalEscrowed.toFixed(0)} USDC`}
                    change="Locked"
                    isPositive={true}
                    icon={Wallet}
                    color="text-yellow-500"
                    isLoading={isLoading}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B0B15]/50 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple-400" />
                        Campaign Performance ({timeRange})
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4c1d95', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="engagement" stroke="#ec4899" strokeWidth={3} fill="url(#colorEng)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="p-6 rounded-3xl bg-[#0B0B15]/50 border border-white/5 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Platform Share</h3>
                    <div className="flex-1 min-h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={PLATFORM_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {PLATFORM_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">4</div>
                                <div className="text-[10px] text-gray-500 uppercase">Platforms</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {PLATFORM_DATA.map(p => (
                            <div key={p.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="text-gray-300">{p.name}</span>
                                </div>
                                <span className="font-bold text-white">{p.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-3xl bg-[#0B0B15]/50 border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">My Campaigns</h3>
                </div>
                <div className="p-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                                <th className="p-4">Campaign</th>
                                <th className="p-4">Creators</th>
                                <th className="p-4">Deposited</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {analytics.campaigns.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No campaigns yet</td></tr>
                            ) : (
                                analytics.campaigns.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-white/5 border-b border-white/5">
                                        <td className="p-4 font-bold text-white">{c.name}</td>
                                        <td className="p-4 text-gray-300">{c.creators}/{c.maxCreators}</td>
                                        <td className="p-4 text-white">{c.deposited} USDC</td>
                                        <td className="p-4 text-emerald-400">{c.paid} USDC</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                {c.isActive ? 'Active' : 'Ended'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submission History */}
            <div className="rounded-3xl bg-[#0B0B15]/50 border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        AI Verification History
                    </h3>
                    <span className="text-xs text-gray-500">{analytics.submissions?.length || 0} submissions</span>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto">
                    {(!analytics.submissions || analytics.submissions.length === 0) ? (
                        <div className="p-8 text-center text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No submissions yet. Waiting for creators to submit content.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analytics.submissions.map((sub: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${sub.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {sub.verified ? '✓' : '✗'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{sub.creatorAddress?.slice(0, 8)}...{sub.creatorAddress?.slice(-6)}</div>
                                                <div className="text-xs text-gray-500">{sub.campaignName || `Campaign #${sub.campaignId}`}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${sub.score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {sub.score}%
                                            </div>
                                            <div className="text-[10px] text-gray-500">Match Score</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs mb-2">
                                            <span className="text-gray-500">URL:</span>
                                            <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline truncate max-w-[200px]">
                                                {sub.url}
                                            </a>
                                        </div>
                                        <div className="text-xs text-gray-400">{sub.reason}</div>
                                        {sub.matchedRequirements && sub.matchedRequirements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {sub.matchedRequirements.map((req: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px]">
                                                        ✓ {req}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {sub.missedRequirements && sub.missedRequirements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
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
                                        <span>{sub.verified ? '💰 Paid' : '❌ Rejected'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Creator Analytics Component ---
function CreatorAnalytics({ analytics, isLoading }: any) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-white">Creator Analytics</h2>
                <p className="text-sm text-gray-500">Track your earnings and submissions</p>
            </div>

            {/* Creator Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Campaigns Joined"
                    value={analytics.joinedCampaigns}
                    icon={Target}
                    color="text-cyan-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Earned"
                    value={`${analytics.totalEarned.toFixed(0)} USDC`}
                    change="Verified payouts"
                    isPositive={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Verified Works"
                    value={analytics.verifiedWorks}
                    icon={CheckCircle2}
                    color="text-green-500"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Pending Review"
                    value={analytics.pendingWorks}
                    icon={Clock}
                    color="text-yellow-500"
                    isLoading={isLoading}
                />
            </div>

            {/* Earnings Chart */}
            <div className="p-6 rounded-3xl bg-[#0B0B15]/50 border border-white/5 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <Award size={18} className="text-emerald-400" />
                    Earnings History
                    <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        +{analytics.totalEarned.toFixed(0)} USDC Total
                    </span>
                </h3>
                <div className="h-[300px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.earningsData}>
                            <defs>
                                <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} USDC`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                formatter={(value) => [`${value} USDC`, 'Earned']}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="earned"
                                stroke="#10b981"
                                strokeWidth={3}
                                fill="url(#colorEarned)"
                                dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#0B0B15', r: 5 }}
                                activeDot={{ fill: '#10b981', stroke: '#10b981', strokeWidth: 2, r: 7, strokeOpacity: 0.3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="rounded-3xl bg-[#0B0B15]/50 border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">My Submissions</h3>
                </div>
                <div className="p-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                                <th className="p-4">Campaign</th>
                                <th className="p-4">Reward</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Earned</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {analytics.submissions.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No submissions yet</td></tr>
                            ) : (
                                analytics.submissions.map((s: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/5 border-b border-white/5">
                                        <td className="p-4 font-bold text-white">{s.campaignName}</td>
                                        <td className="p-4 text-gray-300">{s.reward} USDC</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                s.isVerified ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {s.isPaid ? 'Paid' : s.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-emerald-400 font-bold">{s.isPaid ? `${s.reward} USDC` : '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Main Analytics View ---
export function AnalyticsView({ role = 'brand' }: { role?: 'brand' | 'creator' }) {
    const { address } = useAccount();

    // Fetch campaign count
    const { data: campaignCountData, isLoading: isLoadingCount } = useReadContracts({
        contracts: [{
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'nextCampaignId',
        }],
    });

    const campaignCount = Number(campaignCountData?.[0]?.result || 0);

    // Fetch all campaigns
    const campaignContracts = useMemo(() => {
        const contracts = [];
        for (let i = 0; i < campaignCount; i++) {
            contracts.push({
                address: ESCROW_ADDRESS as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: 'campaigns',
                args: [BigInt(i)],
            });
            contracts.push({
                address: ESCROW_ADDRESS as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: 'getCampaignEnrollments',
                args: [BigInt(i)],
            });
        }
        return contracts;
    }, [campaignCount]);

    const { data: campaignData, isLoading: isLoadingCampaigns } = useReadContracts({
        contracts: campaignContracts,
        query: { enabled: campaignCount > 0 }
    });

    // Process data for Brand
    const brandAnalytics = useMemo(() => {
        if (!campaignData || !address) return {
            myCampaigns: 0, activeCampaigns: 0, totalCreators: 0,
            totalDeposited: BigInt(0), totalPaid: BigInt(0), campaigns: []
        };

        let myCampaigns = 0, activeCampaigns = 0, totalCreators = 0;
        let totalDeposited = BigInt(0), totalPaid = BigInt(0);
        const campaigns: any[] = [];

        for (let i = 0; i < campaignCount; i++) {
            const c = campaignData[i * 2]?.result as any;
            const enrollments = campaignData[i * 2 + 1]?.result as any[] || [];

            if (c && c[1]?.toLowerCase() === address?.toLowerCase()) {
                myCampaigns++;
                if (c[7]) activeCampaigns++;
                totalCreators += enrollments.length;
                totalDeposited += c[5];
                totalPaid += c[6];

                let name = `Campaign #${i}`;
                try { name = JSON.parse(c[2]).name || name; } catch { }

                campaigns.push({
                    id: i, name,
                    creators: enrollments.length,
                    maxCreators: Number(c[4]),
                    deposited: Number(formatUnits(c[5], USDC_DECIMALS)).toFixed(0),
                    paid: Number(formatUnits(c[6], USDC_DECIMALS)).toFixed(0),
                    isActive: c[7]
                });
            }
        }

        return { myCampaigns, activeCampaigns, totalCreators, totalDeposited, totalPaid, campaigns };
    }, [campaignData, campaignCount, address]);

    // Load submission history from localStorage
    const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
    React.useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem('submission-history') || '[]');
            setSubmissionHistory(history);
        } catch { }
    }, []);

    // Merge submissions into brandAnalytics
    const brandAnalyticsWithSubmissions = useMemo(() => ({
        ...brandAnalytics,
        submissions: submissionHistory
    }), [brandAnalytics, submissionHistory]);

    // Process data for Creator
    const creatorAnalytics = useMemo(() => {
        if (!campaignData || !address) return {
            joinedCampaigns: 0, totalEarned: 0, verifiedWorks: 0, pendingWorks: 0,
            submissions: [], earningsData: []
        };

        let joinedCampaigns = 0, totalEarned = 0, verifiedWorks = 0, pendingWorks = 0;
        const submissions: any[] = [];
        const earningsData: any[] = [];

        for (let i = 0; i < campaignCount; i++) {
            const c = campaignData[i * 2]?.result as any;
            const enrollments = campaignData[i * 2 + 1]?.result as any[] || [];

            const myEnrollment = enrollments.find((e: any) => e.creator?.toLowerCase() === address?.toLowerCase());

            if (myEnrollment && c) {
                joinedCampaigns++;
                const reward = Number(formatUnits(c[3], USDC_DECIMALS));

                let campaignName = `Campaign #${i}`;
                try { campaignName = JSON.parse(c[2]).name || campaignName; } catch { }

                if (myEnrollment.isPaid) {
                    totalEarned += reward;
                    verifiedWorks++;
                    earningsData.push({ name: `C${i}`, earned: reward });
                } else if (myEnrollment.isVerified) {
                    verifiedWorks++;
                } else if (myEnrollment.submissionUrl) {
                    pendingWorks++;
                }

                submissions.push({
                    campaignName,
                    reward: reward.toFixed(0),
                    isVerified: myEnrollment.isVerified,
                    isPaid: myEnrollment.isPaid,
                    url: myEnrollment.submissionUrl
                });
            }
        }

        return { joinedCampaigns, totalEarned, verifiedWorks, pendingWorks, submissions, earningsData };
    }, [campaignData, campaignCount, address]);

    // Chart data for brand
    const chartData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const total = Number(formatUnits(brandAnalytics.totalDeposited, USDC_DECIMALS));
        return days.map((name, i) => ({
            name,
            views: Math.floor((total / 7) * (1 + Math.sin(i) * 0.5) * 100),
            engagement: Math.floor((total / 7) * (1 + Math.cos(i) * 0.3) * 50)
        }));
    }, [brandAnalytics.totalDeposited]);

    const isLoading = isLoadingCount || isLoadingCampaigns;

    // Render based on role
    if (role === 'creator') {
        return <CreatorAnalytics analytics={creatorAnalytics} isLoading={isLoading} />;
    }

    return <BrandAnalytics analytics={brandAnalyticsWithSubmissions} isLoading={isLoading} chartData={chartData} />;
}

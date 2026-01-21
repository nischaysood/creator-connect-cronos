"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Instagram,
    Twitter,
    Youtube,
    Video,
    MoreHorizontal,
    X as XIcon,
    Calendar as CalendarIcon,
    Clock,
    DollarSign,
    FileCheck,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useReadContracts, useAccount } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/constants";
import { formatEther } from "viem";

interface CalendarEvent {
    id: string | number;
    day: number;
    month: number;
    year: number;
    title: string;
    type: 'deadline' | 'submission' | 'payment' | 'custom';
    platform?: string;
    status: 'upcoming' | 'done' | 'overdue' | 'pending';
    campaignId?: number;
    reward?: string;
}

export function ContentCalendar({ role = 'brand' }: { role?: 'brand' | 'creator' }) {
    const { address } = useAccount();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventPlatform, setNewEventPlatform] = useState("Instagram");

    // Load custom events from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("calendar-events");
        if (saved) setCustomEvents(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("calendar-events", JSON.stringify(customEvents));
    }, [customEvents]);

    // Fetch campaign count
    const { data: countData } = useReadContracts({
        contracts: [{
            address: ESCROW_ADDRESS as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'nextCampaignId',
        }],
    });
    const campaignCount = Number(countData?.[0]?.result || 0);

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

    const { data: campaignData, isLoading } = useReadContracts({
        contracts: campaignContracts,
        query: { enabled: campaignCount > 0 }
    });

    // Generate blockchain events
    const blockchainEvents = useMemo(() => {
        if (!campaignData || !address) return [];
        const events: CalendarEvent[] = [];

        for (let i = 0; i < campaignCount; i++) {
            const c = campaignData[i * 2]?.result as any;
            const enrollments = campaignData[i * 2 + 1]?.result as any[] || [];
            if (!c) continue;

            const deadline = Number(c[9]);
            const deadlineDate = new Date(deadline * 1000);
            const isMyBrand = c[1]?.toLowerCase() === address?.toLowerCase();

            let campaignName = `Campaign #${i}`;
            let platform = 'Instagram';
            try {
                const parsed = JSON.parse(c[2]);
                campaignName = parsed.name || campaignName;
                platform = parsed.platform || platform;
            } catch { }

            const reward = formatEther(c[3]);
            const now = Date.now() / 1000;

            // Brand events
            if (role === 'brand' && isMyBrand) {
                // Deadline event
                if (deadline > 0) {
                    events.push({
                        id: `deadline-${i}`,
                        day: deadlineDate.getDate(),
                        month: deadlineDate.getMonth(),
                        year: deadlineDate.getFullYear(),
                        title: `📅 ${campaignName} Deadline`,
                        type: 'deadline',
                        platform,
                        status: deadline < now ? 'overdue' : 'upcoming',
                        campaignId: i,
                        reward
                    });
                }

                // Submission events
                enrollments.forEach((e: any, idx: number) => {
                    if (e.submissionUrl) {
                        const today = new Date();
                        events.push({
                            id: `sub-${i}-${idx}`,
                            day: today.getDate(),
                            month: today.getMonth(),
                            year: today.getFullYear(),
                            title: `📥 Submission from ${e.creator?.substring(0, 8)}...`,
                            type: 'submission',
                            platform,
                            status: e.isPaid ? 'done' : e.isVerified ? 'pending' : 'upcoming',
                            campaignId: i
                        });
                    }
                });
            }

            // Creator events
            if (role === 'creator') {
                const myEnrollment = enrollments.find((e: any) =>
                    e.creator?.toLowerCase() === address?.toLowerCase()
                );

                if (myEnrollment) {
                    // Deadline for my campaign
                    if (deadline > 0) {
                        events.push({
                            id: `my-deadline-${i}`,
                            day: deadlineDate.getDate(),
                            month: deadlineDate.getMonth(),
                            year: deadlineDate.getFullYear(),
                            title: `⏰ Submit: ${campaignName}`,
                            type: 'deadline',
                            platform,
                            status: myEnrollment.submissionUrl ? 'done' : (deadline < now ? 'overdue' : 'upcoming'),
                            campaignId: i,
                            reward
                        });
                    }

                    // Payment event
                    if (myEnrollment.isPaid) {
                        const today = new Date();
                        events.push({
                            id: `payment-${i}`,
                            day: today.getDate(),
                            month: today.getMonth(),
                            year: today.getFullYear(),
                            title: `💰 Paid: ${reward} MNEE`,
                            type: 'payment',
                            platform,
                            status: 'done',
                            campaignId: i,
                            reward
                        });
                    }
                }
            }
        }

        return events;
    }, [campaignData, campaignCount, address, role]);

    // Combine all events
    const allEvents = useMemo(() => {
        return [...blockchainEvents, ...customEvents.map(e => ({
            ...e,
            month: currentDate.getMonth(),
            year: currentDate.getFullYear()
        }))];
    }, [blockchainEvents, customEvents, currentDate]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "Instagram": return <Instagram size={12} />;
            case "X (Twitter)": return <Twitter size={12} />;
            case "YouTube": return <Youtube size={12} />;
            default: return <Video size={12} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "upcoming": return "bg-blue-500";
            case "done": return "bg-emerald-500";
            case "overdue": return "bg-red-500";
            case "pending": return "bg-yellow-500";
            default: return "bg-gray-500";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "deadline": return <Clock size={12} className="text-orange-400" />;
            case "submission": return <FileCheck size={12} className="text-blue-400" />;
            case "payment": return <DollarSign size={12} className="text-emerald-400" />;
            default: return <CalendarIcon size={12} className="text-purple-400" />;
        }
    };

    const handleAddEvent = () => {
        if (!newEventTitle || !selectedDate) return;
        const newEvent: CalendarEvent = {
            id: Date.now(),
            day: selectedDate,
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
            title: newEventTitle,
            type: 'custom',
            platform: newEventPlatform,
            status: 'upcoming'
        };
        setCustomEvents([...customEvents, newEvent]);
        setIsAddModalOpen(false);
        setNewEventTitle("");
    };

    const getEventsForDay = (day: number) => {
        return allEvents.filter(e =>
            e.day === day &&
            e.month === currentDate.getMonth() &&
            e.year === currentDate.getFullYear()
        );
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)] relative">
            {/* Main Calendar */}
            <div className="flex-1 flex flex-col glass-panel rounded-3xl p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-heading">
                            {monthNames[currentDate.getMonth()]} <span className="text-gray-500">{currentDate.getFullYear()}</span>
                        </h2>
                        <p className="text-sm text-gray-400">
                            {role === 'brand' ? 'Campaign deadlines & submissions' : 'Your deadlines & payments'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                        <div className="flex bg-[#0B0B15] p-1 rounded-xl border border-white/5">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-sm font-bold text-white bg-white/5 rounded-lg hover:bg-white/10">Today</button>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-2 overflow-hidden">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();
                        const hasOverdue = dayEvents.some(e => e.status === 'overdue');
                        const hasPayment = dayEvents.some(e => e.type === 'payment');

                        return (
                            <motion.div
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                whileHover={{ scale: 0.98 }}
                                className={`
                                    relative p-2 rounded-xl border transition-all cursor-pointer group overflow-hidden
                                    ${selectedDate === day
                                        ? "bg-purple-500/20 border-purple-500/50"
                                        : hasOverdue
                                            ? "bg-red-500/10 border-red-500/30"
                                            : hasPayment
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-[#0B0B15]/50 border-white/5 hover:border-white/10"}
                                    ${isToday ? "ring-1 ring-purple-500" : ""}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-xs font-bold ${isToday ? "text-purple-400" : "text-gray-400"}`}>{day}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-0.5">
                                            {dayEvents.slice(0, 3).map((e, idx) => (
                                                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getStatusColor(e.status)}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-1 space-y-0.5 overflow-hidden">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div key={event.id} className="flex items-center gap-1 px-1 py-0.5 rounded bg-white/5 overflow-hidden">
                                            <span className="flex-shrink-0">{getTypeIcon(event.type)}</span>
                                            <span className="text-[8px] text-gray-300 truncate">{event.title.replace(/^[📅⏰💰📥]\s*/, '').substring(0, 10)}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-[8px] text-gray-500 truncate">+{dayEvents.length - 2} more</div>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(day); setIsAddModalOpen(true); }}
                                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-white/80 text-black transition-all"
                                >
                                    <Plus size={8} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-72 flex flex-col gap-4">
                {/* Legend */}
                <div className="p-4 rounded-2xl bg-[#0B0B15]/50 border border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Event Types</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2"><Clock size={12} className="text-orange-400" /><span className="text-gray-300">Deadlines</span></div>
                        <div className="flex items-center gap-2"><FileCheck size={12} className="text-blue-400" /><span className="text-gray-300">Submissions</span></div>
                        <div className="flex items-center gap-2"><DollarSign size={12} className="text-emerald-400" /><span className="text-gray-300">Payments</span></div>
                    </div>
                </div>

                {/* Quick Add */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                    <h3 className="text-sm font-bold mb-1">Add Custom Event</h3>
                    <p className="text-xs text-purple-100 opacity-80 mb-3">Schedule content or reminders</p>
                    <button onClick={() => setIsAddModalOpen(true)} className="w-full py-2 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors">
                        + Add Event
                    </button>
                </div>

                {/* Selected Date Events */}
                <div className="flex-1 glass-panel rounded-2xl p-4 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        {selectedDate ? `${monthNames[currentDate.getMonth()]} ${selectedDate}` : "All Events"}
                    </h3>
                    <div className="space-y-2">
                        {(selectedDate ? getEventsForDay(selectedDate) : allEvents.slice(0, 10)).map(event => (
                            <div key={event.id} className="p-3 rounded-xl bg-[#0B0B15] border border-white/5 hover:border-purple-500/30 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    {getTypeIcon(event.type)}
                                    <span className="text-xs font-bold text-white truncate">{event.title}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-gray-500">{event.platform}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(event.status)}/20 text-white`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {selectedDate && getEventsForDay(selectedDate).length === 0 && (
                            <div className="text-center py-6 text-gray-500 text-xs">No events</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-[#0B0B15] border border-white/10 rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Add Event</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} placeholder="Event title" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" autoFocus />
                                <div className="flex gap-2">
                                    {["Instagram", "YouTube", "TikTok", "X (Twitter)"].map(p => (
                                        <button key={p} onClick={() => setNewEventPlatform(p)} className={`flex-1 p-2 rounded-lg text-xs font-bold ${newEventPlatform === p ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                                            {p.substring(0, 2)}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleAddEvent} disabled={!newEventTitle} className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                                    Save Event
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle
};

const colorMap = {
    success: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        glow: 'shadow-emerald-500/20'
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        glow: 'shadow-red-500/20'
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        glow: 'shadow-blue-500/20'
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        icon: 'text-yellow-400',
        glow: 'shadow-yellow-500/20'
    }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto remove
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, toast.duration || 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => {
                        const Icon = iconMap[toast.type];
                        const colors = colorMap[toast.type];

                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className={cn(
                                    "pointer-events-auto min-w-[320px] max-w-[420px] rounded-2xl border backdrop-blur-xl p-4 shadow-xl",
                                    colors.bg,
                                    colors.border,
                                    colors.glow
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                                        <Icon className={cn("w-5 h-5", colors.icon)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm">{toast.title}</h4>
                                        {toast.message && (
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{toast.message}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <motion.div
                                    className={cn("absolute bottom-0 left-0 h-1 rounded-b-2xl", colors.icon.replace('text-', 'bg-'))}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

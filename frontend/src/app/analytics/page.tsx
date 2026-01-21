"use client";

import { Suspense, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsView } from "@/components/AnalyticsView";

function AnalyticsContent() {
    const [role, setRole] = useState<'brand' | 'creator'>('brand');

    useEffect(() => {
        const storedRole = localStorage.getItem('user-role');
        if (storedRole === 'creator' || storedRole === 'brand') {
            setRole(storedRole);
        }
    }, []);

    return <AnalyticsView role={role} />;
}

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <Suspense fallback={<div className="text-gray-500">Loading analytics...</div>}>
                    <AnalyticsContent />
                </Suspense>
            </div>
        </DashboardLayout>
    );
}

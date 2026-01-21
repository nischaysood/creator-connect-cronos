"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContentCalendar } from "@/components/ContentCalendar";

export default function CalendarPage() {
    const [role, setRole] = useState<'brand' | 'creator'>('brand');

    useEffect(() => {
        const storedRole = localStorage.getItem('user-role');
        if (storedRole === 'creator' || storedRole === 'brand') {
            setRole(storedRole);
        }
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-4">
                <ContentCalendar role={role} />
            </div>
        </DashboardLayout>
    );
}

"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SettingsView } from "@/components/SettingsView";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <SettingsView />
            </div>
        </DashboardLayout>
    );
}

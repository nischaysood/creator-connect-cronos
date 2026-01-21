"use client";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function HelpPage() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Help & Support</h1>
                <p className="text-muted-foreground">Get assistance with the platform.</p>
                <div className="p-12 border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-muted-foreground">
                    Help articles coming soon...
                </div>
            </div>
        </DashboardLayout>
    );
}

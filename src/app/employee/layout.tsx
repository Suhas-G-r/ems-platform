"use client";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar role="EMPLOYEE" />
            <main style={{ flex: 1, padding: "0 3rem 3rem 3rem", position: "relative", minWidth: 0 }}>
                <TopNav />
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}

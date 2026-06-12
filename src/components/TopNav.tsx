"use client";
import Link from "next/link";
import { Home } from 'lucide-react';
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";

export default function TopNav() {

    return (
        <header style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 0",
            marginBottom: "2.5rem",
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "var(--background)",
            opacity: 0.95,
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--glass-border)",
            margin: "0 -3rem 2.5rem -3rem",
            paddingInline: "3rem",
            gap: "2rem",
            transition: "all 0.3s ease"
        }}>
            <Link href="/" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.1rem",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "white",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s"
            }}>
                <Home size={18} />
                Home
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", width: "100%", maxWidth: "750px", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: "450px" }}>
                    <GlobalSearch />
                </div>

                <NotificationBell />
            </div>

        </header >
    );
}



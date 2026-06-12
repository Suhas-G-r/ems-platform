"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ExplorePage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
            title: "Advanced Dashboard",
            description: "Real-time analytics for both admins and employees. Track productivity, task progress, and team availability at a glance.",
            image: "📊",
            accent: "#6366f1"
        },
        {
            title: "Automated Attendance",
            description: "Say goodbye to manual logs. Geofencing and AI-driven attendance tracking ensure accuracy and prevent time theft.",
            image: "⏰",
            accent: "#f59e0b"
        },
        {
            title: "Task Management 2.0",
            description: "Smart task allocation based on employee skills and workload. Track deadlines, status updates, and blockers effortlessly.",
            image: "📋",
            accent: "#10b981"
        },
        {
            title: "Internal Communication",
            description: "Direct messaging and department-wide announcements built-in. Keep everyone aligned without leaving the platform.",
            image: "💬",
            accent: "#ec4899"
        },
        {
            title: "Leave & Correction Requests",
            description: "Streamlined request flows for leaves, WFH, and attendance corrections. Admins get instant notifications for quick approvals.",
            image: "📝",
            accent: "#8b5cf6"
        },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0c", color: "white", fontFamily: "'Inter', sans-serif" }}>
            {/* Nav */}
            <nav style={{
                padding: "1.5rem 5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 1000,
                background: scrolled ? "rgba(10, 10, 12, 0.8)" : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                transition: "all 0.4s ease",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}>
                <Link href="/" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#c084fc", letterSpacing: "-1px", textDecoration: "none" }}>
                    EMS
                </Link>

                <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
                    <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Home</Link>
                    <Link href="/about" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>About</Link>
                    <Link href="/contact" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Contact</Link>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <Link href="/login" style={{ color: "white", textDecoration: "none", fontWeight: 700 }}>Login</Link>
                    <Link href="/signup" style={{
                        background: "#6366f1",
                        color: "white",
                        padding: "0.8rem 1.5rem",
                        borderRadius: "10px",
                        fontWeight: 700,
                        textDecoration: "none"
                    }}>Sign Up</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "12rem 5rem 6rem 5rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "5rem", fontWeight: 900, marginBottom: "1.5rem", background: "linear-gradient(to right, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Explore the Future of Work
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1.3rem", maxWidth: "800px", margin: "0 auto 4rem auto", lineHeight: 1.6 }}>
                    A comprehensive suite of tools designed to synchronize your entire team. From attendance to assignments, we've got you covered.
                </p>
            </section>

            {/* Features Grid */}
            <section style={{ padding: "0 5rem 10rem 5rem", maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2.5rem" }}>
                    {features.map((f, i) => (
                        <div key={i} className="glass" style={{
                            padding: "3rem",
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            transition: "all 0.3s ease",
                            cursor: "default"
                        }}>
                            <div style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "16px",
                                background: `${f.accent}22`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem",
                                marginBottom: "2rem",
                                border: `1px solid ${f.accent}44`
                            }}>
                                {f.image}
                            </div>
                            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>{f.title}</h3>
                            <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "1.1rem" }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: "10rem 5rem", textAlign: "center", background: "linear-gradient(to bottom, #0a0a0c, #1a1a2e)" }}>
                <div style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    padding: "5rem",
                    background: "rgba(99, 102, 241, 0.05)",
                    borderRadius: "40px",
                    border: "1px solid rgba(99, 102, 241, 0.1)"
                }}>
                    <h2 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "1.5rem" }}>Ready to transform your workflow?</h2>
                    <p style={{ color: "#94a3b8", fontSize: "1.2rem", marginBottom: "3rem" }}>Join 500+ companies already scaling with Intelligent EMS.</p>
                    <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
                        <Link href="/signup" style={{
                            padding: "1.2rem 3rem",
                            background: "linear-gradient(to right, #f97316, #ea580c)",
                            color: "white",
                            borderRadius: "14px",
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            textDecoration: "none",
                            boxShadow: "0 10px 20px rgba(249, 115, 22, 0.3)"
                        }}>Get Started for Free</Link>
                        <Link href="/contact" style={{
                            padding: "1.2rem 3rem",
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                            borderRadius: "14px",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1px solid rgba(255,255,255,0.1)"
                        }}>Book a Demo</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

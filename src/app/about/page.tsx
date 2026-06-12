"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: "120px", paddingBottom: "10rem" }}>

                {/* Hero Section */}
                <section className="container animate-fade-in" style={{ textAlign: "center", marginBottom: "8rem" }}>
                    <h1 className="text-gradient" style={{ fontSize: "4.5rem", fontWeight: 900, marginBottom: "2rem", letterSpacing: "-2px" }}>
                        About EMS
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.3rem", maxWidth: "900px", margin: "0 auto", lineHeight: 1.7 }}>
                        We are dedicated to transforming how businesses manage their most valuable asset: their people.
                        By leveraging Artificial Intelligence, EMS removes the friction from daily operations and empowers modern teams to scale faster.
                    </p>
                </section>

                {/* Mission / Vision Grid */}
                <section className="container" style={{ marginBottom: "10rem" }}>
                    <div className="grid-cols-2">
                        <div className="card glass" style={{ padding: "4rem" }}>
                            <div style={{ background: "rgba(99, 102, 241, 0.1)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                                <span style={{ fontSize: "1.5rem" }}>🎯</span>
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.5rem", color: "white" }}>Our Mission</h2>
                            <p style={{ lineHeight: "1.8", color: "#94a3b8", fontSize: "1.1rem" }}>
                                To empower organizations with tools that foster transparency, efficiency, and employee well-being.
                                We believe that administrative tasks should never get in the way of meaningful work.
                            </p>
                        </div>
                        <div className="card glass" style={{ padding: "4rem" }}>
                            <div style={{ background: "rgba(192, 132, 252, 0.1)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", border: "1px solid rgba(192, 132, 252, 0.2)" }}>
                                <span style={{ fontSize: "1.5rem" }}>🔮</span>
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.5rem", color: "white" }}>Our Vision</h2>
                            <p style={{ lineHeight: "1.8", color: "#94a3b8", fontSize: "1.1rem" }}>
                                A world where workplace management is invisible, intelligent, and intuitive.
                                Where AI assistants handle the scheduling, and humans handle the creativity.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Deep Dive */}
                <section className="container">
                    <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                        <h2 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "1rem" }}>Why Choose EMS?</h2>
                        <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Designed for the modern, high-growth enterprise.</p>
                    </div>

                    <div className="grid-cols-3">
                        {[
                            {
                                icon: "🧠",
                                title: "Intelligent Automation",
                                desc: "Our AI engines analyze work patterns to suggest optimal schedules and flag potential burnout before it happens.",
                                accent: "rgba(99, 102, 241, 0.1)"
                            },
                            {
                                icon: "🛡️",
                                title: "Enterprise Security",
                                desc: "Encrypted data, role-based access control (RBAC), and SOC2 compliance standards to keep your HR data safe.",
                                accent: "rgba(34, 197, 94, 0.1)"
                            },
                            {
                                icon: "🚀",
                                title: "Scalable Architecture",
                                desc: "Whether you have 10 employees or 10,000, EMS scales with you. Built on modern cloud technologies for maximum uptime.",
                                accent: "rgba(249, 115, 22, 0.1)"
                            }
                        ].map((f, i) => (
                            <div key={i} className="card glass" style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: "2.5rem", background: f.accent, width: "70px", height: "70px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{f.title}</h3>
                                <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "1rem" }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}

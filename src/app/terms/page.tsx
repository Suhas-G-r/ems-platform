"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Scale, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <Navbar />

            <main style={{ paddingTop: "10rem", paddingBottom: "10rem", maxWidth: "1000px", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                <div className="animate-fade-in">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", color: "#f97316" }}>
                        <Scale size={32} />
                        <h1 style={{ fontSize: "3.5rem", fontWeight: 900, color: "white" }}>Terms of Service</h1>
                    </div>

                    <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "4rem", lineHeight: 1.6 }}>
                        By using the EMS platform, you agree to abide by the following terms and conditions. Please read them carefully.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <CheckCircle size={24} color="#f97316" /> User Responsibility
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    Users are responsible for maintaining the confidentiality of their login credentials. Any activity performed under your account is your responsibility. Employees must provide accurate attendance data and task updates.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <AlertCircle size={24} color="#f97316" /> Acceptable Use
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    The platform must be used solely for legitimate business purposes. Unauthorized attempts to access other users' data, exploit system vulnerabilities, or use the platform for non-work-related activities are strictly prohibited.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <ShieldAlert size={24} color="#f97316" /> Account Termination
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    We reserve the right to suspend or terminate access to the platform for any user who violates these terms or engages in fraudulent activity. Organizations are responsible for managing their internal user access levels.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

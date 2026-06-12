"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText, Scale, Info } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <Navbar />

            <main style={{ paddingTop: "10rem", paddingBottom: "10rem", maxWidth: "1000px", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                <div className="animate-fade-in">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", color: "#818cf8" }}>
                        <Shield size={32} />
                        <h1 style={{ fontSize: "3.5rem", fontWeight: 900, color: "white" }}>Privacy Policy</h1>
                    </div>

                    <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "4rem", lineHeight: 1.6 }}>
                        At EMS, we take your privacy seriously. This policy describes how we collect, use, and protect your personal data when you use our Employee Management System.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Eye size={24} color="#818cf8" /> Data Collection
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    We collect information necessary for workforce management, including:
                                    <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <li>• Personal details (Name, Email, Phone Number)</li>
                                        <li>• Professional data (Role, Department, Join Date)</li>
                                        <li>• Activity logs (Attendance timestamps, Task progress)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Lock size={24} color="#818cf8" /> Data Security
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    Your data is encrypted both in transit and at rest. We implement industry-standard security protocols to ensure that only authorized personnel have access to sensitive employee information. We never sell your data to third parties.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Info size={24} color="#818cf8" /> Your Rights
                            </h2>
                            <div className="glass" style={{ padding: "2rem", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                                    Employees have the right to access their data, request corrections to personal information, and receive transparency regarding how their attendance and performance metrics are utilized within the organization.
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

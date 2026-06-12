"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactPage() {
    const router = useRouter();
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "white",
        fontSize: "0.95rem",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.6rem",
        color: "#94a3b8",
        fontSize: "0.9rem",
        fontWeight: 600
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", background: "#0a0a0c" }}>
            <div className="glass animate-fade-in" style={{ width: "100%", maxWidth: "600px", padding: "3.5rem", borderRadius: "24px", position: "relative" }}>

                {/* Navigation Buttons */}
                <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", display: "flex", gap: "1rem" }}>
                    <Link href="/" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#94a3b8",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        transition: "color 0.2s"
                    }}
                        onMouseOver={(e) => e.currentTarget.style.color = "white"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        🏠 Home
                    </Link>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: "none",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            padding: 0,
                            transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "white"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        🔙 Back
                    </button>
                </div>

                <h1 style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    textAlign: "center",
                    marginBottom: "1rem",
                    background: "linear-gradient(to right, #fff, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Book a Demo
                </h1>
                <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "3rem", fontSize: "1.1rem" }}>
                    Experience the future of workforce management firsthand.
                </p>

                {sent ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📅</div>
                        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Request Received!</h2>
                        <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                            Our team will contact you shortly at your provided email to schedule a personalized walkthrough.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                                padding: "0.8rem 2rem",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: 700
                            }}
                        >
                            Back to Form
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input required type="text" placeholder="Enter your first name" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input required type="text" placeholder="Enter your last name" style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input required type="email" placeholder="Enter your email address" style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Message / Requirements</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Enter your message or specific needs..."
                                style={{ ...inputStyle, resize: "none" }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: "1rem",
                                padding: "1.2rem",
                                background: "linear-gradient(to right, #f97316, #ea580c)",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "1.1rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            Book Demo 🚀
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
    const Logo = () => (
        <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            transition: "transform 0.2s"
        }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(249, 115, 22, 0.2)"
            }}>
                <ShieldCheck color="white" size={24} />
            </div>
            <span style={{
                fontSize: "1.8rem",
                fontWeight: 950,
                color: "var(--foreground)",
                letterSpacing: "-1.5px",
                background: "linear-gradient(to right, var(--foreground), var(--secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
            }}>
                EMS<span style={{ color: "#f97316", WebkitTextFillColor: "#f97316" }}>.</span>
            </span>
        </Link>
    );

    return (
        <nav style={{
            padding: "1rem 5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1000,
            background: "var(--background)",
            opacity: 0.95,
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--glass-border)",
            transition: "all 0.3s ease"
        }}>
            <div style={{ flex: 2, display: "flex", alignItems: "center", gap: "2rem", justifyContent: "flex-start" }}>
                <Logo />
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginLeft: "2rem" }}>
                    <Link href="/signup" style={{
                        background: "var(--primary)",
                        color: "white",
                        textDecoration: "none",
                        padding: "0.6rem 1.8rem",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        boxShadow: "0 6px 15px rgba(249, 115, 22, 0.2)",
                        transition: "all 0.3s ease"
                    }} onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(249, 115, 22, 0.3)";
                    }} onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 6px 15px rgba(249, 115, 22, 0.2)";
                    }}>
                        Sign up
                    </Link>
                    <Link href="/login" style={{ color: "var(--foreground)", textDecoration: "none", fontWeight: 800, fontSize: "0.95rem", opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = "1"} onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}>Login</Link>
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", gap: "3rem", alignItems: "center", justifyContent: "flex-end" }}>
                {["Home", "About", "Contact"].map((item) => (
                    <Link
                        key={item}
                        href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                        style={{
                            color: "var(--foreground)",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            opacity: 0.7,
                            transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseOut={(e) => e.currentTarget.style.opacity = "0.7"}
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

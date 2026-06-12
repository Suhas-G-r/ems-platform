"use client";

import { useEffect, useState } from "react";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: "success" | "error";
}

export default function StatusModal({ isOpen, onClose, title, message, type }: StatusModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for fade out animation
    };

    if (!isOpen && !show) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(12px)",
            zIndex: 1000, padding: "2rem",
            opacity: show ? 1 : 0, transition: "opacity 0.3s ease",
        }}>
            <div className="card glass animate-fade-in" style={{
                maxWidth: "400px", width: "100%", padding: "2.5rem 2rem",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                textAlign: "center", border: `1px solid ${type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                transform: show ? "scale(1)" : "scale(0.95)", transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: "rgba(15, 23, 42, 0.95)",
                position: "relative",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
                {/* Close (Cross) Button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: "absolute", top: "1rem", right: "1rem",
                        background: "rgba(255,255,255,0.05)", border: "none", color: "#94a3b8",
                        cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.color = "#94a3b8";
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Animated Icon */}
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1.5rem",
                    border: `1px solid ${type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                    boxShadow: `0 0 30px ${type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}`,
                }}>
                    {type === "success" ? (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                </div>

                <h3 className="text-gradient" style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", width: "100%" }}>
                    {title}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: "1.5", marginBottom: "2rem", maxWidth: "90%" }}>
                    {message}
                </p>

                <button
                    onClick={handleClose}
                    className="btn btn-primary"
                    style={{
                        width: "100%", padding: "0.9rem",
                        background: type === "success" ? "#10b981" : "#ef4444",
                        fontSize: "1rem", fontWeight: 700, borderRadius: "14px",
                        border: "none", color: "white", cursor: "pointer",
                        boxShadow: `0 10px 20px -5px ${type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                    }}
                >
                    {type === "success" ? "Continue" : "Got it"}
                </button>
            </div>
        </div>
    );
}

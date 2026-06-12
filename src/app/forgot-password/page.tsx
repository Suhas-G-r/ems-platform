"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusModal from "@/components/StatusModal";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: Success
    const [email, setEmail] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });

    const handleCheckEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/auth/reset-password?email=${email}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Email not found");

            setSecurityQuestion(data.question);
            setStep(2);
        } catch (err: any) {
            setModal({
                isOpen: true,
                title: "Error",
                message: err.message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    securityAnswer,
                    newPassword
                }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Reset failed");

            setModal({
                isOpen: true,
                title: "Password Reset!",
                message: "Your password has been updated successfully. You can now login with your new password.",
                type: "success"
            });
            setStep(3);
        } catch (err: any) {
            setModal({
                isOpen: true,
                title: "Error",
                message: err.message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "white",
        fontSize: "0.95rem",
        outline: "none",
        marginTop: "0.5rem"
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--background)" }}>
            <div className="card glass animate-fade-in" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <h1 className="text-gradient" style={{ fontSize: "2rem", marginBottom: "0.5rem", fontWeight: "bold" }}>Reset Password</h1>
                    <p style={{ color: "var(--text-muted)" }}>
                        {step === 1 ? "Enter your email to get started" : "Verify your identity"}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleCheckEmail}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                            {loading ? "Checking..." : "Continue"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <p style={{ fontSize: "0.9rem", color: "var(--primary)", marginBottom: "0.5rem", fontWeight: 600 }}>Security Question:</p>
                            <p style={{ color: "white", fontSize: "1.1rem" }}>{securityQuestion}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Your Answer</label>
                            <input
                                type="text"
                                required
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                placeholder="Enter your answer"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                            {loading ? "Resetting..." : "Update Password"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div style={{ textAlign: "center" }}>
                        <Link href="/login" className="btn btn-primary" style={{ display: "inline-block", padding: "1rem 2rem", textDecoration: "none" }}>
                            Go to Login
                        </Link>
                    </div>
                )}

                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <Link href="/login" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>

            <StatusModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
}

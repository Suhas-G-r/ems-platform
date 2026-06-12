"use client";

import { useEffect, useState } from "react";
import { Trash2, AlertTriangle, Loader2, CheckCircle2, Eye, EyeOff, Lock, X, Info } from "lucide-react";

interface DeletionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export default function DeletionManagementModal({ isOpen, onClose, userId, userName, onSuccess }: DeletionManagementModalProps) {
    const [step, setStep] = useState<"preview" | "confirm" | "processing" | "done">("preview");
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);
    const [adminUser, setAdminUser] = useState<any>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchPreview();
            const userData = localStorage.getItem("user");
            if (userData) setAdminUser(JSON.parse(userData));
        } else {
            setStep("preview");
            setPreview(null);
            setResult(null);
            setPassword("");
            setError("");
        }
    }, [isOpen, userId]);

    const fetchPreview = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/users/deletion-preview/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setPreview(data);
        } catch (error) {
            console.error("Preview failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!password) {
            setError("Admin password is required");
            return;
        }

        try {
            setStep("processing");
            setError("");
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setResult(data);
                setStep("done");
                setTimeout(onSuccess, 2000);
            } else {
                setError(data.error || "Deletion failed");
                setStep("confirm");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setError("A network error occurred");
            setStep("confirm");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem"
        }}>
            <div className="card glass animate-fade-in" style={{
                maxWidth: "540px", width: "100%", borderRadius: "32px",
                overflow: "hidden", display: "flex", flexDirection: "column",
                background: "rgba(10, 10, 20, 0.98)", border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
                {/* Header */}
                <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ padding: "0.6rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Permanent Removal</h2>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={20} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: "2rem", flex: 1 }}>

                    {step === "preview" && (
                        <div className="animate-fade-in">
                            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "20px", padding: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
                                <AlertTriangle color="#ef4444" size={32} style={{ margin: "0 auto 1rem" }} />
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Delete {userName}?</h3>
                                <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.6 }}>
                                    This action is irreversible. All tasks, attendance records, leaves, and notifications associated with this user will be wiped permanently.
                                </p>
                            </div>

                            {loading ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><Loader2 className="animate-spin" color="#818cf8" /></div>
                            ) : preview ? (
                                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "#818cf8", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                                        <Info size={14} /> Data Impact Summary
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        {[
                                            { label: "Active Tasks", value: preview.dataToDelete.totalTasks },
                                            { label: "Attendance Logs", value: preview.dataToDelete.attendanceRecords },
                                            { label: "Leave Requests", value: preview.dataToDelete.leaveRequests },
                                            { label: "Notifications", value: preview.dataToDelete.notifications }
                                        ].map((stat, i) => (
                                            <div key={i}>
                                                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>{stat.label}</div>
                                                <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {step === "confirm" && (
                        <div className="animate-fade-in">
                            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                                <Lock size={32} color="#818cf8" style={{ marginBottom: "1rem" }} />
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Admin Verification</h3>
                                <p style={{ fontSize: "0.95rem", color: "#94a3b8" }}>
                                    Confirm as <strong>{adminUser?.name || 'Admin'}</strong>.
                                    Please enter your password to delete {userName}.
                                </p>
                            </div>

                            <div style={{ position: "relative" }}>
                                {/* Hidden fields to catch browser autofill and prevent it from hitting GlobalSearch */}
                                <input
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    defaultValue={adminUser?.email || ""}
                                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Confirm Your Admin Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: "100%", padding: "1.2rem", borderRadius: "16px",
                                        background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                                        color: "white", outline: "none", fontSize: "1rem", transition: "all 0.2s"
                                    }}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600, textAlign: "center" }}>{error}</p>}
                        </div>
                    )}

                    {step === "processing" && (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <Loader2 className="animate-spin" size={40} color="#ef4444" style={{ marginBottom: "1.5rem" }} />
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Wiping User Data</h3>
                            <p style={{ color: "#94a3b8" }}>Removing all associated records from the system...</p>
                        </div>
                    )}

                    {step === "done" && (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                                <CheckCircle2 size={32} color="#10b981" />
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Record Deleted</h3>
                            <p style={{ color: "#94a3b8" }}>Everything related to {userName} has been permanently removed.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "1.5rem 2rem", background: "rgba(255,255,255,0.02)", display: "flex", gap: "1rem" }}>
                    {step === "preview" && (
                        <>
                            <button onClick={onClose} style={{ flex: 1, padding: "1rem", borderRadius: "14px", background: "transparent", color: "#94a3b8", fontWeight: 700, border: "none", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => setStep("confirm")} className="btn btn-primary" style={{ flex: 1, padding: "1rem", borderRadius: "14px", fontWeight: 800, background: "#ef4444" }}>Proceed to Delete</button>
                        </>
                    )}
                    {step === "confirm" && (
                        <>
                            <button onClick={() => setStep("preview")} style={{ flex: 1, padding: "1rem", borderRadius: "14px", background: "transparent", color: "#94a3b8", fontWeight: 700, border: "none", cursor: "pointer" }}>Back</button>
                            <button
                                onClick={handleDelete}
                                style={{ flex: 1, padding: "1rem", borderRadius: "14px", background: "#ef4444", color: "white", fontWeight: 800, border: "none", boxShadow: "0 10px 20px -5px rgba(239, 68, 68, 0.3)", cursor: "pointer" }}
                            >
                                Confirm Hard Delete
                            </button>
                        </>
                    )}
                    {step === "done" && (
                        <button onClick={onClose} className="btn btn-primary" style={{ width: "100%", padding: "1rem", borderRadius: "14px" }}>Close & Refresh</button>
                    )}
                </div>
            </div>
        </div>
    );
}

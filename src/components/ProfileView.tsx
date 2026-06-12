"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import StatusModal from "./StatusModal";
import { User, Shield, History, Mail, Phone, MapPin, Calendar as CalendarIcon, Save, X as CloseIcon, Key, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileViewProps {
    role: "ADMIN" | "EMPLOYEE";
}

export default function ProfileView({ role }: ProfileViewProps) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "history">("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [workHistory, setWorkHistory] = useState<any>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Form data for profile
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        dob: "",
        gender: "Male"
    });

    // Form data for password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/users/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok && data.user) {
                    const u = data.user;
                    setUser(u);
                    setFormData({
                        name: u.name || "",
                        lastName: u.lastName || "",
                        email: u.email || "",
                        phone: u.phone || "",
                        address: u.address || "",
                        city: u.city || "",
                        postalCode: u.postalCode || "",
                        dob: u.dob || "",
                        gender: u.gender || "Male"
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, [router]);

    const fetchWorkHistory = async () => {
        if (workHistory) return; // Only fetch once

        try {
            setHistoryLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/profile/work-history?months=12", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setWorkHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch work history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchWorkHistory();
        }
    }, [activeTab]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/profile/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setModal({
                    isOpen: true,
                    title: "Profile Updated",
                    message: "Your changes have been saved successfully.",
                    type: "success"
                });
                setIsEditing(false);
            } else {
                const data = await res.json();
                setModal({
                    isOpen: true,
                    title: "Update Failed",
                    message: data.error || "Something went wrong.",
                    type: "error"
                });
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Error",
                message: "Failed to connect to the server.",
                type: "error"
            });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setModal({
                isOpen: true,
                title: "Validation Error",
                message: "New passwords do not match.",
                type: "error"
            });
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/profile/change-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (res.ok) {
                setModal({
                    isOpen: true,
                    title: "Password Changed",
                    message: "Your password has been successfully updated.",
                    type: "success"
                });
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                const data = await res.json();
                setModal({
                    isOpen: true,
                    title: "Update Failed",
                    message: data.error || "Failed to update password.",
                    type: "error"
                });
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Error",
                message: "Failed to connect to the server.",
                type: "error"
            });
        }
    };

    if (!user) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>Loading...</div>;

    const inputStyle = {
        width: "100%",
        padding: "1rem",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.02)",
        color: "white",
        fontSize: "1rem",
        outline: "none",
        transition: "all 0.2s ease"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.6rem",
        color: "#818cf8",
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase" as "uppercase",
        letterSpacing: "0.05em"
    };

    const tabStyle = (tab: typeof activeTab) => ({
        padding: "1rem 2rem",
        fontSize: "1rem",
        fontWeight: 700,
        cursor: "pointer",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "all 0.2s ease",
        background: activeTab === tab ? "rgba(99, 102, 241, 0.15)" : "transparent",
        color: activeTab === tab ? "#818cf8" : "#94a3b8",
        border: activeTab === tab ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <div style={{ width: "100px", height: "100px", borderRadius: "30px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 800, color: "white", boxShadow: "0 15px 30px -10px rgba(99, 102, 241, 0.5)" }}>
                        {formData.name.charAt(0).toUpperCase()}{formData.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>{formData.name} {formData.lastName}</h1>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <span style={{ background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 700 }}>{user.role}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Employee Profile & Self-Service</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.03)", padding: "0.5rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <button onClick={() => setActiveTab("profile")} style={tabStyle("profile")}>
                        <User size={18} /> Profile
                    </button>
                    <button onClick={() => setActiveTab("security")} style={tabStyle("security")}>
                        <Shield size={18} /> Security
                    </button>
                    {role === "EMPLOYEE" && (
                        <button onClick={() => setActiveTab("history")} style={tabStyle("history")}>
                            <History size={18} /> Work History
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="card glass" style={{ borderRadius: "32px", padding: "3rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="animate-fade-in">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Personal Information</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn glass" style={{ padding: "0.8rem 2rem", borderRadius: "14px", color: "white", fontSize: "0.9rem" }}>
                                    Edit Details
                                </button>
                            ) : (
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button onClick={() => setIsEditing(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", padding: "0.8rem 1.5rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                                    <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: "0.8rem 2.5rem", borderRadius: "14px", fontSize: "0.9rem" }}>Save Changes</button>
                                </div>
                            )}
                        </div>

                        <form style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>First Name</label><input style={inputStyle} value={formData.name} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Last Name</label><input style={inputStyle} value={formData.lastName} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Date of Birth</label><input type="date" style={inputStyle} value={formData.dob} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} /></div>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Gender</label>
                                    <select style={{ ...inputStyle, background: isEditing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)" }} value={formData.gender} disabled={!isEditing} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="Male" style={{ color: "black" }}>Male</option>
                                        <option value="Female" style={{ color: "black" }}>Female</option>
                                        <option value="Other" style={{ color: "black" }}>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div style={{ opacity: 0.7 }}><label style={labelStyle}>Email Address (Read-only)</label><input style={{ ...inputStyle, cursor: "not-allowed" }} value={formData.email} readOnly /></div>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Phone Number</label><input style={inputStyle} value={formData.phone} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                                <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Street Address</label><input style={inputStyle} value={formData.address} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>City</label><input style={inputStyle} value={formData.city} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                                    <div style={{ opacity: isEditing ? 1 : 0.7 }}><label style={labelStyle}>Postal Code</label><input style={inputStyle} value={formData.postalCode} readOnly={!isEditing} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} /></div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                    <div className="animate-fade-in" style={{ maxWidth: "600px" }}>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>Security Settings</h2>
                        <p style={{ color: "#94a3b8", marginBottom: "3rem" }}>Manage your account security and password. It's recommended to change your password every 3 months.</p>

                        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div>
                                <label style={labelStyle}>Current Password</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "1rem 0" }}></div>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    placeholder="Min. 8 characters with symbols"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    placeholder="Repeat new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: "2rem", padding: "1.2rem", borderRadius: "16px", fontWeight: 800, fontSize: "1.1rem" }}>
                                Update Password
                            </button>
                        </form>
                    </div>
                )}

                {/* Work History Tab */}
                {activeTab === "history" && role === "EMPLOYEE" && (
                    <div className="animate-fade-in">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>Work History & Activity</h2>
                                <p style={{ color: "#94a3b8" }}>Summary of your contributions and attendance for the last 12 months.</p>
                            </div>
                            {historyLoading && <div style={{ color: "#818cf8", fontWeight: 700, fontSize: "0.9rem" }}>Updating records...</div>}
                        </div>

                        {workHistory ? (
                            <>
                                {/* Monthly Activity Carousel */}
                                <div style={{ marginBottom: "3rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>Monthly Attendance Reports</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }}></span> Present
                                                </span>
                                                <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></span> Leave
                                                </span>
                                                <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span> Absent
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => {
                                                        if (carouselRef.current) carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                                                    }}
                                                    className="btn glass"
                                                    style={{ padding: "0.4rem 0.8rem", borderRadius: "10px", color: "white" }}
                                                >
                                                    &larr;
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (carouselRef.current) carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                                                    }}
                                                    className="btn glass"
                                                    style={{ padding: "0.4rem 0.8rem", borderRadius: "10px", color: "white" }}
                                                >
                                                    &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        ref={carouselRef}
                                        style={{
                                            display: "flex",
                                            gap: "1.5rem",
                                            overflowX: "auto",
                                            paddingBottom: "1.5rem",
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                            scrollSnapType: "x mandatory"
                                        }} className="scroll-container">
                                        {/* Inject CSS to hide scrollbar but keep functionality */}
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            .scroll-container::-webkit-scrollbar { display: none; }
                                        `}} />

                                        {workHistory.monthlyStats && workHistory.monthlyStats.map((stat: any, idx: number) => (
                                            <div key={idx} className="glass" style={{
                                                minWidth: "280px",
                                                padding: "1.5rem",
                                                borderRadius: "24px",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "1rem",
                                                scrollSnapAlign: "start"
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white" }}>{stat.month.split(' ')[0]}</span>
                                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{stat.month.split(' ')[1]}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ height: "8px", width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "100px", overflow: "hidden", display: "flex", opacity: stat.isBeforeJoining ? 0.3 : 1 }}>
                                                    <div style={{ width: `${(stat.present / stat.totalDays) * 100}%`, background: "#22c55e", height: "100%" }}></div>
                                                    <div style={{ width: `${(stat.leaves / stat.totalDays) * 100}%`, background: "#3b82f6", height: "100%" }}></div>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginTop: "0.5rem", opacity: stat.isBeforeJoining ? 0.5 : 1 }}>
                                                    <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "0.8rem", borderRadius: "12px", textAlign: "center" }}>
                                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#22c55e" }}>{stat.present}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "#86efac", fontWeight: 600 }}>Present</div>
                                                    </div>
                                                    <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "0.8rem", borderRadius: "12px", textAlign: "center" }}>
                                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#3b82f6" }}>{stat.leaves}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "#93c5fd", fontWeight: 600 }}>Leave</div>
                                                    </div>
                                                    <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "0.8rem", borderRadius: "12px", textAlign: "center" }}>
                                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ef4444" }}>{stat.absent}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: 600 }}>Absent</div>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
                                                    {stat.isBeforeJoining ? "Not Employed Yet" : `Total Days: ${stat.totalDays}`}
                                                </div>
                                            </div>
                                        ))}

                                        {(!workHistory.monthlyStats || workHistory.monthlyStats.length === 0) && (
                                            <div style={{ color: "#94a3b8", padding: "2rem" }}>No monthly history available yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity List */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                    <div className="glass" style={{ padding: "2rem", borderRadius: "24px" }}>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <CheckCircle2 size={20} color="#10b981" /> Recent Tasks
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {workHistory.tasks.slice(0, 5).map((task: any) => (
                                                <div key={task._id} style={{ padding: "1rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{task.title}</span>
                                                        <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "6px", background: task.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: task.status === 'DONE' ? '#10b981' : '#f59e0b' }}>{task.status}</span>
                                                    </div>
                                                    <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Assigned by {task.assignedBy?.name} • {new Date(task.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                            {workHistory.tasks.length === 0 && <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No task history found.</p>}
                                        </div>
                                    </div>

                                    <div className="glass" style={{ padding: "2rem", borderRadius: "24px" }}>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <Clock size={20} color="#818cf8" /> Recent Attendance
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {workHistory.attendance.slice(0, 5).map((att: any) => (
                                                <div key={att._id} style={{ padding: "1rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                        <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{att.checkIn ? `Check-in: ${att.checkIn}` : 'No record'}</p>
                                                    </div>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: att.status === 'PRESENT' ? '#10b981' : att.status === 'LATE' ? '#f59e0b' : '#ef4444' }}>{att.status}</span>
                                                </div>
                                            ))}
                                            {workHistory.attendance.length === 0 && <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No attendance history found.</p>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>Loading your history logs...</div>
                        )}
                    </div>
                )}
            </div>

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />
        </div>
    );
}

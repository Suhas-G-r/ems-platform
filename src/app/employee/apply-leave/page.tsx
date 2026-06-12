"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusModal from "@/components/StatusModal";
import { Calendar, Clock, PieChart, AlertCircle, CheckCircle2, ChevronDown, Check } from "lucide-react";

interface LeaveRequest {
    _id: string;
    userId: string | { name: string; email: string; avatar?: string };
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    appliedAt: string;
    adminResponse?: string;
    duration?: number;
}

function ApplyLeaveContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        type: "Leave Request",
        startDate: "",
        endDate: "",
        reason: ""
    });
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
        else fetchRequests(token);

        // Scroll to highlighted item
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            setTimeout(() => {
                const element = document.getElementById(`leave-${highlightId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [searchParams]);

    const fetchRequests = async (token: string) => {
        try {
            const res = await fetch("/api/leaves", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setRequests(data.leaveRequests || []);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setModal({
                    isOpen: true,
                    title: "Request Submitted",
                    message: "Your request has been sent for admin approval.",
                    type: "success"
                });
                setFormData({ type: "Leave Request", startDate: "", endDate: "", reason: "" });
                fetchRequests(token!);
                window.dispatchEvent(new Event('notification-created'))
                localStorage.setItem('notification-event', Date.now().toString())
            }
        } catch (error) {
            setModal({ isOpen: true, title: "Error", message: "Failed to submit request.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        return days > 0 ? days : 0;
    };

    const leavesTaken = requests.filter(r => r.status === 'APPROVED').length;
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

    const filteredRequests = requests.filter(req => {
        const query = searchParams.get('q')?.toLowerCase();
        const highlight = searchParams.get('highlight');

        let matchesQuery = true;
        if (query && !highlight) {
            matchesQuery = req.type?.toLowerCase().includes(query) ||
                req.reason?.toLowerCase().includes(query);
        }

        if (filter === "ALL") return matchesQuery;
        return req.status === filter && matchesQuery;
    });

    return (
        <div className="animate-fade-in" style={{ padding: "0 1rem", maxWidth: "1600px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2.5rem", alignItems: "start" }}>
                {/* Form Card */}
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "24px", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Request Leave</h1>
                    <p style={{ color: "#94a3b8", marginBottom: "2.5rem" }}>Submit your leave request for approval.</p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.8rem", color: "#94a3b8", fontSize: "0.95rem", fontWeight: 600 }}>Request Type</label>
                            <div className="custom-select-wrapper" style={{ position: "relative" }}>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", cursor: "pointer", appearance: "none", fontWeight: 600 }}
                                >
                                    <option value="Leave Request" style={{ background: "#1e293b" }}>Leave Request</option>
                                    <option value="Work From Home" style={{ background: "#1e293b" }}>Work From Home</option>
                                    <option value="Punch Correction" style={{ background: "#1e293b" }}>Punch Correction</option>
                                </select>
                                <ChevronDown size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.8rem", color: "#94a3b8", fontSize: "0.95rem", fontWeight: 600 }}>Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.8rem", color: "#94a3b8", fontSize: "0.95rem", fontWeight: 600 }}>End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    min={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        {calculateDays() > 0 && (
                            <div style={{ padding: "0.8rem 1rem", borderRadius: "8px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#818cf8", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Clock size={16} /> Total Duration: {calculateDays()} Days
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", marginBottom: "0.8rem", color: "#94a3b8", fontSize: "0.95rem", fontWeight: 600 }}>Reason</label>
                            <textarea
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Please provide a detailed reason..."
                                style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: 'inherit' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: "100%",
                            padding: "1.1rem",
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "14px",
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            marginTop: "1rem",
                            boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                        }}>
                            {loading ? "Submitting..." : <>Submit Request <Check size={20} /></>}
                        </button>
                    </form>
                </div>

                {/* Requests History */}
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "24px", minHeight: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>My Requests</h2>
                        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "8px" }}>
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        border: "none", background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
                                        color: filter === f ? "white" : "#94a3b8",
                                        padding: "0.4rem 0.8rem", borderRadius: "6px",
                                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                                    }}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {filteredRequests.length === 0 ? (
                            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b", border: "2px dashed rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                                <div style={{ background: "rgba(255,255,255,0.03)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", color: "#64748b" }}>
                                    <AlertCircle size={24} />
                                </div>
                                <p style={{ fontWeight: 600 }}>No requests found</p>
                                <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>You haven&apos;t made any requests in this category yet.</p>
                            </div>
                        ) : (
                            filteredRequests.map((req) => (
                                <div
                                    key={req._id}
                                    id={`leave-${req._id}`}
                                    className={`glass ${searchParams.get('highlight') === req._id ? 'search-highlight' : ''}`}
                                    style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}
                                >
                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: req.status === 'APPROVED' ? '#22c55e' : req.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }} />

                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingLeft: "1rem" }}>
                                        <div>
                                            <h4 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.3rem" }}>{req.type}</h4>
                                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{
                                                fontSize: "0.7rem", padding: "0.3rem 0.8rem", borderRadius: "100px",
                                                background: req.status === 'APPROVED' ? "rgba(34, 197, 94, 0.1)" : req.status === 'REJECTED' ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                color: req.status === 'APPROVED' ? "#22c55e" : req.status === 'REJECTED' ? "#ef4444" : "#f59e0b",
                                                fontWeight: 800, border: "1px solid currentColor", display: "inline-block", marginBottom: "0.5rem"
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ paddingLeft: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "100px", height: "10px", borderRadius: "50%", background: "#6366f1" }} />
                                        <div style={{ flex: 1, height: "2px", background: req.status === 'PENDING' ? "rgba(255,255,255,0.1)" : (req.status === 'APPROVED' ? "#22c55e" : "#ef4444") }} />
                                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: req.status === 'PENDING' ? "rgba(255,255,255,0.1)" : (req.status === 'APPROVED' ? "#22c55e" : "#ef4444") }} />
                                    </div>

                                    {req.adminResponse && (
                                        <div style={{ marginLeft: "1rem", marginTop: "1rem", padding: "1rem", background: "rgba(100, 116, 139, 0.1)", borderRadius: "10px", borderLeft: "2px solid #6366f1" }}>
                                            <p style={{ fontSize: "0.8rem", color: "#818cf8", fontWeight: 700, marginBottom: "0.2rem" }}>ADMIN FEEDBACK</p>
                                            <p style={{ fontSize: "0.9rem", color: "white", fontStyle: "italic" }}>&quot;{req.adminResponse}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fade-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { opacity: 0; transform: translateY(18px); animation: fade-in 0.75s ease-out forwards; }
                    .glass { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
                    .glass:hover { transform: translateY(-2px); box-shadow: 0 28px 52px rgba(0, 0, 0, 0.18); }
                `
            }} />
        </div>
    );
}

export default function ApplyLeave() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "white" }}>
                Loading...
            </div>
        }>
            <ApplyLeaveContent />
        </Suspense>
    );
}

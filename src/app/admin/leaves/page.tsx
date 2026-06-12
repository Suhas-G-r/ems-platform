"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusModal from "@/components/StatusModal";
import { Check, X, Filter, ChevronDown, Search, CheckCircle2, XCircle, Clock, Calendar, AlertCircle } from "lucide-react";

interface LeaveRequest {
    _id: string;
    userId: { name: string; email: string; avatar?: string; department?: string };
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    appliedAt: string;
    adminResponse?: string;
    duration?: number;
}

function AdminLeavesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });

    const [actionModal, setActionModal] = useState({
        isOpen: false,
        requestId: "",
        status: "",
        response: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
        else fetchLeaves(token);

        // Auto-expand highlighted item
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            setExpandedId(highlightId);
            // Optional: scroll to it
            setTimeout(() => {
                const element = document.getElementById(`leave-${highlightId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [searchParams]);

    const fetchLeaves = async (token: string) => {
        try {
            const res = await fetch("/api/leaves", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setRequests(data.leaveRequests || []);
        } catch (error) {
            console.error("Failed to fetch leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (requestId: string, status: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expansion
        setActionModal({ isOpen: true, requestId, status, response: "" });
    };

    const submitAction = async () => {
        const { requestId, status, response } = actionModal;
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/leaves", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ requestId, status, adminResponse: response })
            });

            if (res.ok) {
                setActionModal({ ...actionModal, isOpen: false });
                setModal({
                    isOpen: true,
                    title: "Success",
                    message: `Request ${status.toLowerCase()} successfully.`,
                    type: "success"
                });
                fetchLeaves(token!);
            }
        } catch (error) {
            setModal({ isOpen: true, title: "Error", message: "Update failed.", type: "error" });
        }
    };

    // Derived Stats
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
    const totalCount = requests.length;

    const filteredRequests = requests.filter(req => {
        const query = searchParams.get('q')?.toLowerCase();
        const highlight = searchParams.get('highlight');

        let matchesQuery = true;
        if (query && !highlight) {
            matchesQuery = req.userId?.name?.toLowerCase().includes(query) ||
                req.type?.toLowerCase().includes(query) ||
                req.reason?.toLowerCase().includes(query);
        }

        if (filter === "ALL") return matchesQuery;
        return req.status === filter && matchesQuery;
    });

    return (
        <div className="animate-fade-in" style={{ padding: "1rem", maxWidth: "1600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <h1 className="dashboard-title" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>Review Applications</h1>
                <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Overview of employee leave and correction requests.</p>
            </header>

            {/* Top Decision Dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                {[
                    { title: "Pending Review", value: pendingCount, color: "#f59e0b", icon: <Clock size={24} /> },
                    { title: "Approved Total", value: approvedCount, color: "#22c55e", icon: <CheckCircle2 size={24} /> },
                    { title: "Rejected Total", value: rejectedCount, color: "#ef4444", icon: <XCircle size={24} /> },
                    { title: "Total Requests", value: totalCount, color: "#6366f1", icon: <Filter size={24} /> },
                ].map((stat, i) => (
                    <div key={i} className="glass" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ padding: "1rem", borderRadius: "16px", background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.3rem" }}>{stat.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Filter Tabs */}
            <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: "none", border: "none", padding: "0.5rem 1rem",
                            color: filter === f ? "white" : "#94a3b8",
                            fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                            position: "relative",
                            opacity: filter === f ? 1 : 0.6,
                            transition: "all 0.2s"
                        }}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                        {filter === f && <div style={{ position: "absolute", bottom: "-1rem", left: 0, width: "100%", height: "3px", background: "#6366f1", borderRadius: "10px 10px 0 0" }} />}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {loading ? (
                    <div className="glass" style={{ padding: "4rem", textAlign: "center", borderRadius: "16px" }}>Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="glass" style={{ padding: "5rem", textAlign: "center", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto", color: "#64748b" }}>
                            <Search size={32} />
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No requests found in this category.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div
                            key={req._id}
                            id={`leave-${req._id}`}
                            onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                            className={`glass ${searchParams.get('highlight') === req._id ? 'search-highlight' : ''}`}
                            style={{
                                padding: "2rem", borderRadius: "24px",
                                cursor: "pointer", transition: "all 0.3s ease",
                                border: expandedId === req._id ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                                background: expandedId === req._id ? "rgba(30, 41, 59, 0.7)" : "rgba(30, 41, 59, 0.4)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.4rem", boxShadow: "0 8px 16px rgba(99, 102, 241, 0.25)" }}>
                                        {req.userId?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", marginBottom: "0.2rem" }}>{req.userId?.name}</h3>
                                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            {req.userId?.department || "General"} Dept <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#475569" }} /> {req.type}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <span style={{
                                        fontSize: "0.85rem", padding: "0.5rem 1.2rem", borderRadius: "12px", fontWeight: 800,
                                        background: req.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: req.status === 'APPROVED' ? '#22c55e' : req.status === 'REJECTED' ? '#ef4444' : '#f59e0b',
                                        border: `1px solid ${req.status === 'APPROVED' ? '#22c55e' : req.status === 'REJECTED' ? '#ef4444' : '#f59e0b'}30`,
                                        display: "flex", alignItems: "center", gap: "0.5rem"
                                    }}>
                                        {req.status === 'APPROVED' && <Check size={14} />}
                                        {req.status === 'REJECTED' && <X size={14} />}
                                        {req.status === 'PENDING' && <Clock size={14} />}
                                        {req.status}
                                    </span>

                                    <ChevronDown size={20} style={{ color: "#64748b", transform: expandedId === req._id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === req._id && (
                                <div className="animate-fade-in" style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                            <div style={{ padding: "1.25rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>Request Duration</p>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                                    <Calendar size={18} color="#818cf8" />
                                                    <span style={{ fontWeight: 700, color: "white", fontSize: "1rem" }}>
                                                        {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ padding: "1.25rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>Request Type</p>
                                                <span style={{ fontWeight: 700, color: "white", fontSize: "1rem" }}>{req.type}</span>
                                            </div>
                                            <div style={{ gridColumn: "span 2", padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.8rem", letterSpacing: "0.5px" }}>Reason for Leave</p>
                                                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>{req.reason}</p>
                                            </div>

                                            {req.adminResponse && (
                                                <div style={{ gridColumn: "span 2", padding: "1.5rem", borderRadius: "16px", background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                                                    <p style={{ color: "#818cf8", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.5px" }}>Admin Feedback</p>
                                                    <p style={{ color: "white", fontSize: "0.95rem", fontStyle: "italic" }}>&quot;{req.adminResponse}&quot;</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Panel for Pending Requests */}
                                        {req.status === 'PENDING' && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", padding: "1.5rem", background: "rgba(15, 23, 42, 0.3)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                                                    <h4 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem" }}>Take Action</h4>
                                                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Approve or reject this request</p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleActionClick(req._id, "APPROVED", e)}
                                                    className="btn-primary"
                                                    style={{ padding: "1rem", borderRadius: "12px", fontSize: "1rem", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
                                                >
                                                    <Check size={18} /> Approve Request
                                                </button>
                                                <button
                                                    onClick={(e) => handleActionClick(req._id, "REJECTED", e)}
                                                    className="btn-primary"
                                                    style={{ padding: "1rem", borderRadius: "12px", fontSize: "1rem", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                                                >
                                                    <X size={18} /> Reject Request
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Stunning Custom Modal */}
            {actionModal.isOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
                    <div className="glass" style={{ width: "90%", maxWidth: "450px", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)" }}>
                        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: actionModal.status === "APPROVED" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)", color: actionModal.status === "APPROVED" ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                                {actionModal.status === "APPROVED" ? <Check size={32} /> : <X size={32} />}
                            </div>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.5rem", color: "white" }}>{actionModal.status === "APPROVED" ? "Approve" : "Reject"} Request</h2>
                            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Provide a reason or feedback for the employee.</p>
                        </div>

                        <textarea
                            autoFocus
                            value={actionModal.response}
                            onChange={(e) => setActionModal({ ...actionModal, response: e.target.value })}
                            placeholder={actionModal.status === "APPROVED" ? "Optional: Add a note..." : "Reason for rejection..."}
                            style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "12px",
                                background: "rgba(0,0,0,0.3)",
                                color: "white",
                                minHeight: "120px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                outline: "none",
                                marginBottom: "2rem",
                                fontSize: "1rem",
                                resize: "none"
                            }}
                        />
                        <div style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: "1rem" }}>
                            <button onClick={() => setActionModal({ ...actionModal, isOpen: false })} className="glass" style={{ padding: "1rem", borderRadius: "12px", color: "white", fontWeight: 700, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                            <button onClick={submitAction} className="btn-primary" style={{ padding: "1rem", borderRadius: "12px", background: actionModal.status === "APPROVED" ? "#22c55e" : "#ef4444", color: "white", fontWeight: 800, boxShadow: actionModal.status === "APPROVED" ? "0 4px 15px rgba(34, 197, 94, 0.4)" : "0 4px 15px rgba(239, 68, 68, 0.4)" }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />
        </div>
    );
}

export default function AdminLeavesPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "white" }}>
                Loading Leave Requests...
            </div>
        }>
            <AdminLeavesPageContent />
        </Suspense>
    );
}

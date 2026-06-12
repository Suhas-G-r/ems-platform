"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Users, Clock, AlertTriangle, CheckCircle, Search,
    Filter, MoreHorizontal, ArrowUpRight, X, Check, MapPin,
    Trash2, Monitor, Building2
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

interface EmployeeLog {
    _id: string;
    userId: { name: string; email: string; designation?: string; avatar?: string };
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
    workHours: number;
    isLate: boolean;
    locationType: 'OFFICE' | 'REMOTE';
}

interface CorrectionRequest {
    _id: string;
    userId: { name: string; email: string };
    date: string;
    checkIn: string;
    correctionRequest: {
        reason: string;
        status: string;
    };
}

export default function AdminAttendance() {
    const router = useRouter();
    const [logs, setLogs] = useState<EmployeeLog[]>([]);
    const [requests, setRequests] = useState<CorrectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'daily' | 'requests'>('daily');
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });

    // Filter states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchData(token);
    }, []);

    const fetchData = async (token: string) => {
        try {
            const res = await fetch("/api/attendance", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setLogs(data.attendance || []);
                setRequests(data.pendingRequests || []);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const resolveRequest = async (id: string, decision: 'APPROVED' | 'REJECTED', newCheckOut?: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/attendance", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'resolve',
                    attendanceId: id,
                    status: decision,
                    newCheckOut: newCheckOut
                })
            });
            const data = await res.json();
            if (res.ok) {
                setModal({ isOpen: true, title: "Success", message: `Request ${decision.toLowerCase()}`, type: "success" });
                fetchData(token!);
            }
        } catch (error) { console.error(error); }
    };

    // --- Analytics ---
    const stats = useMemo(() => {
        const total = logs.length;
        const present = logs.filter(l => l.status === 'PRESENT' || l.status === 'LATE' || l.status === 'REMOTE').length;
        const late = logs.filter(l => l.status === 'LATE').length;
        const remote = logs.filter(l => l.locationType === 'REMOTE' && l.checkIn).length;
        const absent = logs.filter(l => l.status === 'ABSENT').length;

        return { total, present, late, remote, absent };
    }, [logs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.userId.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatTime = (d?: string) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";

    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem", color: "white" }}>Workforce Intelligence</h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Real-time monitoring and attendance management</p>
                </div>
                <div className="glass" style={{ padding: "0.4rem", borderRadius: "16px", display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => setView('daily')}
                        style={{ padding: "0.8rem 1.5rem", borderRadius: "12px", background: view === 'daily' ? "#6366f1" : "transparent", color: "white", border: "none", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                    >
                        Daily Report
                    </button>
                    <button
                        onClick={() => setView('requests')}
                        style={{ padding: "0.8rem 1.5rem", borderRadius: "12px", background: view === 'requests' ? "#6366f1" : "transparent", color: "white", border: "none", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                    >
                        Requests
                        {requests.length > 0 && (
                            <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "100px", fontWeight: 800 }}>
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            {view === 'daily' && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                    <div className="glass" style={{ padding: "1.8rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ background: "rgba(99,102,241,0.1)", padding: "0.8rem", borderRadius: "12px", color: "#6366f1" }}><Users size={24} /></div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{stats.present}</div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>Total Present</div>
                    </div>
                    <div className="glass" style={{ padding: "1.8rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ background: "rgba(249,115,22,0.1)", padding: "0.8rem", borderRadius: "12px", color: "#f97316" }}><Clock size={24} /></div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{stats.late}</div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>Late Arrivals</div>
                    </div>
                    <div className="glass" style={{ padding: "1.8rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ background: "rgba(192,132,252,0.1)", padding: "0.8rem", borderRadius: "12px", color: "#c084fc" }}><Monitor size={24} /></div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{stats.remote}</div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>Working Remote</div>
                    </div>
                    <div className="glass" style={{ padding: "1.8rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ background: "rgba(239,68,68,0.1)", padding: "0.8rem", borderRadius: "12px", color: "#ef4444" }}><AlertTriangle size={24} /></div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{stats.absent}</div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>Unaccounted / Absent</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="glass" style={{ borderRadius: "32px", overflow: "hidden", minHeight: "600px" }}>
                {view === 'daily' ? (
                    <>
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>Daily Logs ({new Date().toLocaleDateString()})</h3>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ position: "relative" }}>
                                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                                    <input
                                        type="text" placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)}
                                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "12px", color: "white", outline: "none" }}
                                    />
                                </div>
                                <select
                                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ background: "rgba(99,102,241,0.15)", border: "2px solid rgba(99,102,241,0.4)", padding: "0.75rem 1.2rem", borderRadius: "12px", color: "white", outline: "none", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", minWidth: "150px", transition: "all 0.2s ease" }}
                                >
                                    <option value="ALL" style={{ color: "black" }}>All Status</option>
                                    <option value="PRESENT" style={{ color: "black" }}>Present</option>
                                </select>
                            </div>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Employee</th>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Check In</th>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Check Out</th>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Location</th>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Work Hrs</th>
                                    <th style={{ padding: "1.2rem 2rem", textAlign: "right", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log._id || log.userId.email} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ padding: "1.5rem 2rem" }}>
                                            <div style={{ fontWeight: 800, color: "white" }}>{log.userId.name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{log.userId.email}</div>
                                        </td>
                                        <td style={{ padding: "1.5rem 2rem", color: log.checkIn ? "white" : "#94a3b8" }}>
                                            {formatTime(log.checkIn)}
                                            {log.isLate && <span style={{ marginLeft: "0.5rem", color: "#ef4444", fontSize: "0.7rem", fontWeight: 800 }}>LATE</span>}
                                        </td>
                                        <td style={{ padding: "1.5rem 2rem", color: "#94a3b8" }}>{formatTime(log.checkOut)}</td>
                                        <td style={{ padding: "1.5rem 2rem" }}>
                                            {log.checkIn ? (
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                                                    {log.locationType === 'OFFICE' ? <Building2 size={14} /> : <Monitor size={14} />}
                                                    {log.locationType}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td style={{ padding: "1.5rem 2rem", color: "white", fontWeight: 700 }}>{log.workHours || "—"}</td>
                                        <td style={{ padding: "1.5rem 2rem", textAlign: "right" }}>
                                            <span style={{
                                                padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 900,
                                                background: log.status === 'ABSENT' ? "rgba(255,255,255,0.05)" : log.status === 'LATE' ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                                                color: log.status === 'ABSENT' ? "#94a3b8" : log.status === 'LATE' ? "#ef4444" : "#22c55e"
                                            }}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <div style={{ padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Correction Requests</h3>
                            <p style={{ color: "#94a3b8" }}>Employees requesting manual adjustments to their logs.</p>
                        </div>
                        {requests.length === 0 ? (
                            <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
                                <CheckCircle size={48} style={{ marginBottom: "1rem", opacity: 0.2 }} />
                                <p>No pending requests.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: "1rem", padding: "2rem" }}>
                                {requests.map(req => (
                                    <div key={req._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                                <h4 style={{ color: "white", fontWeight: 800 }}>{req.userId.name}</h4>
                                                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>• {new Date(req.date).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ color: "#c084fc", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>&quot;{req.correctionRequest.reason}&quot;</p>
                                            <p style={{ color: "#64748b", fontSize: "0.8rem" }}>Current: Check In {formatTime(req.checkIn)} — Check Out --:--</p>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.8rem" }}>
                                            <button
                                                onClick={() => resolveRequest(req._id, 'REJECTED')}
                                                style={{ padding: "0.6rem 1.2rem", borderRadius: "12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700, cursor: "pointer" }}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Simple auto-approve with a default "end of day" time for now, or use current time if it's today
                                                    // For a real advanced app, we'd pop a modal to ask "What time did they leave?"
                                                    // Here we'll set it to 6:00 PM of that day for simplicity or parse from reason if we had AI
                                                    const date = new Date(req.date);
                                                    date.setHours(18, 0, 0, 0); // Defaulting to 6 PM
                                                    resolveRequest(req._id, 'APPROVED', date.toISOString());
                                                }}
                                                style={{ padding: "0.6rem 1.2rem", borderRadius: "12px", background: "#22c55e", color: "white", border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                            >
                                                <Check size={16} /> Approve (Set 6 PM)
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.05); }
            `}} />
        </div>
    );
}

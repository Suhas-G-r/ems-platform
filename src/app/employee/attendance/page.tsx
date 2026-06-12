"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Clock, Calendar, CheckCircle2, AlertCircle,
    Flame, ArrowLeftRight, ChevronRight,
    Search, Mail, MapPin, Play, Square, Loader2
} from 'lucide-react';
import StatusModal from "@/components/StatusModal";

// --- Types ---
interface AttendanceLog {
    _id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
    workHours: number;
    isLate: boolean;
    locationType: 'OFFICE' | 'REMOTE';
    correctionRequest?: {
        requested: boolean;
        reason: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
}

// --- Components ---

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    subValue: string;
    icon: React.ElementType;
    color: string;
}

const AnalyticsCard = ({ title, value, subValue, icon: Icon, color }: AnalyticsCardProps) => (
    <div className="glass" style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div style={{ background: `${color}15`, padding: "0.8rem", borderRadius: "16px", color: color }}>
                <Icon size={24} />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "white" }}>{value}</div>
        </div>
        <div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.2rem" }}>{title}</p>
            <p style={{ color: color, fontSize: "0.75rem", fontWeight: 800 }}>{subValue}</p>
        </div>
        <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.03, transform: "rotate(-15deg)" }}>
            <Icon size={120} />
        </div>
    </div>
);

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose} />
            <div className="glass animate-fade-in" style={{ position: "relative", width: "100%", maxWidth: "500px", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                </div>
                <div style={{ padding: "2rem" }}>{children}</div>
            </div>
        </div>
    );
};

export default function AttendanceDashboard() {
    const router = useRouter();
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [locationType, setLocationType] = useState<'OFFICE' | 'REMOTE'>('OFFICE');
    const [correctionModal, setCorrectionModal] = useState<{ isOpen: boolean, logId: string, reason: string }>({ isOpen: false, logId: "", reason: "" });
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });
    const [filter, setFilter] = useState("This Month");

    useEffect(() => {
        window.scrollTo(0, 0); // Ensure page starts at top
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchAttendance(token);
    }, []);

    const fetchAttendance = async (token: string) => {
        try {
            const res = await fetch("/api/attendance", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setLogs(data.attendance || []);
            }
        } catch (error) {
            console.error("Attendance fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendance = async (action: 'checkin' | 'checkout') => {
        setActionLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ action, locationType })
            });
            const data = await res.json();
            if (res.ok) {
                setModal({
                    isOpen: true,
                    title: action === 'checkin' ? "Verified" : "Shift Ended",
                    message: data.message,
                    type: "success"
                });
                fetchAttendance(token!);
            } else {
                setModal({ isOpen: true, title: "Blocked", message: data.error, type: "error" });
            }
        } catch (error) {
            setModal({ isOpen: true, title: "Error", message: "Connection lost", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const requestCorrection = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/attendance", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ attendanceId: correctionModal.logId, reason: correctionModal.reason })
            });
            if (res.ok) {
                setModal({ isOpen: true, title: "Requested", message: "Admin will review your request.", type: "success" });
                setCorrectionModal({ ...correctionModal, isOpen: false });
                fetchAttendance(token!);
            }
        } catch (error) { console.error(error); }
    };

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        const month = new Date().getMonth();
        const thisMonthLogs = logs.filter(l => new Date(l.date).getMonth() === month);

        // Count unique days present
        const uniqueDaysPresent = new Set(thisMonthLogs.filter(l => l.checkIn).map(l => new Date(l.date).toDateString())).size;

        const lates = thisMonthLogs.filter(l => l.isLate).length;
        const totalHours = thisMonthLogs.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(1);

        // Streak calculation (days with at least one check-in)
        let streak = 0;
        // Group by date first to count streaks of DAYS not logs
        const logsByDate = logs.reduce((acc: Record<string, AttendanceLog[]>, log) => {
            const d = new Date(log.date).toDateString();
            if (!acc[d]) acc[d] = [];
            acc[d].push(log);
            return acc;
        }, {});

        const sortedDates = Object.keys(logsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        for (let i = 0; i < sortedDates.length; i++) {
            const dayLogs = logsByDate[sortedDates[i]];
            if (dayLogs.some((l: AttendanceLog) => l.checkIn)) streak++;
            else break;
        }

        // Attendance rate based on unique days vs total days in month so far (approx)
        // Respect join date: do not count days before the employee joined. Start counting from the next day after joining.
        let daysInMonthSoFar = new Date().getDate();
        try {
            const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (userJson) {
                const userObj = JSON.parse(userJson);
                const joinDate = userObj?.createdAt ? new Date(userObj.createdAt) : null;
                const today = new Date();
                if (joinDate && joinDate.getFullYear() === today.getFullYear() && joinDate.getMonth() === today.getMonth()) {
                    const startDay = joinDate.getDate() + 1; // start from next day after joining
                    daysInMonthSoFar = Math.max(0, daysInMonthSoFar - (startDay - 1));
                }
            }
        } catch (e) { /* ignore JSON errors */ }
        const attendanceRate = daysInMonthSoFar ? Math.round((uniqueDaysPresent / daysInMonthSoFar) * 100) : 0;

        return { present: uniqueDaysPresent, lates, totalHours, streak, attendanceRate };
    }, [logs]);

    // Find the current active log (today, checked in, not checked out)
    const today = new Date().toLocaleDateString();
    const todayLogs = logs.filter(l => new Date(l.date).toLocaleDateString() === today);
    const activeLog = todayLogs.find(l => l.checkIn && !l.checkOut);

    const isCheckedIn = !!activeLog;
    // We are "Shift Ended" only if we have logs for today AND none are active. 
    // But now we allow re-checkin, so "Shift Ended" is just a state where we are ready to check in again.
    const hasPriorLogsToday = todayLogs.length > 0 && !activeLog;

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const chartData = useMemo(() => {
        // Aggregate hours by date for the chart
        const hoursByDate: Record<string, number> = {};
        logs.forEach(l => {
            const d = new Date(l.date).toLocaleDateString([], { day: '2-digit', month: 'short' });
            let hours = l.workHours || 0;

            // If this is the active log (today, checked in, no check out), calculate live hours
            if (l.checkIn && !l.checkOut) {
                const isToday = new Date(l.date).toDateString() === new Date().toDateString();
                if (isToday) {
                    const start = new Date(l.checkIn).getTime();
                    const currentDuration = now.getTime() - start;
                    const liveHours = currentDuration / (1000 * 60 * 60);
                    hours += liveHours;
                }
            }

            hoursByDate[d] = (hoursByDate[d] || 0) + hours;
        });

        return Object.entries(hoursByDate).slice(0, 10).map(([date, hours]: [string, number]) => ({
            date,
            hours: parseFloat(hours.toFixed(1))
        })).reverse();
    }, [logs, now]);

    const formatTime = (d?: string) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "—";

    const getDuration = (log: AttendanceLog) => {
        if (!log.checkIn) return "—";

        // Handle missed checkout for past dates
        const isToday = new Date(log.date).toDateString() === new Date().toDateString();
        if (!log.checkOut && !isToday) {
            return <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>MISSED OUT</span>;
        }

        const start = new Date(log.checkIn).getTime();
        const end = log.checkOut ? new Date(log.checkOut).getTime() : now.getTime();

        let diff = end - start;
        if (diff < 0) diff = 0;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }} className="animate-fade-in">
            {/* Header section with real-time status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "0.5rem", letterSpacing: "-1.5px" }}>Attendance Portal</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,255,255,0.03)", padding: "0.6rem 1.2rem", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isCheckedIn ? "#22c55e" : "#94a3b8", boxShadow: isCheckedIn ? "0 0 10px #22c55e" : "none" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8" }}>
                                {isCheckedIn ? `Logged in at ${formatTime(activeLog?.checkIn)}` : (hasPriorLogsToday ? "Session Completed (Ready for new)" : "Ready for Check-in")}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f97316", fontWeight: 800, fontSize: "0.9rem" }}>
                            <Flame size={18} /> {stats.streak} Day Streak
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ position: "relative" }}>
                        <button
                            disabled={actionLoading}
                            onClick={() => handleAttendance(isCheckedIn ? 'checkout' : 'checkin')}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 2rem", borderRadius: "16px",
                                background: isCheckedIn ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.95rem", border: "none",
                                boxShadow: "0 10px 25px rgba(99,102,241,0.2)"
                            }}
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (isCheckedIn ? <><Square size={18} /> Check Out</> : <><Play size={18} /> Check In Now</>)}
                        </button>
                        <button
                            // Add a hidden or debug button if needed, but for now just the primary action
                            style={{ display: "none" }}
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Mode Toggle (Only if not checked in) */}
            {!isCheckedIn && (
                <div className="glass" style={{ display: "inline-flex", padding: "0.4rem", borderRadius: "16px", marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={() => setLocationType('OFFICE')}
                        style={{ padding: "0.6rem 1.2rem", borderRadius: "12px", border: "none", background: locationType === 'OFFICE' ? "#6366f1" : "transparent", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                    >
                        <MapPin size={16} /> Office
                    </button>
                    <button
                        onClick={() => setLocationType('REMOTE')}
                        style={{ padding: "0.6rem 1.2rem", borderRadius: "12px", border: "none", background: locationType === 'REMOTE' ? "#c084fc" : "transparent", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                    >
                        <Mail size={16} /> Remote
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                <AnalyticsCard title="Attendance Rate" value={`${stats.attendanceRate}%`} subValue="This Month" icon={CheckCircle2} color="#22c55e" />
                <AnalyticsCard title="Total Work Hours" value={stats.totalHours} subValue="Last 30 Days" icon={Clock} color="#6366f1" />
                <AnalyticsCard title="Late Check-ins" value={stats.lates} subValue="Needs Review" icon={AlertCircle} color="#f59e0b" />
                <AnalyticsCard title="Monthly Presence" value={stats.present} subValue="Total Days" icon={Calendar} color="#c084fc" />
            </div>

            {/* Graph & Summary section */}
            <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)", gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "white" }}>Work Hours Analytics</h3>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>Trend (Last 10 Days)</div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                                itemStyle={{ color: "#818cf8", fontWeight: 800 }}
                                labelStyle={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHours)"
                                activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 4, fill: "#0f172a" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div >

            {/* Attendance Logs Table */}
            < div className="glass" style={{ borderRadius: "32px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ padding: "1.8rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "white" }}>Detailed Activity Logs</h3>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                            <input
                                type="text" placeholder="Search date..."
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "12px", color: "white", fontSize: "0.85rem", outline: "none" }}
                            />
                        </div>
                        <select
                            value={filter} onChange={(e) => setFilter(e.target.value)}
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1rem", borderRadius: "12px", color: "white", fontSize: "0.85rem", outline: "none" }}
                        >
                            <option style={{ color: "black" }}>This Week</option>
                            <option style={{ color: "black" }}>This Month</option>
                            <option style={{ color: "black" }}>Last Month</option>
                        </select>
                    </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Date</th>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Check In</th>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Check Out</th>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Status</th>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Duration</th>
                            <th style={{ padding: "1.2rem 2.5rem", textAlign: "right", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => {
                            const isToday = new Date(log.date).toLocaleDateString() === new Date().toLocaleDateString();
                            const status = log.status || (log.checkOut ? "PRESENT" : (isToday ? "ON DUTY" : "MISSED OUT"));
                            const colorMap: Record<string, string> = {
                                'PRESENT': '#22c55e', 'LATE': '#ef4444', 'ON DUTY': '#f59e0b',
                                'MISSED OUT': '#94a3b8', 'REMOTE': '#c084fc', 'LEAVE': '#6366f1'
                            };
                            return (
                                <tr key={log._id || i} className="table-row-hover" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", transition: "all 0.2s" }}>
                                    <td style={{ padding: "1.5rem 2.5rem" }}>
                                        <div style={{ fontWeight: 800, color: "white" }}>{new Date(log.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(log.date).toLocaleDateString([], { weekday: 'long' })}</div>
                                    </td>
                                    <td style={{ padding: "1.5rem 2.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontWeight: 700 }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: log.isLate ? "#ef4444" : "#22c55e" }} />
                                            {formatTime(log.checkIn)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.5rem 2.5rem", color: "#94a3b8" }}>
                                        {log.checkOut ? formatTime(log.checkOut) : (
                                            new Date(log.date).toDateString() === new Date().toDateString() ? "—" : <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>MISSED</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1.5rem 2.5rem" }}>
                                        <span style={{
                                            padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 900,
                                            background: `${colorMap[status]}15`, color: colorMap[status], border: `1px solid ${colorMap[status]}30`
                                        }}>
                                            {status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.5rem 2.5rem", fontWeight: 800, color: "white" }}>
                                        {getDuration(log)}
                                    </td>
                                    <td style={{ padding: "1.5rem 2.5rem", textAlign: "right" }}>
                                        {log.correctionRequest?.requested ? (
                                            <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>Request Sent</span>
                                        ) : (
                                            <button
                                                onClick={() => setCorrectionModal({ isOpen: true, logId: log._id, reason: "" })}
                                                style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                                            >
                                                Correct
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div >

            {/* Correction Modal */}
            < Modal isOpen={correctionModal.isOpen} onClose={() => setCorrectionModal({ ...correctionModal, isOpen: false })} title="Request Attendance Correction" >
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Forgot to check out? Provide a reason and the correct time for Admin review.</p>
                <textarea
                    placeholder="e.g. Forgot to punch out while leaving at 6:30 PM..."
                    value={correctionModal.reason}
                    onChange={(e) => setCorrectionModal({ ...correctionModal, reason: e.target.value })}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1rem", color: "white", minHeight: "120px", outline: "none", marginBottom: "1.5rem" }}
                />
                <button
                    onClick={requestCorrection}
                    disabled={!correctionModal.reason.trim()}
                    style={{ width: "100%", padding: "1rem", borderRadius: "16px", background: "#6366f1", color: "white", fontWeight: 800, border: "none", cursor: "pointer" }}
                >
                    Submit Request
                </button>
            </Modal >

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-gradient { background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .table-row-hover:hover { background: rgba(255,255,255,0.02) !important; transform: scale(1.002); }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}} />
        </div >
    );
}

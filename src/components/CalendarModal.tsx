"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendanceData: any[];
}

export default function CalendarModal({ isOpen, onClose, attendanceData }: CalendarModalProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    if (!isOpen) return null;

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday...

    // Adjust for Monday start if desired, but standard is usually Sun or Mon. Let's stick to Sunday start for grid.
    const weeks = [];
    let days = [];

    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Chunk into weeks
    while (days.length > 0) {
        weeks.push(days.splice(0, 7));
    }

    const getStatusForDay = (day: number) => {
        const dateStr = new Date(year, month, day).toDateString();
        const record = attendanceData.find((a: any) => new Date(a.date).toDateString() === dateStr);
        if (record) return record.status;

        // Check if weekend
        const d = new Date(year, month, day);
        if (d.getDay() === 0 || d.getDay() === 6) return 'WEEKEND';

        // If past date and no record, and not weekend -> Absent? (Or just No Data)
        if (d < new Date() && d.getDay() !== 0 && d.getDay() !== 6) return 'ABSENT_OR_NODATA';

        return null;
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'PRESENT': return 'rgba(34, 197, 94, 0.2)'; // Green
            case 'LATE': return 'rgba(234, 179, 8, 0.2)'; // Yellow
            case 'ABSENT': return 'rgba(239, 68, 68, 0.2)'; // Red
            case 'LEAVE': return 'rgba(59, 130, 246, 0.2)'; // Blue
            case 'WEEKEND': return 'transparent';
            case 'ABSENT_OR_NODATA': return 'rgba(239, 68, 68, 0.1)';
            default: return 'transparent';
        }
    };

    const getStatusBorder = (status: string | null) => {
        switch (status) {
            case 'PRESENT': return '#22c55e';
            case 'LATE': return '#eab308';
            case 'ABSENT': return '#ef4444';
            case 'LEAVE': return '#3b82f6';
            default: return 'transparent';
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    // Prevent click propagation from overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={handleOverlayClick}
        >
            <div className="animate-fade-in" style={{ width: "95%", maxWidth: "500px", background: "#0f172a", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: 0 }}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.2rem" }}>
                            <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "none", color: "white", padding: "0.4rem", cursor: "pointer", borderRadius: "8px", display: "flex" }}><ChevronLeft size={18} /></button>
                            <button onClick={() => changeMonth(1)} style={{ background: "none", border: "none", color: "white", padding: "0.4rem", cursor: "pointer", borderRadius: "8px", display: "flex" }}><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={24} /></button>
                </div>

                {/* Calendar Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", textAlign: "center", marginBottom: "0.5rem" }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 700, paddingBottom: "0.5rem" }}>{d}</div>
                    ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {weeks.map((week, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
                            {week.map((day, dIdx) => {
                                if (day === null) {
                                    // Fill the gap if needed or just empty div
                                    return <div key={`empty-${dIdx}`} />;
                                }

                                const status = getStatusForDay(day as number);
                                const isToday =
                                    (day === new Date().getDate()) &&
                                    (month === new Date().getMonth()) &&
                                    (year === new Date().getFullYear());

                                return (
                                    <div
                                        key={day}
                                        style={{
                                            aspectRatio: "1",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "12px",
                                            background: getStatusColor(status),
                                            border: isToday ? "2px solid white" : `1px solid ${getStatusBorder(status)}`,
                                            position: "relative",
                                            color: "white",
                                            fontWeight: 700,
                                            fontSize: "0.9rem"
                                        }}
                                        title={status || ''}
                                    >
                                        {day}
                                        {status === 'PRESENT' && <div style={{ position: "absolute", bottom: "4px", width: "4px", height: "4px", borderRadius: "50%", background: "#22c55e" }} />}
                                        {status === 'LATE' && <div style={{ position: "absolute", bottom: "4px", width: "4px", height: "4px", borderRadius: "50%", background: "#eab308" }} />}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }}></div> Present
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }}></div> Late
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></div> Absent
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }}></div> Leave
                    </div>
                </div>

            </div>
        </div>
    );
}

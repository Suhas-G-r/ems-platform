"use client"

import { useState, useEffect } from "react"
import { ClipboardList, Clock, CheckCircle, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import CalendarModal from "@/components/CalendarModal"

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
}

interface AttendanceRecord {
    _id: string;
    userId: string;
    date: string;
    status: string;
    workHours: number;
}

interface WeeklyHours {
    day: string;
    hours: number;
}

export default function EmployeeDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState({
        pendingTasks: 0,
        completedTasks: 0,
        hoursLogged: 0,
        attendanceRate: 0
    })
    const [weeklyData, setWeeklyData] = useState<WeeklyHours[]>([])
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) setUser(JSON.parse(userData))
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token")

            // Fetch Tasks
            const tasksRes = await fetch("/api/tasks", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const tasksData = await tasksRes.json()

            // Fetch Attendance
            const attRes = await fetch("/api/attendance", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const attData = await attRes.json()

            if (tasksRes.ok && attRes.ok) {
                const tasks = tasksData.tasks || []
                const pending = tasks.filter((t: Task) => t.status !== 'DONE').length
                const completed = tasks.filter((t: Task) => t.status === 'DONE').length
                const attendance = attData.attendance || []
                setAttendanceHistory(attendance)

                // Calculate Hours for Today (Summing all sessions)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayHours = attendance
                    .filter((a: AttendanceRecord) => {
                        const d = new Date(a.date);
                        d.setHours(0, 0, 0, 0);
                        return d.getTime() === today.getTime();
                    })
                    .reduce((total: number, curr: AttendanceRecord) => total + (curr.workHours || 0), 0);

                // Calculate Attendance Rate
                const rate = attendance.length > 0
                    ? Math.round((attendance.filter((a: AttendanceRecord) => a.status !== 'ABSENT').length / 30) * 100)
                    : 0

                // Calculate Last 7 Days Data
                const last7Days = [];
                const todayRef = new Date();
                todayRef.setHours(0, 0, 0, 0);

                for (let i = 6; i >= 0; i--) {
                    const d = new Date(todayRef);
                    d.setDate(d.getDate() - i);
                    last7Days.push(d);
                }

                const chartData = last7Days.map(date => {
                    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }); // e.g., "Thu 12"

                    const dailyHours = attendance
                        .filter((a: AttendanceRecord) => {
                            const rDate = new Date(a.date);
                            rDate.setHours(0, 0, 0, 0);
                            return rDate.getTime() === date.getTime();
                        })
                        .reduce((total: number, curr: AttendanceRecord) => total + (curr.workHours || 0), 0);

                    return {
                        day: dayStr,
                        hours: Math.round(dailyHours * 10) / 10
                    };
                });

                setWeeklyData(chartData);

                setStats({
                    pendingTasks: pending,
                    completedTasks: completed,
                    hoursLogged: Math.round(todayHours * 10) / 10,
                    attendanceRate: Math.min(rate, 100)
                })
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    const taskData = [
        { name: 'Completed', value: stats.completedTasks || 0, color: '#22c55e' },
        { name: 'Pending', value: stats.pendingTasks || 0, color: '#f59e0b' }
    ]

    // If no tasks, show a placeholder segment to avoid empty chart
    const chartData = (stats.completedTasks === 0 && stats.pendingTasks === 0)
        ? [{ name: 'No Data', value: 1, color: '#334155' }]
        : taskData;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "0.5rem", background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Welcome back, {user?.name || 'Employee'}!
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>✨ Here&apos;s an overview of your productivity and task status for today.</p>
                </div>
                <div
                    onClick={() => setIsCalendarOpen(true)}
                    style={{
                        padding: "1rem 1.5rem",
                        background: "rgba(99, 102, 241, 0.1)",
                        borderRadius: "16px",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        color: "#818cf8",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"}
                >
                    <Calendar size={20} />
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                attendanceData={attendanceHistory}
            />

            {/* Stats Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                {[
                    { label: "Pending Tasks", value: stats.pendingTasks, icon: <ClipboardList />, color: "#f59e0b" },
                    { label: "Completed", value: stats.completedTasks, icon: <CheckCircle />, color: "#22c55e" },
                    { label: "Hours logged", value: `${stats.hoursLogged} h`, icon: <Clock />, color: "#6366f1" },
                    { label: "Attendance", value: `${stats.attendanceRate}%`, icon: <TrendingUp />, color: "#ec4899" }
                ].map((stat, i) => (
                    <div key={i} className="glass" style={{
                        padding: "1.8rem",
                        borderRadius: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                        border: `1px solid rgba(255, 255, 255, 0.05)`
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: `${stat.color}15`,
                            color: stat.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</p>
                            <h3 style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{loading ? "..." : stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                {/* Weekly Progress Bar Chart */}
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px" }}>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "2rem", color: "white" }}>Work Hours (Last 7 Days)</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData.length > 0 ? weeklyData : [{ day: 'Today', hours: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Distribution Pie Chart */}
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px" }}>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "2rem", color: "white" }}>Task Allocation</h3>
                    <div style={{ height: "250px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
                        {taskData.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color }}></div>
                                <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                        🚀
                    </div>
                    <div>
                        <h4 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.25rem", color: "white" }}>Ready to tackle a new task?</h4>
                        <p style={{ color: "#94a3b8", fontSize: "1rem", fontWeight: 500 }}>Check your assigned projects and update your progress seamlessly.</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/employee/tasks'}
                    style={{
                        padding: "1.2rem 2.5rem",
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "16px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)",
                        transition: "transform 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                >
                    View Tasks <ArrowRight size={20} />
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.05); }
            `}} />
        </div>
    )
}

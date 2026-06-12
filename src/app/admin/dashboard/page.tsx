"use client"

import { useState, useEffect } from "react"
import { Users, FileText, ClipboardList, TrendingUp, ArrowUpRight, X } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: string;
    lastName?: string;
}

interface AttendanceRecord {
    _id: string;
    userId: { _id: string; name: string };
    date: string;
    status: string;
}

interface AttendanceComparison {
    name: string;
    fullName: string;
    present: number;
    absent: number;
    total: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        activeTasks: 0,
        systemUsers: 0
    })
    const [recentEmployees, setRecentEmployees] = useState<User[]>([])
    const [allEmployees, setAllEmployees] = useState<User[]>([])
    const [attendanceComparison, setAttendanceComparison] = useState<AttendanceComparison[]>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "MEDIUM"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccessCard, setShowSuccessCard] = useState(false)
    const [showErrorCard, setShowErrorCard] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) setUser(JSON.parse(userData))
        fetchData()
    }, [])

    useEffect(() => {
        if (showSuccessCard) {
            const timer = setTimeout(() => {
                setShowSuccessCard(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showSuccessCard])

    useEffect(() => {
        if (showErrorCard) {
            const timer = setTimeout(() => {
                setShowErrorCard(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showErrorCard])

    useEffect(() => {
        if (allEmployees.length > 0) {
            fetchAttendanceData(allEmployees)
        }
    }, [selectedMonth, allEmployees])

    const fetchAttendanceData = async (employeesList: User[]) => {
        try {
            const token = localStorage.getItem("token")
            const month = selectedMonth.getMonth()
            const year = selectedMonth.getFullYear()

            const attendanceRes = await fetch(`/api/attendance?month=${month}&year=${year}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const attendanceData = await attendanceRes.json()

            if (attendanceRes.ok && attendanceData.attendance) {
                calculateMonthlyComparison(employeesList, attendanceData.attendance)
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error)
        }
    }

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token")
            // Fetch users
            const usersRes = await fetch("/api/users", { headers: { "Authorization": `Bearer ${token}` } })
            const usersData = await usersRes.json()

            // Fetch tasks
            const tasksRes = await fetch("/api/tasks", { headers: { "Authorization": `Bearer ${token}` } })
            const tasksData = await tasksRes.json()

            // Fetch leaves
            const leavesRes = await fetch("/api/leaves", { headers: { "Authorization": `Bearer ${token}` } })
            const leavesData = await leavesRes.json()

            if (usersRes.ok && usersData.users) {
                const employees = usersData.users.filter((u: User) => u.role === 'EMPLOYEE')
                const pendingCount = (leavesData.leaveRequests || []).filter((l: { status: string }) => l.status === 'PENDING').length
                const activeCount = (tasksData.tasks || []).filter((t: { status: string }) => t.status !== 'COMPLETED').length

                setStats({
                    totalEmployees: employees.length,
                    pendingLeaves: pendingCount,
                    activeTasks: activeCount,
                    systemUsers: usersData.users.length
                })
                setRecentEmployees(employees.slice(0, 5))
                setAllEmployees(employees)
                fetchAttendanceData(employees)
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    const calculateMonthlyComparison = (employees: User[], allAttendance: AttendanceRecord[]) => {
        const year = selectedMonth.getFullYear()
        const month = selectedMonth.getMonth()
        const today = new Date()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
        const currentDay = isCurrentMonth ? today.getDate() : daysInMonth

        const comparisonData = employees.map((emp: User) => {
            const empAttendance = allAttendance.filter(
                (att: AttendanceRecord) => att.userId?._id === emp._id
            )

            const presentDays = empAttendance.filter((att: AttendanceRecord) => {
                const attDate = new Date(att.date)
                return attDate.getMonth() === month && attDate.getFullYear() === year &&
                    ['PRESENT', 'LATE', 'REMOTE'].includes(att.status)
            }).length

            // Only count absences up to the current day of the month
            const absentDays = empAttendance.filter((att: AttendanceRecord) => {
                const attDate = new Date(att.date)
                return attDate.getMonth() === month && attDate.getFullYear() === year &&
                    att.status === 'ABSENT'
            }).length

            // Respect employee join date: do not count days before they joined.
            // If they joined this month, start counting from the day AFTER join date (per UX: "from next day").
            const joinDate = emp['createdAt'] ? new Date(emp['createdAt']) : null
            let startDay = 1
            if (joinDate && joinDate.getFullYear() === year && joinDate.getMonth() === month) {
                startDay = joinDate.getDate() + 1 // start counting from the next day after joining
            }

            const daysEligible = Math.max(0, isCurrentMonth ? (currentDay - startDay + 1) : daysInMonth - (startDay - 1))

            // Estimate absences only for days the employee was eligible to attend
            const estimatedAbsent = Math.max(0, daysEligible - presentDays)
            const actualAbsent = Math.max(absentDays, estimatedAbsent)

            return {
                name: emp.name.substring(0, 10),
                fullName: `${emp.name} ${emp.lastName || ''}`,
                present: presentDays,
                absent: actualAbsent,
                total: daysEligible
            }
        }).sort((a, b) => b.present - a.present)

        setAttendanceComparison(comparisonData)
    }

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newTask)
            })

            if (res.ok) {
                setIsAssignModalOpen(false)
                setNewTask({ title: "", description: "", assignedTo: "", dueDate: "", priority: "MEDIUM" })
                fetchData()
                window.dispatchEvent(new Event('notification-created'))
                localStorage.setItem('notification-event', Date.now().toString())
                setShowSuccessCard(true)
            } else {
                setShowErrorCard(true)
            }
        } catch (error) {
            console.error(error)
            setShowErrorCard(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            backgroundColor: "transparent",
            minHeight: "100vh",
            padding: "2rem",
            marginInline: "-3rem",
            paddingInline: "3rem",
            marginTop: "-2.5rem",
            paddingTop: "2.5rem",
            color: "var(--foreground)",
            transition: "all 0.3s ease"
        }}>
            {/* Success Card Notification */}
            {showSuccessCard && (
                <div style={{
                    position: "fixed",
                    top: "2rem",
                    right: "2rem",
                    zIndex: 999,
                    animation: "slideIn 0.3s ease-out"
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                        border: "1.5px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "20px",
                        padding: "1.5rem 2rem",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        minWidth: "320px",
                        color: "var(--foreground)",
                        fontWeight: 600,
                        fontSize: "1rem"
                    }}>
                        <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            flexShrink: 0
                        }}>
                            ✓
                        </div>
                        <span>Task assigned successfully!</span>
                    </div>
                </div>
            )}

            {/* Error Card Notification */}
            {showErrorCard && (
                <div style={{
                    position: "fixed",
                    top: "2rem",
                    right: "2rem",
                    zIndex: 999,
                    animation: "slideIn 0.3s ease-out"
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
                        border: "1.5px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "20px",
                        padding: "1.5rem 2rem",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 10px 30px rgba(239, 68, 68, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        minWidth: "320px",
                        color: "var(--foreground)",
                        fontWeight: 600,
                        fontSize: "1rem"
                    }}>
                        <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            flexShrink: 0
                        }}>
                            ✕
                        </div>
                        <span>Failed to assign task. Please try again.</span>
                    </div>
                </div>
            )}
            {/* Header / Greeting */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "0.5rem", color: "var(--foreground)" }}>
                    Welcome back, {user?.name || 'Admin'} !
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    ✨ Here&apos;s an overview of system performance and employee activities.
                </p>
            </div>

            {/* Stats Cards Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                {[
                    { label: "Total Employees", value: stats.totalEmployees, icon: <Users size={24} />, color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" },
                    { label: "Pending Leaves", value: stats.pendingLeaves, icon: <FileText size={24} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
                    { label: "Active Tasks", value: stats.activeTasks, icon: <ClipboardList size={24} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
                    { label: "Total System Users", value: stats.systemUsers, icon: <TrendingUp size={24} />, color: "#c084fc", bg: "rgba(192, 132, 252, 0.1)" }
                ].map((stat, i) => (
                    <div key={i} style={{
                        padding: "2rem",
                        borderRadius: "24px",
                        background: "var(--card-bg)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid var(--glass-border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        position: "relative"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "14px",
                                background: "var(--glass-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                            <h3 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--foreground)" }}>{loading ? "..." : stat.value}</h3>
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 600 }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Attendance & Summary Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                {/* Attendance Chart Section */}
                <div style={{
                    background: "var(--card-bg)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    padding: "2.5rem",
                    borderRadius: "32px",
                    transition: "all 0.3s ease"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--foreground)", marginBottom: "0.25rem" }}>Attendance Analytics</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Comparison
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                onClick={() => {
                                    const newMonth = new Date(selectedMonth)
                                    newMonth.setMonth(newMonth.getMonth() - 1)
                                    setSelectedMonth(newMonth)
                                }}
                                style={{ padding: "0.75rem", background: "var(--glass-border)", border: "1px solid var(--glass-border)", borderRadius: "12px", color: "var(--foreground)", cursor: "pointer", transition: "all 0.2s" }}
                            >
                                ←
                            </button>
                            <button
                                onClick={() => {
                                    const newMonth = new Date(selectedMonth)
                                    newMonth.setMonth(newMonth.getMonth() + 1)
                                    if (newMonth <= new Date()) setSelectedMonth(newMonth)
                                }}
                                style={{ padding: "0.75rem", background: "var(--glass-border)", border: "1px solid var(--glass-border)", borderRadius: "12px", color: "var(--foreground)", cursor: "pointer", transition: "all 0.2s" }}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ height: "350px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.3)" }}>Loading metrics...</div>
                    ) : (
                        <div style={{ height: "350px", width: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceComparison}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--sidebar-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--foreground)' }}
                                        labelStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                                    <Bar dataKey="absent" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Workforce Summary Card */}
                <div style={{
                    background: "var(--card-bg)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    padding: "2.5rem",
                    borderRadius: "32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    transition: "all 0.3s ease"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--foreground)" }}>Workforce Summary</h3>
                        <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--secondary)", letterSpacing: "1px" }}>CURRENT MONTH</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.25rem", borderBottom: "1px solid var(--glass-border)" }}>
                            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Attendance Rate</span>
                            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#10b981" }}>
                                {attendanceComparison.length > 0
                                    ? ((attendanceComparison.reduce((sum, item) => sum + item.present, 0) / (attendanceComparison.length * (attendanceComparison[0]?.total || 1))) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <span style={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>Avg. Present (Days)</span>
                            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "white" }}>
                                {attendanceComparison.length > 0
                                    ? (attendanceComparison.reduce((sum, item) => sum + item.present, 0) / attendanceComparison.length).toFixed(1)
                                    : 0}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <span style={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>Avg. Absences (Days)</span>
                            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#f43f5e" }}>
                                {attendanceComparison.length > 0
                                    ? (attendanceComparison.reduce((sum, item) => sum + item.absent, 0) / attendanceComparison.length).toFixed(1)
                                    : 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Employees Section */}
            <div style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(40px)",
                border: "1px solid var(--glass-border)",
                padding: "3rem",
                borderRadius: "32px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease"
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--card-bg)', zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--foreground)", letterSpacing: "-0.5px" }}>Recent Employees</h2>
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            style={{
                                padding: "0.85rem 2.25rem",
                                background: "linear-gradient(135deg, #f97316, #ea580c)",
                                color: "white",
                                border: "none",
                                borderRadius: "14px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                fontSize: "1rem",
                                boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            Assign Task <ArrowUpRight size={20} />
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left" }}>
                                    <th style={{ padding: "0 1rem 1.5rem", color: "var(--text-muted)", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: '2px' }}>Employee</th>
                                    <th style={{ padding: "0 1rem 1.5rem", color: "var(--text-muted)", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: '2px' }}>Department</th>
                                    <th style={{ padding: "0 1rem 1.5rem", color: "var(--text-muted)", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: '2px' }}>Status</th>
                                    <th style={{ padding: "0 1rem 1.5rem", color: "var(--text-muted)", fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: '2px' }}>Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allEmployees.slice(0, 5).map((emp: any) => (
                                    <tr key={emp._id} style={{ borderTop: "1px solid var(--glass-border)" }}>
                                        <td style={{ padding: "1.8rem 1rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                                <div style={{
                                                    width: "52px",
                                                    height: "52px",
                                                    borderRadius: "16px",
                                                    background: "var(--glass-border)",
                                                    border: "1px solid var(--glass-border)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 900,
                                                    color: "var(--foreground)",
                                                    fontSize: "1.2rem",
                                                }}>
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 800, color: "var(--foreground)", fontSize: "1.15rem", marginBottom: "0.2rem" }}>{emp.name} {emp.lastName}</p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.8rem 1rem", color: "var(--foreground)", fontSize: "1rem", fontWeight: 700 }}>{emp.department || 'Global Operations'}</td>
                                        <td style={{ padding: "1.8rem 1rem" }}>
                                            <span style={{
                                                padding: '0.45rem 0.9rem',
                                                borderRadius: '8px',
                                                background: 'rgba(16, 185, 129, 0.08)',
                                                color: '#10b981',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                letterSpacing: '1px',
                                                border: '1px solid rgba(16, 185, 129, 0.15)'
                                            }}>ACTIVE</span>
                                        </td>
                                        <td style={{ padding: "1.8rem 1rem", color: "var(--text-muted)", fontSize: "1rem", fontWeight: 600 }}>
                                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '10/2/2026'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Task Assignment Modal */}
            {isAssignModalOpen && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
                }} onClick={() => setIsAssignModalOpen(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "100%", maxWidth: "500px",
                            background: "var(--sidebar-bg)",
                            border: '1px solid var(--glass-border)',
                            borderRadius: "28px",
                            padding: "2.5rem",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            animation: "modalFadeIn 0.3s ease-out"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)" }}>Assign New Task</h3>
                            <button onClick={() => setIsAssignModalOpen(false)} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer" }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleAssignTask} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Task Title</label>
                                <input
                                    required
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    style={{ padding: "0.85rem 1rem", borderRadius: "14px", background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)", outline: "none" }}
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 600 }}>Description</label>
                                <textarea
                                    required
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    style={{ padding: "0.85rem 1rem", borderRadius: "14px", background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)", outline: "none", minHeight: "100px" }}
                                    placeholder="Describe requirements..."
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Assign To</label>
                                    <select
                                        required
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                        style={{
                                            padding: "0.85rem 1rem",
                                            borderRadius: "14px",
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--glass-border)",
                                            color: "var(--foreground)",
                                            outline: "none",
                                            cursor: "pointer",
                                            fontSize: "1rem"
                                        }}
                                    >
                                        <option value="" style={{ background: "var(--sidebar-bg)", color: "var(--foreground)" }}>Select Employee</option>
                                        {(allEmployees as any[]).map((emp: any) => (
                                            <option key={emp._id} value={emp._id} style={{ background: "var(--sidebar-bg)", color: "var(--foreground)" }}>
                                                {emp.name} {emp.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <label style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        style={{ padding: "0.85rem 1rem", borderRadius: "14px", background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)", outline: "none" }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ marginTop: "1rem", padding: "1.1rem", borderRadius: "16px", background: "#6366f1", color: "white", border: "none", fontWeight: 800, cursor: "pointer" }}
                            >
                                {isSubmitting ? "Assigning..." : "Confirmed Assignment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(400px); } to { opacity: 1; transform: translateX(0); } }
            `}} />
        </div>
    )
}


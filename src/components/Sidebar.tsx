"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarCheck,
    Users,
    UserCircle,
    LogOut,
    ChevronDown,
    FileText
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
    role: "ADMIN" | "EMPLOYEE";
}

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isPagesOpen, setIsPagesOpen] = useState(false);

    const adminLinks = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
        { name: "Attendance", icon: <CalendarCheck size={20} />, path: "/admin/attendance" },
        { name: "Tasks", icon: <ClipboardList size={20} />, path: "/admin/tasks" },
        { name: "Leaves", icon: <FileText size={20} />, path: "/admin/leaves" },
        { name: "Employees", icon: <Users size={20} />, path: "/admin/employees" },
        { name: "Profile", icon: <UserCircle size={20} />, path: "/admin/profile" },
    ];

    const employeeLinks = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/employee/dashboard" },
        { name: "Attendance", icon: <CalendarCheck size={20} />, path: "/employee/attendance" },
        { name: "Tasks", icon: <ClipboardList size={20} />, path: "/employee/tasks" },
        { name: "Leaves", icon: <FileText size={20} />, path: "/employee/apply-leave" },
        { name: "Profile", icon: <UserCircle size={20} />, path: "/employee/profile" },
    ];

    const links = role === "ADMIN" ? adminLinks : employeeLinks;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <aside style={{
            width: "280px",
            minWidth: "280px",
            flexShrink: 0,
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--glass-border)",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            overflowY: "auto",
            zIndex: 100,
            transition: "all 0.3s ease"
        }}>
            <div style={{ padding: "2.5rem 1.5rem" }}>
                <div style={{
                    fontSize: "1.75rem",
                    fontWeight: 900,
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "3rem",
                    paddingLeft: "0.5rem",
                    cursor: "default"
                }}>
                    <div style={{
                        width: "35px",
                        height: "35px",
                        background: "linear-gradient(135deg, #f97316, #ea580c)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                        color: "white"
                    }}>E</div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>EMS</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, lineHeight: 1 }}>
                            {role === "ADMIN" ? "Admin Portal" : "Employee Portal"}
                        </span>
                    </div>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {links.map((link) => {
                        const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                        return (
                            <Link key={link.name} href={link.path} style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "0.875rem 1.25rem",
                                borderRadius: "14px",
                                color: isActive ? "var(--foreground)" : "var(--text-muted)",
                                background: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
                                transition: "all 0.2s ease-in-out",
                                fontWeight: isActive ? 700 : 500,
                                border: "1px solid",
                                borderColor: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                                position: "relative"
                            }}>
                                {isActive && (
                                    <div style={{
                                        position: "absolute",
                                        left: "0",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "4px",
                                        height: "18px",
                                        background: "#6366f1",
                                        borderRadius: "0 4px 4px 0"
                                    }} />
                                )}
                                <span style={{
                                    display: "flex",
                                    color: isActive ? "#818cf8" : "inherit",
                                    flexShrink: 0
                                }}>
                                    {link.icon}
                                </span>
                                <span style={{ fontSize: "0.95rem", whiteSpace: "nowrap" }}>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div style={{ marginTop: "auto", padding: "1.5rem" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                        e.currentTarget.style.color = "#ef4444";
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}


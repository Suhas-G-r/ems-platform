"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, AlertCircle, X } from "lucide-react";
import DeletionManagementModal from "@/components/DeletionManagementModal";

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    lastName?: string;
    designation?: string;
    avatar?: string;
}

function EmployeesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const query = searchParams.get('q') || '';

    // Deletion Modal state
    const [deletionModal, setDeletionModal] = useState({
        isOpen: false,
        userId: "",
        userName: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
        else fetchEmployees(token);
    }, [query]);

    const fetchEmployees = async (token: string) => {
        try {
            setLoading(true);
            const url = `/api/users?all=true${query ? `&q=${encodeURIComponent(query)}` : ''}`;
            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setEmployees(data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "4rem" }}>
            <header style={{ marginBottom: "3.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>
                        Employee <span className="text-gradient">Directory</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 500 }}>
                        {query ? `Search results for "${query}"` : "Manage staff lifecycle and safely decommission accounts."}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {query && (
                        <button
                            onClick={() => router.push('/admin/employees')}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.2rem",
                                borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer"
                            }}
                        >
                            <X size={16} /> Clear Search
                        </button>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="card glass" style={{ padding: "8rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid rgba(129, 140, 248, 0.1)", borderTopColor: "#818cf8", borderRadius: "50%" }} className="animate-spin"></div>
                    <p style={{ color: "#94a3b8", fontWeight: 600 }}>Loading staff members...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="card glass" style={{ padding: "6rem", textAlign: "center", borderRadius: "32px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <AlertCircle size={48} color="#64748b" style={{ marginBottom: "1.5rem" }} />
                    <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>
                        {query ? `No employees found matching "${query}"` : "No staff members found in this view."}
                    </p>
                    {query && (
                        <button onClick={() => router.push('/admin/employees')} className="btn glass" style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: "12px", color: "#818cf8" }}>Show All Employees</button>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "2rem" }}>
                    {employees.map((emp) => (
                        <div key={emp._id} className="card glass" style={{
                            padding: "2rem", borderRadius: "32px", display: "flex", flexDirection: "column", gap: "1.5rem",
                            border: "1px solid rgba(255,255,255,0.05)",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{
                                    width: "70px", height: "70px", borderRadius: "24px",
                                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.8rem", fontWeight: 800, color: "white",
                                    boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)"
                                }}>
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{emp.name} {emp.lastName}</h3>
                                    <p style={{ fontSize: "0.9rem", color: "#818cf8", fontWeight: 700 }}>{emp.department || "General"} Department</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Email</span>
                                    <span style={{ color: "white", fontWeight: 600 }}>{emp.email}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Designation</span>
                                    <span style={{ color: "white", fontWeight: 600 }}>{emp.designation || "N/A"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Role</span>
                                    <span style={{ color: emp.role === 'ADMIN' ? "#c084fc" : "#94a3b8", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>{emp.role}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                                <button
                                    onClick={() => setDeletionModal({ isOpen: true, userId: emp._id, userName: `${emp.name} ${emp.lastName}` })}
                                    className="btn glass"
                                    style={{ flex: 1, padding: "0.8rem", borderRadius: "16px", fontSize: "0.85rem", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                >
                                    <Trash2 size={16} /> Delete Account
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeletionManagementModal
                isOpen={deletionModal.isOpen}
                onClose={() => setDeletionModal({ ...deletionModal, isOpen: false })}
                userId={deletionModal.userId}
                userName={deletionModal.userName}
                onSuccess={() => {
                    setDeletionModal({ ...deletionModal, isOpen: false });
                    fetchEmployees(localStorage.getItem("token")!);
                }}
            />
        </div>
    );
}

export default function AdminEmployeesPage() {
    return (
        <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>Loading directory...</div>}>
            <EmployeesContent />
        </Suspense>
    );
}


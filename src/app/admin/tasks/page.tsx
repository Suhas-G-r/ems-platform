"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusModal from "@/components/StatusModal";
import {
    LayoutDashboard, CheckSquare, Users, FileText, Bell,
    Search, Filter, Plus, MoreVertical, Calendar, Clock,
    AlertCircle, CheckCircle2, XCircle, MessageSquare,
    Paperclip, Download, ChevronLeft, Send, Trash2
} from "lucide-react";

// --- Sub-Components ---

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AdminTask {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assignedTo: {
        _id: string;
        name: string;
    };
    assignedBy?: {
        name: string;
    };
    subtasks: { text: string; completed: boolean }[];
    uploadedFiles: { name: string; size: string; url: string }[];
    discussionMessages: { senderRole: string; message: string; timestamp: string }[];
}

const ProgressRing = ({ percentage, color = "#c084fc" }: { percentage: number, color?: string }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                    cx="50" cy="50" r={radius} fill="transparent"
                    stroke={color} strokeWidth="6" strokeDasharray={circumference}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)", strokeLinecap: "round" }}
                />
            </svg>
            <span style={{ position: "absolute", fontSize: "1rem", fontWeight: 800, color: "white" }}>{Math.round(percentage)}%</span>
        </div>
    );
};

function AdminTasksPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [viewingTask, setViewingTask] = useState<AdminTask | null>(null); // Active Detail View
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null; taskTitle: string }>({
        isOpen: false,
        taskId: null,
        taskTitle: ""
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Polling Ref
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "MEDIUM",
        dueDate: ""
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
        fetchData(token);

        // Scroll to highlighted item
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            setTimeout(() => {
                const element = document.getElementById(`task-${highlightId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [searchParams]);

    // Live Sync Logic
    useEffect(() => {
        if (viewingTask) {
            // Start polling when a task is open
            const token = localStorage.getItem("token");
            pollingRef.current = setInterval(() => {
                fetchSingleTask(viewingTask._id, token!);
            }, 3000); // Poll every 3 seconds for live updates
        } else {
            if (pollingRef.current) clearInterval(pollingRef.current);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [viewingTask]);

    const fetchData = async (token: string) => {
        try {
            const [tasksRes, usersRes] = await Promise.all([
                fetch("/api/tasks", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("/api/users", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const tasksData = await tasksRes.json();
            const usersData = await usersRes.json();

            if (tasksRes.ok) {
                let allTasks: AdminTask[] = tasksData.tasks || [];
                // Apply search filter if present in URL
                const query = searchParams.get('q');
                const highlight = searchParams.get('highlight');
                if (query && !highlight) {
                    const q = query.toLowerCase();
                    allTasks = allTasks.filter((t: AdminTask) =>
                        t.title.toLowerCase().includes(q) ||
                        t.description.toLowerCase().includes(q) ||
                        t.assignedTo?.name?.toLowerCase().includes(q)
                    );
                }
                setTasks(allTasks);
            }
            if (usersRes.ok) {
                const onlyEmployees = (usersData.users || []).filter((u: User) => u.role === 'EMPLOYEE');
                setEmployees(onlyEmployees);
            }
        } catch (error) {
            console.error("Failed to fetch tasks/users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleTask = async (taskId: string, token: string) => {
        try {
            // In a real app, you might have specific GET /api/tasks/:id route returning full details.
            // Since our list endpoint returns everything, we can just re-fetch the list or use a specific endpoint if available.
            // Actually, querying the list constantly is heavy. Ideally we want GET /api/tasks/:id.
            // But for now, we will just re-fetch the list and find the task, as the backend structure supports it.
            const res = await fetch("/api/tasks", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                const updatedTasks: AdminTask[] = data.tasks || [];
                setTasks(updatedTasks);
                const active = updatedTasks.find((t: AdminTask) => t._id === taskId);
                if (active) setViewingTask(active);
            }
        } catch (err) {
            console.error("Polling error", err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setModal({
                    isOpen: true,
                    title: "Task Assigned!",
                    message: "The new task has been successfully assigned to the employee.",
                    type: "success"
                });
                setIsCreating(false);
                setFormData({ title: "", description: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
                fetchData(token!);
                window.dispatchEvent(new Event('notification-created'))
                localStorage.setItem('notification-event', Date.now().toString())
            } else {
                throw new Error("Failed to create task");
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Error",
                message: "Could not create task. Please check if all fields are filled.",
                type: "error"
            });
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !viewingTask || isSending) return;
        const token = localStorage.getItem("token");
        setIsSending(true);
        try {
            const res = await fetch(`/api/tasks/${viewingTask._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (res.ok) {
                setNewMessage("");
                fetchSingleTask(viewingTask._id, token!); // Instant refresh
            }
        } catch (err) {
            console.error("Message failed", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!taskId) return;
        const token = localStorage.getItem("token");
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setModal({
                    isOpen: true,
                    title: "Task Deleted",
                    message: "The task has been successfully deleted.",
                    type: "success"
                });
                setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: "" });
                if (viewingTask?._id === taskId) {
                    setViewingTask(null);
                }
                fetchData(token!);
            } else {
                setModal({
                    isOpen: true,
                    title: "Error",
                    message: "Failed to delete task.",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Delete failed", error);
            setModal({
                isOpen: true,
                title: "Error",
                message: "An error occurred while deleting the task.",
                type: "error"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "1rem",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "white",
        fontSize: "1rem",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.6rem",
        color: "#94a3b8",
        fontWeight: 600,
        fontSize: "0.85rem",
        textTransform: "uppercase" as const
    };

    // Calculate progress for viewingTask
    const getProgress = (task: AdminTask) => {
        if (!task || !task.subtasks || task.subtasks.length === 0) return 0;
        const completed = task.subtasks.filter((s: { completed: boolean }) => s.completed).length;
        return (completed / task.subtasks.length) * 100;
    };

    if (viewingTask) {
        const progress = getProgress(viewingTask);
        const isCompleted = progress === 100 || viewingTask.status === 'DONE';

        return (
            <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
                <header style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <button
                            onClick={() => setViewingTask(null)}
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", fontSize: "1.2rem" }}
                        >
                            <ChevronLeft />
                        </button>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Task Workspace</span>
                                <span style={{ fontSize: "0.8rem", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", padding: "0.1rem 0.6rem", borderRadius: "6px", fontWeight: 700 }}>LIVE SYNC ACTIVE</span>
                            </div>
                            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "white" }}>{viewingTask.title}</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setDeleteConfirm({ isOpen: true, taskId: viewingTask._id, taskTitle: viewingTask.title })}
                        style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "14px",
                            padding: "0.8rem 1.5rem",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            transition: "all 0.3s",
                            fontSize: "0.95rem"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                    >
                        <Trash2 size={18} /> Delete Task
                    </button>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "2rem" }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                        {/* Task Details Card */}
                        <div className="card glass" style={{ padding: "2.5rem", borderRadius: "32px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                                <div>
                                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Assigned Employee</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white" }}>
                                            {viewingTask.assignedTo?.name?.charAt(0)}
                                        </div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>{viewingTask.assignedTo?.name}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Due Date</p>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>{new Date(viewingTask.dueDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{viewingTask.description}</p>
                            </div>
                        </div>

                        {/* Subtasks Monitor */}
                        <div className="card glass" style={{ padding: "2.5rem", borderRadius: "32px" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <CheckSquare size={20} className="text-[#6366f1]" /> Employee Execution Points
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {(!viewingTask.subtasks || viewingTask.subtasks.length === 0) ? (
                                    <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px" }}>
                                        No execution points added by employee yet.
                                    </div>
                                ) : (
                                    viewingTask.subtasks.map((st: { text: string; completed: boolean }, i: number) => (
                                        <div key={i} style={{
                                            display: "flex", alignItems: "center", gap: "1rem",
                                            padding: "1.2rem 1.5rem", borderRadius: "16px",
                                            background: st.completed ? "rgba(34, 197, 94, 0.05)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${st.completed ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.05)"}`
                                        }}>
                                            <div style={{
                                                width: "24px", height: "24px", borderRadius: "8px",
                                                background: st.completed ? "#22c55e" : "rgba(255,255,255,0.1)",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                {st.completed && <CheckCircle2 size={16} color="white" />}
                                            </div>
                                            <span style={{
                                                flex: 1,
                                                color: st.completed ? "#94a3b8" : "white",
                                                textDecoration: st.completed ? "line-through" : "none",
                                                fontWeight: 500
                                            }}>{st.text}</span>
                                            {st.completed && <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 700, background: "rgba(34, 197, 94, 0.1)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>COMPLETED</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Files Section */}
                        <div className="card glass" style={{ padding: "2.5rem", borderRadius: "32px" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "white", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <Paperclip size={20} className="text-[#f43f5e]" /> Uploaded Assets
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                {(!viewingTask.uploadedFiles || viewingTask.uploadedFiles.length === 0) ? (
                                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "#64748b", background: "rgba(0,0,0,0.2)", borderRadius: "16px" }}>
                                        No documents uploaded yet.
                                    </div>
                                ) : (
                                    viewingTask.uploadedFiles.map((file: { name: string; size: string; url: string }, i: number) => (
                                        <div key={i} style={{ padding: "1.2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                                            <div style={{ marginBottom: "0.8rem", color: "white", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{file.size}</span>
                                                <a href={file.url} download target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,0.1)", padding: "6px", borderRadius: "8px", color: "white", display: "flex" }}>
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                        {/* Progress Card */}
                        <div className="card glass" style={{ padding: "2.5rem", borderRadius: "32px", textAlign: "center" }}>
                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "1.5rem" }}>Task Progress</p>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                                <ProgressRing percentage={progress} color={progress === 100 ? "#22c55e" : "#818cf8"} />
                            </div>
                            <div style={{ background: isCompleted ? "rgba(34, 197, 94, 0.1)" : "rgba(129, 140, 248, 0.1)", color: isCompleted ? "#22c55e" : "#818cf8", padding: "0.8rem", borderRadius: "12px", fontWeight: 800 }}>
                                {isCompleted ? "Completed" : "In Progress"}
                            </div>
                        </div>

                        {/* Discussion / Chat */}
                        <div className="card glass" style={{ padding: "0", borderRadius: "32px", overflow: "hidden", display: "flex", flexDirection: "column", height: "600px" }}>
                            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    <MessageSquare size={18} /> Direct Discussion
                                </h3>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {(!viewingTask.discussionMessages || viewingTask.discussionMessages.length === 0) ? (
                                    <div style={{ margin: "auto", color: "#64748b", textAlign: "center", maxWidth: "200px" }}>
                                        <p>No messages exchanged.</p>
                                        <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Start the thread below.</p>
                                    </div>
                                ) : (
                                    viewingTask.discussionMessages.map((msg: { senderRole: string; message: string; timestamp: string }, i: number) => {
                                        const isAdmin = msg.senderRole === "ADMIN";
                                        return (
                                            <div key={i} style={{ alignSelf: isAdmin ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                                                <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "4px", textAlign: isAdmin ? "right" : "left" }}>
                                                    {isAdmin ? "You (Admin)" : "Employee"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div style={{
                                                    padding: "1rem 1.2rem",
                                                    borderRadius: isAdmin ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                                    background: isAdmin ? "#6366f1" : "rgba(255,255,255,0.1)",
                                                    color: "white",
                                                    fontSize: "0.95rem",
                                                    lineHeight: 1.5
                                                }}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            <div style={{ padding: "1.2rem", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.8rem" }}>
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isSending ? "Sending message..." : "Type instructions or feedback..."}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    disabled={isSending}
                                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "12px", padding: "0.8rem 1rem", color: "white", outline: "none", opacity: isSending ? 0.7 : 1 }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isSending || !newMessage.trim()}
                                    style={{
                                        width: "45px",
                                        background: isSending || !newMessage.trim() ? "rgba(249, 115, 22, 0.4)" : "#f97316",
                                        border: "none",
                                        borderRadius: "12px",
                                        color: "white",
                                        cursor: isSending ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.3s"
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem" }}>
                <header>
                    <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>
                        Task <span className="text-gradient">Orchestrator</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 500 }}>
                        Assign objectives, track progress, and verify completions.
                    </p>
                </header>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn btn-primary"
                    style={{ padding: "1rem 2.5rem", borderRadius: "18px", fontSize: "1.1rem" }}
                >
                    Assign New Task ➕
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2.5rem" }}>
                {loading ? (
                    <div className="card glass" style={{ padding: "4rem", textAlign: "center", gridColumn: "1 / -1" }}>Loading task list...</div>
                ) : tasks.length === 0 ? (
                    <div className="card glass" style={{ padding: "5rem", textAlign: "center", gridColumn: "1 / -1", borderRadius: "40px" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>No active tasks at the moment.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            id={`task-${task._id}`}
                            className={`card glass ${searchParams.get('highlight') === task._id ? 'search-highlight' : ''}`}
                            style={{ padding: "0", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}
                        >
                            {/* Header: Assigned To */}
                            <div style={{
                                padding: "1.5rem 2rem",
                                background: "rgba(255,255,255,0.03)",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "12px",
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: 800, fontSize: "1rem", color: "white"
                                    }}>
                                        {task.assignedTo?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Assigned To</p>
                                        <h4 style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{task.assignedTo?.name || "Unassigned"}</h4>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: "0.75rem", padding: "0.3rem 0.8rem", borderRadius: "100px", fontWeight: 800,
                                    background: task.status === 'DONE' ? 'rgba(34, 197, 94, 0.1)' : task.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: task.status === 'DONE' ? '#22c55e' : task.status === 'IN_PROGRESS' ? '#3b82f6' : '#94a3b8',
                                    border: "1px solid currentColor"
                                }}>
                                    {task.status?.replace('_', ' ') || "TODO"}
                                </span>
                            </div>

                            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white" }}>{task.title}</h3>
                                    <span style={{
                                        fontSize: "0.7rem", fontWeight: 800, color: task.priority === 'HIGH' ? '#ef4444' : task.priority === 'MEDIUM' ? '#f59e0b' : '#10b981',
                                        padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)"
                                    }}>{task.priority}</span>
                                </div>
                                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontSize: "0.95rem" }}>{task.description}</p>

                                <div style={{ marginTop: "auto", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                                    <span>Due: <span style={{ color: "white" }}>{new Date(task.dueDate).toLocaleDateString()}</span></span>
                                    {task.assignedBy?.name && (
                                        <span>By: {task.assignedBy.name}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions / View Details */}
                            <div style={{ padding: "1rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem" }}>
                                <button
                                    onClick={() => setViewingTask(task)}
                                    style={{ flex: 1, padding: "0.8rem", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                                >
                                    <LayoutDashboard size={16} /> Enter Workspace
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm({ isOpen: true, taskId: task._id, taskTitle: task.title })}
                                    style={{
                                        padding: "0.8rem 1rem",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        borderRadius: "12px",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.4rem",
                                        fontWeight: 700,
                                        transition: "all 0.3s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                                    title="Delete this task"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Task Modal - Updated Layout & Buttons */}
            {isCreating && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    zIndex: 2000,
                    padding: "2rem",
                    paddingTop: "4rem"
                }}>
                    <div className="card glass" style={{
                        width: "100%",
                        maxWidth: "600px",
                        padding: "3rem",
                        borderRadius: "32px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "2rem", textAlign: "center" }}>
                            Assign New <span className="text-gradient">Task</span>
                        </h2>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={labelStyle}>Task Title</label>
                                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Assign To Employee</label>
                                <select required value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} style={inputStyle}>
                                    <option value="" style={{ background: "#1e293b", color: "white" }}>Select an employee</option>
                                    {/* Updated: Filtered admins out in fetchData, and displaying only name here */}
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id} style={{ background: "#1e293b", color: "white" }}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>Priority</label>
                                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={inputStyle}>
                                        <option value="LOW" style={{ background: "#1e293b", color: "white" }}>Low</option>
                                        <option value="MEDIUM" style={{ background: "#1e293b", color: "white" }}>Medium</option>
                                        <option value="HIGH" style={{ background: "#1e293b", color: "white" }}>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Due Date</label>
                                    <input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "none" }} />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    style={{
                                        flex: 1,
                                        padding: "1rem",
                                        borderRadius: "14px",
                                        background: "transparent",
                                        border: "1px solid rgba(255, 255, 255, 0.2)",
                                        color: "white",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 2,
                                        padding: "1rem",
                                        borderRadius: "14px",
                                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                        border: "none",
                                        color: "white",
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        boxShadow: "0 4px 14px 0 rgba(249, 115, 22, 0.39)"
                                    }}
                                >
                                    Assign Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2001,
                    padding: "2rem"
                }} onClick={() => !isDeleting && setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: "" })}>
                    <div className="card glass" style={{
                        width: "100%",
                        maxWidth: "450px",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1rem", color: "white" }}>
                            Delete Task?
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                            Are you sure you want to delete <span style={{ fontWeight: 700, color: "white" }}>"{deleteConfirm.taskTitle}"</span>?
                        </p>
                        <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "0.85rem" }}>
                            This action cannot be undone. The employee will not receive this task.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: "" })}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: "0.9rem",
                                    borderRadius: "12px",
                                    background: "transparent",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    color: "white",
                                    fontWeight: 700,
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    opacity: isDeleting ? 0.6 : 1
                                }}
                                onMouseOver={(e) => !isDeleting && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                onMouseOut={(e) => !isDeleting && (e.currentTarget.style.background = "transparent")}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteConfirm.taskId && handleDeleteTask(deleteConfirm.taskId)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: "0.9rem",
                                    borderRadius: "12px",
                                    background: isDeleting ? "rgba(239, 68, 68, 0.5)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    border: "none",
                                    color: "white",
                                    fontWeight: 800,
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {isDeleting ? "Deleting..." : "Delete Task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminTasksPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "white" }}>
                Loading Task Management...
            </div>
        }>
            <AdminTasksPageContent />
        </Suspense>
    );
}

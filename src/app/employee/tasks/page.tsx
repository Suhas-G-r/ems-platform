"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusModal from "@/components/StatusModal";

// --- Premium Minimal Icons (Lucide Style) ---
const PaperclipIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);

const MessageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

// Add hover styles for msg-container
const globalStyles = `
  .msg-container:hover .msg-actions { opacity: 1 !important; }
`;

// --- Sub-Components ---

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

interface Comment {
    id: string;
    author: string;
    text: string;
    time: string;
    seen: boolean;
}

interface Subtask {
    _id: string;
    text: string;
    completed: boolean;
}

interface UploadedFile {
    name: string;
    size: string;
    url: string;
    time: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    subtasks: Subtask[];
    comments: Comment[];
    uploadedFiles: UploadedFile[];
}

const ModalOverlay = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }} onClick={onClose}>
            <div
                className="glass animate-fade-in"
                style={{ width: "100%", maxWidth: "650px", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", boxShadow: "0 0 50px rgba(0,0,0,0.5)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: "1.8rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white" }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: "1.8rem", cursor: "pointer", opacity: 0.6 }}>&times;</button>
                </div>
                <div style={{ padding: "2.5rem" }}>{children}</div>
            </div>
        </div>
    );
};

function EmployeeTasksPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [modalView, setModalView] = useState<"files" | "comments" | null>(null);
    const [newSubtask, setNewSubtask] = useState("");
    const [newComment, setNewComment] = useState("");
    const [editingSubtask, setEditingSubtask] = useState<{ taskId: string, stId: string, text: string } | null>(null);
    const [editingMessage, setEditingMessage] = useState<{ taskId: string, msgId: string, text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchTasks(token);

        // Scroll to highlighted item
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            setTimeout(() => {
                const element = document.getElementById(`task-${highlightId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [searchParams]);

    const fetchTasks = async (token: string) => {
        try {
            const res = await fetch(`/api/tasks?t=${Date.now()}`, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                const currentUserId = userData.id || userData._id;

                const enrichedTasks: Task[] = (data.tasks || []).map((t: any) => ({
                    ...t,
                    subtasks: t.subtasks || [],
                    comments: (t.discussionMessages || []).map((m: any) => ({
                        id: m._id,
                        author: (m.senderId === currentUserId || m.senderRole?.toUpperCase() === 'EMPLOYEE') ? 'You' : 'Admin',
                        text: m.message,
                        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        seen: m.seen
                    })),
                    uploadedFiles: (t.uploadedFiles || []).map((f: any) => ({
                        name: f.name,
                        size: f.size,
                        url: f.url,
                        time: f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : 'Unknown'
                    }))
                }));
                let allTasks = enrichedTasks;
                // Apply search filter if present in URL
                const query = searchParams.get('q');
                const highlight = searchParams.get('highlight');
                if (query && !highlight) {
                    const q = query.toLowerCase();
                    allTasks = allTasks.filter((t: Task) =>
                        t.title.toLowerCase().includes(q) ||
                        t.description.toLowerCase().includes(q)
                    );
                }
                setTasks(allTasks);

                if (activeTask) {
                    const refreshed = enrichedTasks.find((t: Task) => t._id === activeTask._id);
                    if (refreshed) setActiveTask(refreshed);
                }
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const updateTaskOnDB = async (taskId: string, payload: any) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json();
                alert(`Update Failed: ${data.error || 'Server error'}`);
            }
            return res.ok;
        } catch (err) {
            console.error("DB Update Error:", err);
            alert("Connection error occurred. Please try again.");
            return false;
        }
    };

    const toggleSubtask = async (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const currentSubtasks = task.subtasks || [];
        const updatedSubtasks = currentSubtasks.map((st: Subtask) =>
            st._id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        // Calculate status based on completion
        const completedCount = updatedSubtasks.filter((st: any) => st.completed).length;
        const totalCount = updatedSubtasks.length;
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        let newStatus = task.status;
        if (percentage === 100) {
            newStatus = 'DONE';
        } else if (percentage > 0) {
            newStatus = 'IN_PROGRESS';
        } else if (percentage === 0 && totalCount > 0) {
            newStatus = task.status === 'DONE' ? 'IN_PROGRESS' : task.status;
        }

        // Optimistic UI
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: updatedSubtasks, status: newStatus } : t));
        if (activeTask?._id === taskId) setActiveTask({ ...activeTask, subtasks: updatedSubtasks, status: newStatus });

        const success = await updateTaskOnDB(taskId, { subtasks: updatedSubtasks, status: newStatus });
        if (!success) fetchTasks(localStorage.getItem("token") || ""); // Rollback
    };

    const addSubtask = async (taskId: string) => {
        if (!newSubtask.trim() || isAddingSubtask) return;
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        setIsAddingSubtask(true);
        const currentSubtasks = task.subtasks || [];
        const updatedSubtasks = [...currentSubtasks, { text: newSubtask, completed: false }];

        // Re-calculate status
        let newStatus = 'IN_PROGRESS';
        if (task.status === 'DONE') newStatus = 'IN_PROGRESS';

        try {
            const success = await updateTaskOnDB(taskId, { subtasks: updatedSubtasks, status: newStatus });
            if (success) {
                setNewSubtask("");
                const token = localStorage.getItem("token");
                if (token) fetchTasks(token);
            }
        } finally {
            setIsAddingSubtask(false);
        }
    };

    const deleteSubtask = async (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const currentSubtasks = task.subtasks || [];
        const updatedSubtasks = currentSubtasks.filter((st: Subtask) => st._id !== subtaskId);

        // Re-calculate status
        const completedCount = updatedSubtasks.filter((st: Subtask) => st.completed).length;
        const totalCount = updatedSubtasks.length;
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        let newStatus = task.status;
        if (percentage === 100 && totalCount > 0) newStatus = 'DONE';
        else if (percentage > 0) newStatus = 'IN_PROGRESS';

        const success = await updateTaskOnDB(taskId, { subtasks: updatedSubtasks, status: newStatus });
        if (success) {
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: updatedSubtasks, status: newStatus } : t));
            if (activeTask?._id === taskId) setActiveTask({ ...activeTask, subtasks: updatedSubtasks, status: newStatus });
        }
    };

    const editSubtask = async () => {
        if (!editingSubtask || !editingSubtask.text.trim()) return;
        const { taskId, stId, text } = editingSubtask;
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const currentSubtasks = task.subtasks || [];
        const updatedSubtasks = currentSubtasks.map((st: Subtask) =>
            st._id === stId ? { ...st, text } : st
        );

        const success = await updateTaskOnDB(taskId, { subtasks: updatedSubtasks });
        if (success) {
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t));
            setEditingSubtask(null);
        }
    };

    const sendComment = async (taskId: string) => {
        if (!newComment.trim() || isSendingComment) return;
        const token = localStorage.getItem("token");
        setIsSendingComment(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: newComment })
            });

            if (res.ok) {
                const { newMessage } = await res.json();
                setTasks(prev => prev.map(t => {
                    if (t._id === taskId) {
                        const mappedMsg = {
                            id: newMessage._id || newMessage.id,
                            author: 'You',
                            text: newMessage.message,
                            time: 'Just now',
                            seen: false
                        };
                        const updated = [...(t.comments || []), mappedMsg];
                        if (activeTask?._id === taskId) setActiveTask({ ...t, comments: updated });
                        return { ...t, comments: updated };
                    }
                    return t;
                }));
                setNewComment("");
            } else {
                const data = await res.json();
                alert(`Query Failed: ${data.error || 'Server error'}`);
            }
        } catch (err) {
            console.error("Message Error:", err);
            alert("Failed to send message. Please check your connection.");
        } finally {
            setIsSendingComment(false);
        }
    };

    const deleteMessage = async (taskId: string, messageId: string) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/tasks/${taskId}/messages?messageId=${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, comments: (t.comments || []).filter((c: Comment) => c.id !== messageId) } : t));
                if (activeTask?._id === taskId) {
                    setActiveTask((prev: Task | null) => prev ? ({ ...prev, comments: prev.comments.filter((c: Comment) => c.id !== messageId) }) : null);
                }
                fetchTasks(token || "");
            } else {
                alert("Could not delete message. You might not have permission.");
            }
        } catch (err) { console.error(err); }
    };

    const editMessage = async () => {
        if (!editingMessage || !editingMessage.text.trim()) return;
        const { taskId, msgId, text } = editingMessage;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/tasks/${taskId}/messages`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messageId: msgId, text })
            });

            if (res.ok) {
                setTasks(prev => prev.map(t => {
                    if (t._id === taskId) {
                        const updated = (t.comments || []).map((c: Comment) => c.id === msgId ? { ...c, text } : c);
                        if (activeTask?._id === taskId) setActiveTask({ ...t, comments: updated });
                        return { ...t, comments: updated };
                    }
                    return t;
                }));
                setEditingMessage(null);
                fetchTasks(token || "");
            } else {
                alert("Failed to update message.");
            }
        } catch (err) { console.error(err); }
    };

    const getDueStatus = (dueDate: string, isCompleted: boolean = false) => {
        if (isCompleted) return { text: "Done", color: "#22c55e" };
        const diff = new Date(dueDate).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: "Overdue", color: "#f43f5e" };
        if (days === 0) return { text: "Due Today", color: "#f97316" };
        return { text: `Due in ${days} days`, color: days <= 3 ? "#f97316" : "#22c55e" };
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            {!viewingTaskId ? (
                <div className="animate-fade-in">
                    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem" }}>
                        <div>
                            <h1 className="text-gradient" style={{ fontSize: "3.2rem", fontWeight: 900, marginBottom: "0.5rem", letterSpacing: "-2px" }}>My Task Hub</h1>
                            <p style={{ color: "#94a3b8", fontSize: "1.2rem", fontWeight: 500 }}>Select a project to enter its dedicated tracking interface.</p>
                        </div>
                        <div style={{ padding: "0.8rem 1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>
                            {tasks.length} Active {tasks.length === 1 ? 'Project' : 'Projects'}
                        </div>
                    </header>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2.2rem" }}>
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="glass" style={{ height: "300px", borderRadius: "32px", opacity: 0.15 }} />
                            ))
                        ) : tasks.length === 0 ? (
                            <div className="glass" style={{ gridColumn: "1/-1", padding: "6rem 2rem", textAlign: "center", borderRadius: "32px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎯</div>
                                <h3 style={{ fontSize: "1.8rem", color: "white", fontWeight: 800, marginBottom: "0.5rem" }}>Clean Registry</h3>
                                <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto" }}>You&apos;ve cleared all assigned tracks. Rest up or sync with Admin for new assignment targets.</p>
                            </div>
                        ) : (
                            tasks.map((task) => {
                                const due = getDueStatus(task.dueDate, task.status === 'DONE');
                                const priorityColors: Record<string, string> = { HIGH: "#f43f5e", MEDIUM: "#f97316", LOW: "#22c55e" };
                                return (
                                    <div
                                        key={task._id}
                                        id={`task-${task._id}`}
                                        className={`glass ${searchParams.get('highlight') === task._id ? 'search-highlight' : ''}`}
                                        style={{
                                            padding: "2.8rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(2, 6, 23, 0.4)", display: "flex", flexDirection: "column", gap: "1.8rem", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", overflow: "hidden"
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "none"; }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ padding: "0.4rem 1.2rem", background: `${priorityColors[task.priority]}15`, color: priorityColors[task.priority], borderRadius: "100px", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "1px" }}>
                                                {task.priority || 'NORMAL'}
                                            </div>
                                            <div style={{ color: due.color, fontSize: "0.85rem", fontWeight: 700 }}>
                                                {task.status === 'DONE' ? '✅' : '📅'} {due.text}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "0.8rem", letterSpacing: "-0.5px" }}>{task.title}</h3>
                                            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "4.8rem" }}>
                                                {task.description}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => { setViewingTaskId(task._id); setActiveTask(task); }}
                                            style={{ marginTop: "1rem", width: "100%", padding: "1.2rem", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "white", border: "none", borderRadius: "20px", fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)", transition: "all 0.3s ease" }}
                                            onMouseOver={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.boxShadow = "0 15px 35px rgba(99, 102, 241, 0.5)"; }}
                                            onMouseOut={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(99, 102, 241, 0.3)"; }}
                                        >
                                            Enter Workspace →
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {(() => {
                        const task = tasks.find(t => t._id === viewingTaskId);
                        if (!task) { setViewingTaskId(null); return null; }

                        const subtasks = task.subtasks || [];
                        const progress = subtasks.length ? (subtasks.filter((st: Subtask) => st.completed).length / subtasks.length) * 100 : 0;
                        const dueInfo = getDueStatus(task.dueDate, progress === 100);

                        return (
                            <>
                                <header style={{ marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1.8rem" }}>
                                    <button
                                        onClick={() => setViewingTaskId(null)}
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", width: "52px", height: "52px", borderRadius: "18px", color: "white", cursor: "pointer", fontSize: "1.4rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                        title="Back to Hub"
                                    >←</button>
                                    <div>
                                        <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px", opacity: 0.8 }}>Active Project Workspace</div>
                                        <h1 className="text-gradient" style={{ fontSize: "2.6rem", fontWeight: 900, letterSpacing: "-1.5px" }}>{task.title}</h1>
                                    </div>
                                </header>

                                <div className="glass" style={{
                                    borderRadius: "40px", display: "grid", gridTemplateColumns: "1fr 340px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", minHeight: "680px"
                                }}>
                                    <div style={{ padding: "4rem", background: "rgba(2, 6, 23, 0.4)" }}>
                                        <div style={{ display: "flex", gap: "1.2rem", marginBottom: "4rem" }}>
                                            <button
                                                onClick={() => { setActiveTask(task); setModalView("files"); }}
                                                style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", borderRadius: "18px", color: "white", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "none"; }}
                                            >
                                                <PaperclipIcon /> Attach Documents
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setActiveTask(task);
                                                    setModalView("comments");
                                                    const token = localStorage.getItem("token");
                                                    if (token) {
                                                        await fetch(`/api/tasks/${task._id}/messages/read`, {
                                                            method: 'PATCH',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                    }
                                                }}
                                                style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(129, 140, 248, 0.08)", border: "1px solid rgba(129, 140, 248, 0.15)", padding: "1rem 2rem", borderRadius: "18px", color: "#818cf8", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(129, 140, 248, 0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(129, 140, 248, 0.15)"; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(129, 140, 248, 0.08)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                                            >
                                                <MessageIcon /> Support Discussion {task.comments?.length > 0 && `(${task.comments.length})`}
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: "3rem" }}>
                                            <h4 style={{ color: "white", fontSize: "1.4rem", fontWeight: 900, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                                <span style={{ opacity: 0.3, fontStyle: "italic", fontSize: "1.2rem" }}>01.</span> Task Action Points
                                            </h4>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {subtasks.length === 0 ? (
                                                    <div style={{ padding: "3rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                                                        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Checkpoint list is currently auto-generating. Add your first execution point below.</p>
                                                    </div>
                                                ) : (
                                                    subtasks.map((st: Subtask, idx: number) => (
                                                        <div
                                                            key={st._id || `idx-${idx}`}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: "1.2rem",
                                                                padding: "1.2rem 1.6rem", borderRadius: "16px",
                                                                background: "rgba(15, 23, 42, 0.6)", // Darker standard background
                                                                border: "1px solid rgba(255,255,255,0.08)",
                                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                position: "relative"
                                                            }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)"; e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                                        >
                                                            <div
                                                                onClick={() => toggleSubtask(task._id, st._id)}
                                                                style={{
                                                                    width: "24px", height: "24px", borderRadius: "50%", // Circular check
                                                                    border: `2px solid ${st.completed ? "#22c55e" : "rgba(255,255,255,0.2)"}`,
                                                                    background: st.completed ? "#22c55e" : "transparent",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    cursor: "pointer", transition: "all 0.2s", flexShrink: 0
                                                                }}
                                                            >
                                                                {st.completed && <span style={{ color: "#000", fontWeight: 900, fontSize: "0.75rem" }}>✓</span>}
                                                            </div>

                                                            {editingSubtask?.stId === st._id ? (
                                                                <input
                                                                    autoFocus
                                                                    style={{ flex: 1, background: "transparent", border: "none", color: "white", outline: "none", fontSize: "1rem", fontWeight: 500 }}
                                                                    value={editingSubtask?.text || ""}
                                                                    onChange={(e) => editingSubtask && setEditingSubtask({ ...editingSubtask, text: e.target.value })}
                                                                    onKeyDown={(e) => e.key === 'Enter' && editSubtask()}
                                                                    onBlur={() => editSubtask()}
                                                                />
                                                            ) : (
                                                                <span
                                                                    onClick={() => toggleSubtask(task._id, st._id)}
                                                                    style={{
                                                                        flex: 1,
                                                                        color: st.completed ? "#64748b" : "#e2e8f0",
                                                                        textDecoration: st.completed ? "line-through" : "none",
                                                                        fontSize: "1rem",
                                                                        fontWeight: 500,
                                                                        cursor: "pointer",
                                                                        transition: "all 0.2s"
                                                                    }}
                                                                >
                                                                    {st.text}
                                                                </span>
                                                            )}

                                                            <div style={{ display: "flex", gap: "0.25rem" }} className="action-btns">
                                                                <button onClick={() => setEditingSubtask({ taskId: task._id, stId: st._id, text: st.text })}
                                                                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", borderRadius: "6px", transition: "all 0.2s", fontSize: "0.9rem" }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "none"; }}>
                                                                    <EditIcon />
                                                                </button>
                                                                <button onClick={() => deleteSubtask(task._id, st._id)}
                                                                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", borderRadius: "6px", transition: "all 0.2s", fontSize: "0.9rem" }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "none"; }}>
                                                                    <TrashIcon />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div style={{ marginTop: "2rem", position: "relative" }}>
                                                <input
                                                    type="text" placeholder={isAddingSubtask ? "Creating point..." : "Add a new execution checkpoint..."} value={newSubtask}
                                                    onChange={(e) => setNewSubtask(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addSubtask(task._id)}
                                                    disabled={isAddingSubtask}
                                                    style={{ width: "100%", padding: "1.2rem 1.6rem", borderRadius: "18px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontSize: "1rem", opacity: isAddingSubtask ? 0.7 : 1 }}
                                                />
                                                <button
                                                    onClick={() => addSubtask(task._id)}
                                                    disabled={isAddingSubtask || !newSubtask.trim()}
                                                    style={{ position: "absolute", right: "10px", top: "10px", bottom: "10px", padding: "0 1.5rem", background: isAddingSubtask || !newSubtask.trim() ? "rgba(99, 102, 241, 0.2)" : "#6366f1", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: isAddingSubtask ? "not-allowed" : "pointer", transition: "all 0.2s", fontSize: "0.9rem" }}
                                                    onMouseOver={(e) => { if (!isAddingSubtask && newSubtask.trim()) e.currentTarget.style.background = "#4f46e5"; }}
                                                    onMouseOut={(e) => { if (!isAddingSubtask && newSubtask.trim()) e.currentTarget.style.background = "#6366f1"; }}
                                                >
                                                    {isAddingSubtask ? "Adding..." : "Add Points"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: "4rem 3rem", borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "4.5rem", background: "rgba(2, 6, 23, 0.2)" }}>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "2.5rem" }}>Progress Status</p>
                                            <ProgressRing percentage={progress} />
                                        </div>

                                        <div>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1.5rem" }}>Priority Level</p>
                                            <div style={{
                                                padding: "1.4rem", borderRadius: "20px", background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.1)",
                                                textAlign: "center", color: "#22c55e", fontWeight: 900, fontSize: "1.2rem", letterSpacing: "1.5px"
                                            }}>
                                                {task.priority || 'NORMAL'}
                                            </div>
                                        </div>

                                        <div>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1.5rem" }}>Time Constraints</p>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white", marginBottom: "0.6rem", letterSpacing: "-0.5px" }}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                            <div style={{ color: dueInfo.color, fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                {progress === 100 ? "✅" : "⏱️"} {dueInfo.text}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            <ModalOverlay isOpen={modalView === "files"} onClose={() => setModalView(null)} title="Project Documentation">
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "24px", padding: "3rem", textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📁</div>
                        <p style={{ color: "white", fontWeight: 700 }}>Drag project assets here</p>
                        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>Max payload: 1GB per file</p>
                    </div>

                    {isUploading && (
                        <div style={{ padding: "1.5rem", borderRadius: "20px", background: "rgba(255,255,255,0.03)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", fontSize: "0.85rem" }}>
                                <span style={{ color: "white", fontWeight: 700 }}>Uploading 1GB Asset...</span>
                                <span style={{ color: "#818cf8" }}>85%</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: "85%", height: "100%", background: "linear-gradient(to right, #6366f1, #c084fc)" }} />
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 800, marginBottom: "1.2rem", textTransform: "uppercase" }}>Uploaded Files</h4>
                        {!activeTask?.uploadedFiles || activeTask.uploadedFiles.length === 0 ? (
                            <p style={{ color: "#475569", fontSize: "0.95rem", padding: "2rem", textAlign: "center", background: "rgba(0,0,0,0.1)", borderRadius: "16px" }}>No documents attached specifically for this task yet.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {activeTask?.uploadedFiles.map((file: UploadedFile) => (
                                    <div key={file.url} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div>
                                            <p style={{ color: "white", fontSize: "0.95rem", fontWeight: 600 }}>{file.name}</p>
                                            <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{file.size} • {file.time}</p>
                                        </div>
                                        <button style={{ color: "#818cf8", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Download</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ModalOverlay>

            <ModalOverlay isOpen={modalView === "comments"} onClose={() => setModalView(null)} title="Admin Task Discussion">
                <div style={{ display: "flex", flexDirection: "column", height: "500px" }}>
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.8rem", padding: "0.5rem 1rem 1.5rem 0.5rem" }}>
                        {!activeTask?.comments || activeTask.comments.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: 0.8 }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1.2rem" }}>💬</div>
                                <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "white" }}>Discussion Thread Empty</p>
                                <p style={{ fontSize: "0.9rem" }}>Start a conversation with your Admin regarding this task.</p>
                            </div>
                        ) : (
                            activeTask?.comments.map((c: Comment, idx: number) => {
                                const isMe = c.author === "You";
                                return (
                                    <div key={c.id || `msg-${idx}`} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "85%", position: "relative" }} className="msg-container">
                                        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "0.5rem", fontSize: "0.75rem", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "center" }}>
                                            <span style={{ color: isMe ? "#818cf8" : "#c084fc", fontWeight: 900, letterSpacing: "0.5px" }}>{c.author.toUpperCase()}</span>
                                            <span style={{ color: "#64748b" }}>{c.time}</span>
                                        </div>

                                        {editingMessage?.msgId === c.id ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", background: "rgba(99, 102, 241, 0.1)", padding: "1rem", borderRadius: "20px", border: "1px solid #6366f1" }}>
                                                <textarea
                                                    value={editingMessage?.text || ""}
                                                    onChange={(e) => setEditingMessage({ taskId: activeTask?._id || "", msgId: c.id, text: e.target.value })}
                                                    style={{ background: "transparent", border: "none", color: "white", width: "100%", outline: "none", resize: "none", fontSize: "1rem", lineHeight: "1.5" }}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                                                    <button onClick={() => setEditingMessage(null)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "0.5rem 1.2rem", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Cancel</button>
                                                    <button onClick={editMessage} style={{ background: "#6366f1", border: "none", color: "white", padding: "0.5rem 1.2rem", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)" }}>Save Changes</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: isMe ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "rgba(255,255,255,0.05)",
                                                padding: "1.2rem 1.6rem",
                                                borderRadius: isMe ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
                                                color: "white",
                                                fontSize: "1rem",
                                                lineHeight: "1.6",
                                                boxShadow: isMe ? "0 8px 25px rgba(99, 102, 241, 0.25)" : "none",
                                                position: "relative",
                                                minWidth: "140px",
                                                border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)"
                                            }}>
                                                <div>{c.text}</div>
                                                {isMe && (
                                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                                        <svg width="18" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 6L5 10L15 1" stroke={c.seen ? "#93c5fd" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M5 6L9 10L14 4" stroke={c.seen ? "#93c5fd" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "-8px" }} />
                                                        </svg>
                                                    </div>
                                                )}
                                                {isMe && (
                                                    <div className="msg-actions" style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "-85px",
                                                        transform: "translateY(-50%)",
                                                        display: "flex",
                                                        gap: "0.5rem",
                                                        opacity: 0,
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        pointerEvents: "auto"
                                                    }}>
                                                        <button
                                                            onClick={() => activeTask?._id && setEditingMessage({ taskId: activeTask._id, msgId: c.id, text: c.text })}
                                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#818cf8", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(129, 140, 248, 0.1)"; e.currentTarget.style.borderColor = "#818cf8"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                                            title="Edit Message"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                        <button
                                                            onClick={() => activeTask?._id && deleteMessage(activeTask._id, c.id)}
                                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#ef4444", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "#ef4444"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                                            title="Delete Message"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <form
                        onSubmit={(e) => { e.preventDefault(); if (activeTask?._id) sendComment(activeTask._id); }}
                        style={{ display: "flex", gap: "1rem", background: "rgba(255,255,255,0.03)", padding: "0.8rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", marginTop: "1rem" }}
                    >
                        <input
                            type="text" placeholder={isSendingComment ? "Sending..." : "Type your update or question here..."} value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSendingComment}
                            style={{ flex: 1, background: "transparent", border: "none", padding: "0.8rem 1.2rem", color: "white", outline: "none", fontSize: "1rem", opacity: isSendingComment ? 0.7 : 1 }}
                        />
                        <button
                            type="submit"
                            disabled={isSendingComment || !newComment.trim()}
                            style={{
                                background: isSendingComment || !newComment.trim() ? "rgba(168, 85, 247, 0.4)" : "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
                                color: "white",
                                border: "none",
                                width: "52px",
                                height: "52px",
                                borderRadius: "16px",
                                cursor: isSendingComment ? "not-allowed" : "pointer",
                                fontSize: "1.4rem",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: isSendingComment || !newComment.trim() ? "none" : "0 4px 15px rgba(168, 85, 247, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                if (!isSendingComment && newComment.trim()) {
                                    e.currentTarget.style.transform = "scale(1.08) rotate(5deg)";
                                    e.currentTarget.style.boxShadow = "0 0 25px rgba(168, 85, 247, 0.5)";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isSendingComment && newComment.trim()) {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(168, 85, 247, 0.3)";
                                }
                            }}
                        >{isSendingComment ? "..." : "→"}</button>
                    </form>
                </div>
            </ModalOverlay>

            <StatusModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />
        </div>
    );
}

export default function EmployeeTasksPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "white" }}>
                Loading Workspace...
            </div>
        }>
            <EmployeeTasksPageContent />
        </Suspense>
    );
}

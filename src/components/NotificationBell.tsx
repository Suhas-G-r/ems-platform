"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Trash2, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    type: string;
    message: string;
    readStatus: boolean;
    createdAt: string;
    senderId?: {
        name: string;
        lastName: string;
        avatar: string;
    };
    relatedEntityId?: string;
    relatedEntityType?: string;
}

export default function NotificationBell() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark as read
    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/mark-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notificationId })
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, readStatus: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/mark-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ markAll: true })
            });

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update local state
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.readStatus) {
            markAsRead(notification._id);
        }

        let role = '';
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                role = user.role?.toLowerCase() || '';
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }

        if (!role) return;

        // Navigate to related entity
        if (notification.relatedEntityType === 'TASK' && notification.relatedEntityId) {
            router.push(`/${role}/tasks?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'MESSAGE' && notification.relatedEntityId) {
            // Messages are linked to Tasks
            router.push(`/${role}/tasks?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'LEAVE' && notification.relatedEntityId) {
            const leavePath = role === 'admin' ? '/admin/leaves' : '/employee/apply-leave';
            router.push(`${leavePath}?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'ATTENDANCE') {
            router.push(`/${role}/attendance`);
        }

        setIsOpen(false);
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const refreshNotifications = async () => {
        await fetchUnreadCount();
        if (isOpen) {
            fetchNotifications();
        }
    };

    useEffect(() => {
        const handleNotificationCreated = () => {
            refreshNotifications();
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'notification-event') {
                refreshNotifications();
            }
        };

        window.addEventListener('notification-created', handleNotificationCreated);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('notification-created', handleNotificationCreated);
            window.removeEventListener('storage', handleStorage);
        };
    }, [isOpen]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Get notification icon color based on type
    const getNotificationColor = (type: string) => {
        if (type.includes('APPROVED')) return '#22c55e';
        if (type.includes('REJECTED')) return '#ef4444';
        if (type.includes('ASSIGNED') || type.includes('REQUESTED')) return '#f59e0b';
        if (type.includes('COMPLETED')) return '#6366f1';
        return '#94a3b8';
    };

    // Format time ago
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={toggleDropdown}
                style={{
                    position: 'relative',
                    padding: '0.65rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: isOpen ? "white" : "rgba(255, 255, 255, 0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.color = "white";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)";
                    }
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
                        border: '2px solid #020617'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 1rem)',
                    right: '-5px',
                    width: '380px',
                    maxHeight: '500px',
                    background: 'rgba(15, 23, 42, 0.98)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: 'none',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '10px',
                                    color: '#818cf8',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                                <p style={{ fontWeight: 600 }}>Syncing notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <Bell size={30} style={{ color: 'rgba(255, 255, 255, 0.1)' }} />
                                </div>
                                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>All Caught Up!</h4>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No new notifications since your last check.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                                        cursor: 'pointer',
                                        background: notification.readStatus ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '1rem',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = notification.readStatus ? 'transparent' : 'rgba(99, 102, 241, 0.03)'}
                                >
                                    {!notification.readStatus && (
                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#6366f1' }} />
                                    )}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: `${getNotificationColor(notification.type)}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Bell size={18} color={getNotificationColor(notification.type)} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            color: notification.readStatus ? '#94a3b8' : 'white',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.5,
                                            fontWeight: notification.readStatus ? 400 : 600,
                                            marginBottom: '0.25rem'
                                        }}>
                                            {notification.message}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>{timeAgo(notification.createdAt)}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '0.25rem' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
                            <button
                                onClick={() => {
                                    let role = '';
                                    const userData = localStorage.getItem('user');
                                    if (userData) {
                                        try {
                                            const user = JSON.parse(userData);
                                            role = user.role?.toLowerCase() || '';
                                        } catch (e) {
                                            console.error('Error parsing user data', e);
                                        }
                                    }
                                    if (role) {
                                        router.push(`/${role}/notifications`);
                                    }
                                    setIsOpen(false);
                                }}
                                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                View all activity
                            </button>
                        </div>
                    )}
                </div>
            )}


            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}

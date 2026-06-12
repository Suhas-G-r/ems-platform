"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, Clock, Calendar, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    type: string;
    message: string;
    readStatus: boolean;
    createdAt: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications?limit=50', {
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

    useEffect(() => {
        fetchNotifications();
    }, []);

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

            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, readStatus: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

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

            setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.readStatus) {
            markAsRead(notification._id);
        }

        const userData = localStorage.getItem('user');
        let role = '';
        if (userData) {
            const user = JSON.parse(userData);
            role = user.role?.toLowerCase() || '';
        }

        if (!role) return;

        if (notification.relatedEntityType === 'TASK' && notification.relatedEntityId) {
            router.push(`/${role}/tasks?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'MESSAGE' && notification.relatedEntityId) {
            router.push(`/${role}/tasks?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'LEAVE' && notification.relatedEntityId) {
            const path = role === 'admin' ? '/admin/leaves' : '/employee/apply-leave';
            router.push(`${path}?highlight=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'ATTENDANCE') {
            router.push(`/${role}/attendance`);
        }
    };

    const getNotificationColor = (type: string) => {
        if (type.includes('APPROVED')) return '#22c55e';
        if (type.includes('REJECTED')) return '#ef4444';
        if (type.includes('ASSIGNED') || type.includes('REQUESTED')) return '#f59e0b';
        if (type.includes('COMPLETED')) return '#6366f1';
        return '#94a3b8';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
                        Your Notifications
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        Stay updated with your tasks, leaves, and team interactions
                    </p>
                </div>
                {notifications.some(n => !n.readStatus) && (
                    <button
                        onClick={markAllAsRead}
                        className="glass"
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            color: 'white',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#6366f1';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        }}
                    >
                        <CheckCheck size={20} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="glass" style={{
                background: 'rgba(17, 24, 39, 0.4)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '10rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '8rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Inbox size={80} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Inbox is empty</h2>
                        <p style={{ fontSize: '1.1rem' }}>You're all caught up! When you get a new alert, it will appear here.</p>
                    </div>
                ) : (
                    <div>
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    padding: '1.5rem 2.5rem',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    background: notification.readStatus ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.paddingLeft = '3rem';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = notification.readStatus ? 'transparent' : 'rgba(99, 102, 241, 0.03)';
                                    e.currentTarget.style.paddingLeft = '2.5rem';
                                }}
                            >
                                {/* Event Type Indicator */}
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '4px',
                                    background: getNotificationColor(notification.type),
                                    boxShadow: `0 0 10px ${getNotificationColor(notification.type)}44`,
                                    flexShrink: 0
                                }} />

                                {/* Content Details */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: notification.readStatus ? 600 : 800,
                                            color: 'white',
                                            margin: 0
                                        }}>
                                            {notification.message}
                                        </h4>
                                        {!notification.readStatus && (
                                            <span style={{
                                                background: '#6366f1',
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>New</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={14} /> {formatDate(notification.createdAt)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} /> {notification.relatedEntityType || 'System'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    {!notification.readStatus && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            style={{
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                color: '#22c55e',
                                                padding: '0.5rem',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Mark as read"
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'}
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            padding: '0.5rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Delete"
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .glass {
                    backdrop-filter: blur(20px);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-left: 4px solid #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

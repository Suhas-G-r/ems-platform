"use client";

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, FileText, Users, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    employees: any[];
    tasks: any[];
    leaves: any[];
    total: number;
}

export default function GlobalSearch() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        const timer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/search/global?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Outside click to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleResultClick = (type: string, id: string, name?: string) => {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const role = user?.role?.toLowerCase();

        if (!role) {
            router.push('/login');
            return;
        }

        const searchQuery = encodeURIComponent(name || query);

        if (type === 'task') {
            router.push(`/${role}/tasks?q=${searchQuery}&highlight=${id}`);
        } else if (type === 'leave') {
            const leavePath = role === 'admin' ? '/admin/leaves' : '/employee/apply-leave';
            router.push(`${leavePath}?q=${searchQuery}&highlight=${id}`);
        } else if (type === 'employee') {
            const employeePath = role === 'admin' ? '/admin/employees' : '/employee/dashboard';
            router.push(`${employeePath}?q=${searchQuery}&highlight=${id}`);
        }

        setIsOpen(false);
        setQuery('');
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Search Input Box */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <SearchIcon size={18} />
                </div>
                <input
                    ref={inputRef}
                    type="search"
                    name="search-query-ems"
                    autoComplete="off"
                    id="global-search-input"
                    placeholder="Search anything... (Ctrl + K)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 3.25rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        color: 'white',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                        setIsOpen(true);
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.3)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    }}

                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const userData = localStorage.getItem('user');
                            const user = userData ? JSON.parse(userData) : null;
                            const role = user?.role?.toLowerCase();

                            if (role) {
                                // Default to tasks search if no specific result selected
                                router.push(`/${role}/tasks?q=${encodeURIComponent(query)}`);
                                setIsOpen(false);
                            }
                        }
                    }}
                />
            </div>

            {/* Dropdown Results */}
            {isOpen && query.length >= 2 && (
                <div
                    ref={searchRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.75rem',
                        background: 'rgba(15, 23, 42, 0.98)',
                        backdropFilter: 'blur(32px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                        zIndex: 1000,
                        maxHeight: '450px',
                        overflowY: 'auto',
                        padding: '1rem'
                    }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Loader2 size={28} className="animate-spin" style={{ color: '#6366f1' }} />
                            <p style={{ fontWeight: 600 }}>Searching workspace...</p>
                        </div>
                    ) : results && (results.employees.length > 0 || results.tasks.length > 0 || results.leaves.length > 0) ? (
                        <>
                            {results.employees.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Employees</h4>
                                    {results.employees.map(emp => (
                                        <div
                                            key={emp._id}
                                            onClick={() => handleResultClick('employee', emp._id, emp.name)}
                                            style={{ padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Users size={18} color="#818cf8" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{emp.name} {emp.lastName}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.tasks.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Tasks</h4>
                                    {results.tasks.map(task => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleResultClick('task', task._id)}
                                            style={{ padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={18} color="#22c55e" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{task.title}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {task.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.leaves.length > 0 && (
                                <div>
                                    <h4 style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Leaves</h4>
                                    {results.leaves.map(leave => (
                                        <div
                                            key={leave._id}
                                            onClick={() => handleResultClick('leave', leave._id)}
                                            style={{ padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Calendar size={18} color="#f59e0b" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{leave.type}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {leave.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <p style={{ fontSize: '1rem' }}>No matches found for "{query}"</p>
                        </div>
                    )}

                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

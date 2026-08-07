import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAnalytics } from '../services/dashboardService';
import { 
    Users, Video, FileText, Code2, MessageSquare, Download, RefreshCw, 
    Search, Filter, TrendingUp, Award, Star, CheckCircle, ShieldAlert, BarChart3, Bell
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboardPage = () => {
    const [timeframe, setTimeframe] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getAdminAnalytics({ timeframe, search: searchTerm });
            if (res.success) {
                setAnalytics(res.data);
            }
        } catch (err) {
            console.error('Error fetching admin analytics:', err);
            setError(err.response?.data?.message || 'Failed to load analytics metrics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAnalytics();
    };

    // Helper to export CSV
    const exportCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper to print report / export PDF
    const handleExportPDF = () => {
        window.print();
    };

    if (loading && !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-primary-theme" size={36} />
                    <p className="text-text-secondary font-medium text-sm">Loading Admin Analytics Dashboard...</p>
                </div>
            </div>
        );
    }

    const { userStats, interviewStats, resumeStats, codingStats, feedbackStats, charts, tables } = analytics || {};

    return (
        <div className="min-h-screen bg-background text-text-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Sub-navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border-theme pb-3">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-theme bg-primary-theme/10 border border-primary-theme/20 px-3 py-2 rounded-xl"
                    >
                        <BarChart3 size={16} /> Analytics Overview
                    </Link>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-primary-theme px-3 py-2 rounded-xl transition-colors"
                    >
                        <Users size={16} /> User Management
                    </Link>
                    <Link
                        to="/admin/interviews"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-primary-theme px-3 py-2 rounded-xl transition-colors"
                    >
                        <Video size={16} /> Interview Management
                    </Link>
                    <Link
                        to="/admin/feedback"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-primary-theme px-3 py-2 rounded-xl transition-colors"
                    >
                        <MessageSquare size={16} /> Feedback Center
                    </Link>
                </div>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl border border-border-theme shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-500">
                                Admin Analytics Dashboard
                            </h1>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> Real-time
                            </span>
                        </div>
                        <p className="text-text-secondary text-xs sm:text-sm mt-1">
                            System-wide performance, user growth, interview submissions, and feedback telemetry.
                        </p>
                    </div>

                    {/* Filter & Export Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-accent-theme p-1 rounded-xl border border-border-theme">
                            {[
                                { label: 'Today', value: 'today' },
                                { label: '7 Days', value: '7days' },
                                { label: '30 Days', value: '30days' },
                                { label: 'All Time', value: 'all' }
                            ].map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setTimeframe(t.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        timeframe === t.value
                                        ? 'bg-primary-theme text-white shadow-md'
                                        : 'text-text-secondary hover:text-text-main'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={fetchAnalytics}
                            className="p-2 bg-accent-theme hover:bg-border-theme text-text-main rounded-xl border border-border-theme transition-colors"
                            title="Refresh Analytics"
                        >
                            <RefreshCw size={16} />
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 bg-accent-theme hover:bg-border-theme text-text-main border border-border-theme text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all"
                        >
                            <Download size={14} /> Print / Export PDF
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
                        <ShieldAlert size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-card border border-border-theme rounded-xl text-text-main placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary-theme"
                        />
                    </div>
                    <button type="submit" className="bg-primary-theme hover:bg-primary-theme-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        Search
                    </button>
                </form>

                {/* 5 KPI STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* User Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-secondary">Total Users</span>
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <Users size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{userStats?.totalUsers || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-border-theme text-[11px] text-text-secondary space-y-0.5">
                            <div>Active (30d): <strong className="text-text-main">{userStats?.activeUsers || 0}</strong></div>
                            <div>Today: <strong className="text-emerald-600 dark:text-emerald-400">+{userStats?.newUsersToday || 0}</strong></div>
                        </div>
                    </div>

                    {/* Interview Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-secondary">Interviews</span>
                            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Video size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{interviewStats?.totalInterviews || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-border-theme text-[11px] text-text-secondary space-y-0.5">
                            <div>Completion Rate: <strong className="text-blue-600 dark:text-blue-400">{interviewStats?.completionRate || 0}%</strong></div>
                            <div>Avg Score: <strong className="text-text-main">{interviewStats?.avgInterviewScore || 0}/10</strong></div>
                        </div>
                    </div>

                    {/* Resume Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-secondary">Resumes Uploaded</span>
                            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                                <FileText size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{resumeStats?.totalResumeUploads || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-border-theme text-[11px] text-text-secondary truncate">
                            Top Role: <strong className="text-text-main truncate">{resumeStats?.mostSelectedRole}</strong>
                        </div>
                    </div>

                    {/* Coding Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-secondary">Coding Activity</span>
                            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Code2 size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{codingStats?.codingInterviews || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-border-theme text-[11px] text-text-secondary space-y-0.5">
                            <div>Avg Code Rating: <strong className="text-amber-600 dark:text-amber-400">{codingStats?.avgCodingScore}/10</strong></div>
                        </div>
                    </div>

                    {/* Feedback Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-secondary">Feedback Rating</span>
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <MessageSquare size={20} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <h3 className="text-2xl font-black">{feedbackStats?.avgRating || '5.0'}</h3>
                            <span className="text-xs text-amber-500 font-bold flex items-center"><Star size={12} className="fill-amber-400 text-amber-400" /> /5</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-border-theme text-[11px] text-text-secondary truncate">
                            Top Feature: <strong className="text-text-main">{feedbackStats?.mostLovedFeature}</strong>
                        </div>
                    </div>
                </div>

                {/* 4 CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* User Growth Chart */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary-theme" /> User Growth Trend
                            </h2>
                            <span className="text-xs text-text-secondary font-medium">New registrations</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts?.userGrowth || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Interviews Per Day Chart */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Video size={18} className="text-blue-600" /> Interviews Per Day
                            </h2>
                            <span className="text-xs text-text-secondary font-medium">Daily sessions</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.interviewsPerDay || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px' }} />
                                    <Bar dataKey="interviews" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Feedback Ratings Chart */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Star size={18} className="text-amber-500" /> Candidate Feedback Rating Breakdown
                            </h2>
                            <span className="text-xs text-text-secondary font-medium">Distribution</span>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts?.feedbackRatings || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {(charts?.feedbackRatings || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Resume Upload Trend Chart */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <FileText size={18} className="text-purple-600" /> Resume Upload Trend
                            </h2>
                            <span className="text-xs text-text-secondary font-medium">Upload volume</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts?.resumeUploadTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="uploads" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* DATA TABLES SECTION */}
                <div className="space-y-8 pt-4">
                    
                    {/* Table 1: Latest Registered Users */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-text-main">Latest Registered Users</h3>
                                <p className="text-xs text-text-secondary">Recent candidates registered on the platform.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.users, 'registered_users')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-theme hover:bg-primary-theme/20 bg-primary-theme/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-theme text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Joined Date</th>
                                        <th className="py-3 px-4">Interview Count</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
                                    {tables?.users && tables.users.length > 0 ? (
                                        tables.users.map(u => (
                                            <tr key={u._id} className="hover:bg-accent-theme/40 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-text-main">{u.name}</td>
                                                <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                                                <td className="py-3 px-4 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{u.interviewCount}</td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {u.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-text-secondary/60 text-xs">No registered user records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 2: Latest Interviews */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-text-main">Latest Interviews</h3>
                                <p className="text-xs text-text-secondary">Recent mock interview sessions executed.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.interviews, 'latest_interviews')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-theme hover:bg-primary-theme/20 bg-primary-theme/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-theme text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        <th className="py-3 px-4">Candidate</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Difficulty</th>
                                        <th className="py-3 px-4">Score</th>
                                        <th className="py-3 px-4">Completed</th>
                                        <th className="py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
                                    {tables?.interviews && tables.interviews.length > 0 ? (
                                        tables.interviews.map(i => (
                                            <tr key={i._id} className="hover:bg-accent-theme/40 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-text-main">{i.candidate}</td>
                                                <td className="py-3 px-4 text-text-secondary">{i.role}</td>
                                                <td className="py-3 px-4 text-xs font-medium text-text-secondary">{i.difficulty}</td>
                                                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{i.score}/10</td>
                                                <td className="py-3 px-4">
                                                    {i.completed ? (
                                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">Completed</span>
                                                    ) : (
                                                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">In Progress</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">{new Date(i.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-text-secondary/60 text-xs">No interview records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 3: Latest Feedback */}
                    <div className="glass p-6 rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-text-main">Latest Feedback Submissions</h3>
                                <p className="text-xs text-text-secondary">Candidate feedback, ratings, and feature reviews.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.feedback, 'candidate_feedback')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-theme hover:bg-primary-theme/20 bg-primary-theme/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-theme text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        <th className="py-3 px-4">Rating</th>
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Favorite Feature</th>
                                        <th className="py-3 px-4">Suggestion</th>
                                        <th className="py-3 px-4">Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
                                    {tables?.feedback && tables.feedback.length > 0 ? (
                                        tables.feedback.map(f => (
                                            <tr key={f._id} className="hover:bg-accent-theme/40 transition-colors">
                                                <td className="py-3 px-4 font-bold text-amber-500 flex items-center gap-1">
                                                    {f.rating} <Star size={14} className="fill-amber-400 text-amber-400" />
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">{f.user}</td>
                                                <td className="py-3 px-4 font-medium text-text-main">{f.favoriteFeature}</td>
                                                <td className="py-3 px-4 text-text-secondary italic max-w-xs truncate">{f.suggestion}</td>
                                                <td className="py-3 px-4 text-text-secondary">{new Date(f.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-text-secondary/60 text-xs">No candidate feedback records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminDashboardPage;

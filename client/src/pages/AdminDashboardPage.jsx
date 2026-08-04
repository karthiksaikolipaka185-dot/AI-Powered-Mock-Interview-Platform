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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-primary-600" size={36} />
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Loading Admin Analytics Dashboard...</p>
                </div>
            </div>
        );
    }

    const { userStats, interviewStats, resumeStats, codingStats, feedbackStats, charts, tables } = analytics || {};

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Sub-navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/50 border border-primary-500/20 px-3 py-2 rounded-xl"
                    >
                        <BarChart3 size={16} /> Analytics Overview
                    </Link>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
                    >
                        <Users size={16} /> User Management
                    </Link>
                    <Link
                        to="/admin/interviews"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
                    >
                        <Video size={16} /> Interview Management
                    </Link>
                    <Link
                        to="/admin/feedback"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
                    >
                        <MessageSquare size={16} /> Feedback Center
                    </Link>
                </div>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-500">
                                Admin Analytics Dashboard
                            </h1>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> Real-time
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            System-wide performance, user growth, interview submissions, and feedback telemetry.
                        </p>
                    </div>

                    {/* Filter & Export Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
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
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={fetchAnalytics}
                            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                            title="Refresh Analytics"
                        >
                            <RefreshCw size={16} />
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all"
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        Search
                    </button>
                </form>

                {/* 5 KPI STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* User Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Users</span>
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <Users size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{userStats?.totalUsers || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Active (30d): <strong className="text-slate-800 dark:text-slate-200">{userStats?.activeUsers || 0}</strong></div>
                            <div>Today: <strong className="text-emerald-600 dark:text-emerald-400">+{userStats?.newUsersToday || 0}</strong></div>
                        </div>
                    </div>

                    {/* Interview Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Interviews</span>
                            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Video size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{interviewStats?.totalInterviews || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Completion Rate: <strong className="text-blue-600 dark:text-blue-400">{interviewStats?.completionRate || 0}%</strong></div>
                            <div>Avg Score: <strong className="text-slate-800 dark:text-slate-200">{interviewStats?.avgInterviewScore || 0}/10</strong></div>
                        </div>
                    </div>

                    {/* Resume Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resumes Uploaded</span>
                            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                                <FileText size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{resumeStats?.totalResumeUploads || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Top Role: <strong className="text-slate-800 dark:text-slate-200 truncate">{resumeStats?.mostSelectedRole}</strong>
                        </div>
                    </div>

                    {/* Coding Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Coding Activity</span>
                            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Code2 size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mt-2">{codingStats?.codingInterviews || 0}</h3>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Avg Code Rating: <strong className="text-amber-600 dark:text-amber-400">{codingStats?.avgCodingScore}/10</strong></div>
                        </div>
                    </div>

                    {/* Feedback Stats Card */}
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Feedback Rating</span>
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <MessageSquare size={20} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <h3 className="text-2xl font-black">{feedbackStats?.avgRating || '5.0'}</h3>
                            <span className="text-xs text-amber-500 font-bold flex items-center"><Star size={12} className="fill-amber-400 text-amber-400" /> /5</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Top Feature: <strong className="text-slate-800 dark:text-slate-200">{feedbackStats?.mostLovedFeature}</strong>
                        </div>
                    </div>
                </div>

                {/* 4 CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* User Growth Chart */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary-600" /> User Growth Trend
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">New registrations</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts?.userGrowth || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Interviews Per Day Chart */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Video size={18} className="text-blue-600" /> Interviews Per Day
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">Daily sessions</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.interviewsPerDay || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Bar dataKey="interviews" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Feedback Ratings Chart */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Star size={18} className="text-amber-500" /> Candidate Feedback Rating Breakdown
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">Distribution</span>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts?.feedbackRatings || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {(charts?.feedbackRatings || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Resume Upload Trend Chart */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <FileText size={18} className="text-purple-600" /> Resume Upload Trend
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">Upload volume</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts?.resumeUploadTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="uploads" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* DATA TABLES SECTION */}
                <div className="space-y-8 pt-4">
                    
                    {/* Table 1: Latest Registered Users */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Latest Registered Users</h3>
                                <p className="text-xs text-slate-500">Recent candidates registered on the platform.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.users, 'registered_users')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Joined Date</th>
                                        <th className="py-3 px-4">Interview Count</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                                    {tables?.users && tables.users.length > 0 ? (
                                        tables.users.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{u.name}</td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                                <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
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
                                            <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">No registered user records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 2: Latest Interviews */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Latest Interviews</h3>
                                <p className="text-xs text-slate-500">Recent mock interview sessions executed.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.interviews, 'latest_interviews')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4">Candidate</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Difficulty</th>
                                        <th className="py-3 px-4">Score</th>
                                        <th className="py-3 px-4">Completed</th>
                                        <th className="py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                                    {tables?.interviews && tables.interviews.length > 0 ? (
                                        tables.interviews.map(i => (
                                            <tr key={i._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{i.candidate}</td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{i.role}</td>
                                                <td className="py-3 px-4 text-xs font-medium text-slate-500">{i.difficulty}</td>
                                                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{i.score}/10</td>
                                                <td className="py-3 px-4">
                                                    {i.completed ? (
                                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">Completed</span>
                                                    ) : (
                                                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">In Progress</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">{new Date(i.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">No interview records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 3: Latest Feedback */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Latest Feedback Submissions</h3>
                                <p className="text-xs text-slate-500">Candidate feedback, ratings, and feature reviews.</p>
                            </div>
                            <button
                                onClick={() => exportCSV(tables?.feedback, 'candidate_feedback')}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4">Rating</th>
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Favorite Feature</th>
                                        <th className="py-3 px-4">Suggestion</th>
                                        <th className="py-3 px-4">Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                                    {tables?.feedback && tables.feedback.length > 0 ? (
                                        tables.feedback.map(f => (
                                            <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="py-3 px-4 font-bold text-amber-500 flex items-center gap-1">
                                                    {f.rating} <Star size={14} className="fill-amber-400 text-amber-400" />
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{f.user}</td>
                                                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{f.favoriteFeature}</td>
                                                <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">{f.suggestion}</td>
                                                <td className="py-3 px-4 text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">No candidate feedback records found.</td>
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

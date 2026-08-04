import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeedbackList } from '../services/feedbackManagementService';
import FeedbackDetailDrawer from '../components/FeedbackDetailDrawer';
import { 
    MessageSquare, Star, TrendingUp, CheckCircle, Clock, Search, 
    Filter, Download, ChevronLeft, ChevronRight, RefreshCw, BarChart3, 
    Users, Video, Bell, Sparkles, AlertCircle, ShieldAlert 
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminFeedbackPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackData, setFeedbackData] = useState(null);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);

    const fetchFeedbackData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getFeedbackList({
                page,
                limit,
                search: searchTerm,
                rating: ratingFilter,
                reviewStatus: statusFilter,
                sortBy
            });
            if (res.success) {
                setFeedbackData(res.data);
            }
        } catch (err) {
            console.error('Error fetching admin feedback:', err);
            setError(err.response?.data?.message || 'Failed to load feedback records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbackData();
    }, [page, limit, ratingFilter, statusFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchFeedbackData();
    };

    const exportCSV = () => {
        if (!feedbackData?.feedbackList || feedbackData.feedbackList.length === 0) return;
        const exportData = feedbackData.feedbackList.map(f => ({
            ID: f.id,
            CandidateName: f.userName,
            CandidateEmail: f.userEmail,
            Rating: f.rating,
            FavoriteFeature: f.favoriteFeature,
            Suggestion: f.suggestion,
            Sentiment: f.sentiment,
            ReviewStatus: f.reviewStatus,
            SubmittedAt: new Date(f.createdAt).toLocaleString()
        }));

        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => 
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feedback_center_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const { feedbackList = [], pagination = {}, kpis = {}, charts = {} } = feedbackData || {};

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Sub-navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
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
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/50 border border-primary-500/20 px-3 py-2 rounded-xl relative"
                    >
                        <MessageSquare size={16} /> Feedback Center
                        {kpis?.pendingReviews > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow-sm">
                                <Bell size={10} /> {kpis.pendingReviews} New
                            </span>
                        )}
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-500">
                                Admin Feedback Center
                            </h1>
                            {kpis?.pendingReviews > 0 && (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Bell size={12} /> 🔔 {kpis.pendingReviews} New Feedback Pending
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Review candidate feedback, AI sentiment telemetry, feature ratings, and improvement suggestions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchFeedbackData}
                            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                            title="Refresh Feedback"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                        >
                            Print PDF
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
                        <ShieldAlert size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* 4 KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Average Rating</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <h3 className="text-2xl font-black">{kpis?.averageRating || '5.0'}</h3>
                                <span className="text-xs text-amber-500 font-bold flex items-center"><Star size={12} className="fill-amber-400 text-amber-400" /> /5</span>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Star size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Feedback</span>
                            <h3 className="text-2xl font-black mt-1">{kpis?.totalFeedback || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <MessageSquare size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Positive Reviews</span>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.positivePercentage || 100}%</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Sparkles size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Pending Reviews</span>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis?.pendingReviews || 0}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Bell size={24} />
                        </div>
                    </div>
                </div>

                {/* 3 RECHARTS CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart: Rating Distribution */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Star size={16} className="text-amber-500" /> Rating Distribution
                            </h2>
                            <span className="text-[11px] text-slate-500 font-medium">Breakdown</span>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts?.ratingDistribution || []} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {(charts?.ratingDistribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Line Chart: Feedback Over Time */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-600" /> Feedback Over Time
                            </h2>
                            <span className="text-[11px] text-slate-500 font-medium">Submissions</span>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts?.feedbackOverTime || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="feedback" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart: Favorite Features */}
                    <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-600" /> Favorite Platform Features
                            </h2>
                            <span className="text-[11px] text-slate-500 font-medium">Top Voted</span>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.favoriteFeatures || []} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or suggestion text..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Filter size={14} /> Rating:
                        </div>
                        <select
                            value={ratingFilter}
                            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            Review:
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest_rating">Highest Rating</option>
                            <option value="lowest_rating">Lowest Rating</option>
                        </select>

                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>

                {/* FEEDBACK DATA TABLE */}
                <div className="glass rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Showing {feedbackList.length} of {pagination.totalFeedback || 0} feedback submissions
                        </span>
                        <span className="text-[11px] text-slate-400 italic">Click any feedback row to inspect full AI sentiment & suggestion</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="py-3 px-4">Rating</th>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Favorite Feature</th>
                                    <th className="py-3 px-4">Suggestion Preview</th>
                                    <th className="py-3 px-4">Submitted Date</th>
                                    <th className="py-3 px-4">Review Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="animate-spin text-amber-600" size={24} />
                                                <span className="text-xs text-slate-500">Loading candidate feedback...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : feedbackList && feedbackList.length > 0 ? (
                                    feedbackList.map(f => (
                                        <tr
                                            key={f.id}
                                            onClick={() => setSelectedFeedbackId(f.id)}
                                            className="hover:bg-amber-500/5 dark:hover:bg-amber-500/10 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3.5 px-4 font-bold text-amber-500 flex items-center gap-1">
                                                {f.rating} <Star size={14} className="fill-amber-400 text-amber-400" />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{f.userName}</span>
                                                <span className="text-[11px] text-slate-400 font-normal">{f.userEmail}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                                                {f.favoriteFeature}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate italic">
                                                "{f.suggestionPreview}"
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 text-xs">
                                                {new Date(f.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {f.reviewStatus === 'Reviewed' ? (
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                                                        <CheckCircle size={12} /> Reviewed
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                            No candidate feedback entries match the selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Page <strong className="text-slate-900 dark:text-slate-100">{pagination.currentPage}</strong> of <strong className="text-slate-900 dark:text-slate-100">{pagination.totalPages}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Slide-over Feedback Detail Drawer */}
            {selectedFeedbackId && (
                <FeedbackDetailDrawer
                    feedbackId={selectedFeedbackId}
                    onClose={() => setSelectedFeedbackId(null)}
                    onStatusUpdated={fetchFeedbackData}
                />
            )}
        </div>
    );
};

export default AdminFeedbackPage;

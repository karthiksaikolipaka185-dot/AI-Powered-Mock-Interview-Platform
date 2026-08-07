import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInterviews } from '../services/interviewManagementService';
import InterviewDetailModal from '../components/InterviewDetailModal';
import { 
    Video, CheckCircle, Clock, Award, Search, Filter, 
    Download, ChevronLeft, ChevronRight, RefreshCw, BarChart3, 
    Users, Code2, ShieldAlert 
} from 'lucide-react';

const AdminInterviewsPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [interviewData, setInterviewData] = useState(null);
    const [selectedInterviewId, setSelectedInterviewId] = useState(null);

    const fetchInterviewsList = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getInterviews({
                page,
                limit,
                search: searchTerm,
                status: statusFilter,
                sortBy
            });
            if (res.success) {
                setInterviewData(res.data);
            }
        } catch (err) {
            console.error('Error fetching admin interviews:', err);
            setError(err.response?.data?.message || 'Failed to load interview records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviewsList();
    }, [page, limit, statusFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInterviewsList();
    };

    const exportCSV = () => {
        if (!interviewData?.interviews || interviewData.interviews.length === 0) return;
        const exportData = interviewData.interviews.map(i => ({
            ID: i.id,
            CandidateName: i.candidateName,
            CandidateEmail: i.candidateEmail,
            Role: i.role,
            Difficulty: i.difficulty,
            DurationMinutes: i.durationMinutes,
            OverallScore: i.overallScore,
            Status: i.status,
            StartedAt: new Date(i.startedAt).toLocaleString()
        }));

        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => 
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `interview_management_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const { interviews = [], pagination = {}, kpis = {} } = interviewData || {};

    return (
        <div className="min-h-screen bg-background text-text-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border-theme pb-3">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-primary-theme px-3 py-2 rounded-xl transition-colors"
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
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-theme bg-primary-theme/10 border border-primary-theme/20 px-3 py-2 rounded-xl"
                    >
                        <Video size={16} /> Interview Management
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl border border-border-theme shadow-sm">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-500">
                            Admin Interview Management
                        </h1>
                        <p className="text-text-secondary text-xs sm:text-sm mt-1">
                            Inspect candidate sessions, question timelines, code submissions, AI complexity evaluations, and scores.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchInterviewsList}
                            className="p-2 bg-accent-theme hover:bg-border-theme text-text-main rounded-xl border border-border-theme transition-colors"
                            title="Refresh Sessions"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1.5 bg-primary-theme hover:bg-primary-theme-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 bg-accent-theme hover:bg-border-theme text-text-main border border-border-theme text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
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
                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-text-secondary block">Total Interviews</span>
                            <h3 className="text-2xl font-black mt-1">{kpis?.totalInterviews || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Video size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-text-secondary block">Completed Sessions</span>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.completed || 0}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <CheckCircle size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-text-secondary block">In Progress</span>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis?.inProgress || 0}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-text-secondary block">Average Overall Score</span>
                            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{kpis?.averageScore || 8.5}/10</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <Award size={24} />
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-border-theme">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="Search candidate, email, or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-card border border-border-theme rounded-xl text-text-main placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary-theme"
                            />
                        </div>
                        <button type="submit" className="bg-primary-theme hover:bg-primary-theme-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                            <Filter size={14} /> Status:
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-card border border-border-theme text-text-main text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-theme"
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                        </select>

                        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                            Sort:
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="bg-card border border-border-theme text-text-main text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-theme"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest_score">Highest Score</option>
                            <option value="lowest_score">Lowest Score</option>
                            <option value="longest_duration">Longest Duration</option>
                        </select>

                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="bg-card border border-border-theme text-text-main text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-theme"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>

                {/* INTERVIEWS DATA TABLE */}
                <div className="glass rounded-2xl border border-border-theme shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border-theme flex items-center justify-between">
                        <span className="text-xs font-bold text-text-secondary">
                            Showing {interviews.length} of {pagination.totalInterviews || 0} interview sessions
                        </span>
                        <span className="text-[11px] text-text-secondary italic">Click any session row to inspect complete timeline & code</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-theme text-xs font-bold text-text-secondary uppercase tracking-wider bg-accent-theme/40">
                                    <th className="py-3 px-4">Candidate</th>
                                    <th className="py-3 px-4">Target Role</th>
                                    <th className="py-3 px-4">Difficulty</th>
                                    <th className="py-3 px-4">Duration</th>
                                    <th className="py-3 px-4">Code Submissions</th>
                                    <th className="py-3 px-4">Overall Score</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Started Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="animate-spin text-primary-theme" size={24} />
                                                <span className="text-xs text-text-secondary">Loading interview records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : interviews && interviews.length > 0 ? (
                                    interviews.map(i => (
                                        <tr
                                            key={i.id}
                                            onClick={() => setSelectedInterviewId(i.id)}
                                            className="hover:bg-primary-theme/5 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3.5 px-4 font-semibold text-text-main">
                                                <div>
                                                    <span className="block font-bold">{i.candidateName}</span>
                                                    <span className="text-[11px] text-text-secondary font-normal">{i.candidateEmail}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-text-main capitalize">
                                                {i.role}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-text-secondary font-medium">
                                                {i.difficulty}
                                            </td>
                                            <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                                {i.durationMinutes} mins
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {i.hasCodeSubmissions ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                                                        <Code2 size={14} /> Code Submitted
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary/50 text-xs italic">Voice / Text</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                                                {i.overallScore > 0 ? `${i.overallScore}/10` : 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                    i.status === 'Completed'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-text-secondary text-xs">
                                                {new Date(i.startedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-text-secondary/60 text-xs">
                                            No interview records match the selected search or filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-border-theme flex items-center justify-between text-xs">
                            <span className="text-text-secondary">
                                Page <strong className="text-text-main">{pagination.currentPage}</strong> of <strong className="text-text-main">{pagination.totalPages}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-xl border border-border-theme text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-theme transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2 rounded-xl border border-border-theme text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-theme transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Detailed Inspection Modal */}
            {selectedInterviewId && (
                <InterviewDetailModal
                    interviewId={selectedInterviewId}
                    onClose={() => setSelectedInterviewId(null)}
                />
            )}
        </div>
    );
};

export default AdminInterviewsPage;

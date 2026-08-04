import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/userManagementService';
import UserDetailDrawer from '../components/UserDetailDrawer';
import { 
    Users, UserCheck, UserX, UserPlus, Search, Filter, 
    Download, ChevronLeft, ChevronRight, RefreshCw, BarChart3, 
    Video, FileText, CheckCircle, AlertCircle, ShieldAlert
} from 'lucide-react';

const AdminUsersPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getUsers({
                page,
                limit,
                search: searchTerm,
                filterStatus
            });
            if (res.success) {
                setUserData(res.data);
            }
        } catch (err) {
            console.error('Error fetching admin users:', err);
            setError(err.response?.data?.message || 'Failed to load user management records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit, filterStatus]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const exportCSV = () => {
        if (!userData?.users || userData.users.length === 0) return;
        const exportData = userData.users.map(u => ({
            ID: u.id,
            Name: u.name,
            Email: u.email,
            JoinedDate: new Date(u.joinedAt).toLocaleDateString(),
            LastLogin: new Date(u.lastLogin).toLocaleDateString(),
            ResumeUploaded: u.resumeUploaded ? 'Yes' : 'No',
            InterviewCount: u.interviewCount,
            CompletedInterviews: u.completedInterviews,
            AverageScore: u.averageScore,
            Status: u.status
        }));

        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => 
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `user_management_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = (status) => {
        if (status === 'Active') {
            return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Active</span>;
        }
        if (status === 'Inactive') {
            return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Inactive</span>;
        }
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Never Started</span>;
    };

    const { users = [], pagination = {}, kpis = {} } = userData || {};

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
                    >
                        <BarChart3 size={16} /> Analytics Overview
                    </Link>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/50 border border-primary-500/20 px-3 py-2 rounded-xl"
                    >
                        <Users size={16} /> User Management
                    </Link>
                    <Link
                        to="/admin/interviews"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary-600 px-3 py-2 rounded-xl transition-colors"
                    >
                        <Video size={16} /> Interview Management
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-500">
                            Admin User Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Inspect candidate profiles, activity status, interview history, and performance telemetry.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                            title="Refresh Users"
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
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Registered</span>
                            <h3 className="text-2xl font-black mt-1">{kpis?.totalUsers || 0}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Active Candidates</span>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.activeUsers || 0}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Inactive Users</span>
                            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{kpis?.inactiveUsers || 0}</h3>
                        </div>
                        <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                            <UserX size={24} />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">New This Week</span>
                            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">+{kpis?.newUsersThisWeek || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <UserPlus size={24} />
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
                                placeholder="Search by name or email address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Filter size={14} /> Filter Status:
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="never_started">Never Started Interview</option>
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

                {/* USER DATA TABLE */}
                <div className="glass rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Showing {users.length} of {pagination.totalUsers || 0} candidate accounts
                        </span>
                        <span className="text-[11px] text-slate-400 italic">Click any user row to view full drawer telemetry</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="py-3 px-4">Candidate</th>
                                    <th className="py-3 px-4">Joined Date</th>
                                    <th className="py-3 px-4">Last Login</th>
                                    <th className="py-3 px-4">Resume</th>
                                    <th className="py-3 px-4">Interviews</th>
                                    <th className="py-3 px-4">Avg Score</th>
                                    <th className="py-3 px-4">Account Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="animate-spin text-primary-600" size={24} />
                                                <span className="text-xs text-slate-500">Loading user accounts...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users && users.length > 0 ? (
                                    users.map(u => (
                                        <tr
                                            key={u.id}
                                            onClick={() => setSelectedUserId(u.id)}
                                            className="hover:bg-primary-500/5 dark:hover:bg-primary-500/10 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center overflow-hidden">
                                                        {u.profileImage ? (
                                                            <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.name.substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{u.name}</span>
                                                        <span className="text-[11px] text-slate-400">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                                                {new Date(u.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 text-xs">
                                                {new Date(u.lastLogin).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {u.resumeUploaded ? (
                                                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-xs flex items-center gap-1">
                                                        <FileText size={14} /> Uploaded
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Missing</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{u.interviewCount}</span>
                                                <span className="text-[10px] text-slate-400 ml-1">({u.completedInterviews} completed)</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                                                {u.averageScore > 0 ? `${u.averageScore}/10` : 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(u.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                            No user accounts match the selected search or filter criteria.
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

            {/* Slide-over User Profile Drawer */}
            {selectedUserId && (
                <UserDetailDrawer
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default AdminUsersPage;

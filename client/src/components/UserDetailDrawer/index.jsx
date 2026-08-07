import React, { useState, useEffect } from 'react';
import { getUserById } from '../../services/userManagementService';
import { 
    X, User, Mail, Calendar, Clock, FileText, Video, Code2, 
    MessageSquare, Star, Award, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';

const UserDetailDrawer = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (!userId) return;
        const fetchDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getUserById(userId);
                if (res.success) {
                    setUserProfile(res.data);
                }
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError(err.response?.data?.message || 'Failed to load user profile details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [userId]);

    if (!userId) return null;

    const { basicInfo, resumeInfo, interviewStats, recentInterviews, feedbackHistory } = userProfile || {};

    const getStatusBadge = (status) => {
        if (status === 'Active') {
            return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Active</span>;
        }
        if (status === 'Inactive') {
            return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Inactive</span>;
        }
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">Never Started Interview</span>;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-background border-l border-border-theme shadow-2xl flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-border-theme flex items-center justify-between glass sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-theme/10 text-primary-theme flex items-center justify-center font-bold">
                                <User size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-text-main">Candidate Telemetry Profile</h2>
                                <p className="text-xs text-text-secondary">Detailed user activity & AI evaluation metrics.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-xl text-text-secondary hover:text-text-main hover:bg-accent-theme transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scroll */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="animate-spin text-primary-theme" size={32} />
                                <p className="text-xs text-text-secondary font-medium">Fetching candidate profile telemetry...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2 text-xs">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        ) : (
                            <>
                                {/* Profile Card */}
                                <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-accent-theme border-2 border-primary-theme/30 flex items-center justify-center text-primary-theme overflow-hidden shadow-md">
                                        {basicInfo?.profileImage ? (
                                            <img src={basicInfo.profileImage} alt={basicInfo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left space-y-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <h3 className="text-lg font-bold text-text-main">{basicInfo?.name}</h3>
                                            <div>{getStatusBadge(basicInfo?.status)}</div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1"><Mail size={14} /> {basicInfo?.email}</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(basicInfo?.joinedAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> Last login: {new Date(basicInfo?.lastLogin).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Resume Card */}
                                <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                            <FileText size={16} className="text-purple-600" /> Resume Information
                                        </h4>
                                        {resumeInfo?.uploaded ? (
                                            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle size={12} /> Uploaded
                                            </span>
                                        ) : (
                                            <span className="bg-accent-theme text-text-secondary text-[11px] font-bold px-2 py-0.5 rounded-full border border-border-theme">Not Uploaded</span>
                                        )}
                                    </div>

                                    <p className="text-sm font-semibold text-text-main">{resumeInfo?.fileName}</p>
                                    {resumeInfo?.textSnippet && (
                                        <div className="p-3 bg-accent-theme border border-border-theme rounded-xl text-xs text-text-secondary italic">
                                            "{resumeInfo.textSnippet}"
                                        </div>
                                    )}
                                </div>

                                {/* Performance KPI Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Total Sessions</span>
                                        <span className="text-xl font-black text-text-main">{interviewStats?.totalInterviews || 0}</span>
                                    </div>
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Completed</span>
                                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{interviewStats?.completedInterviews || 0}</span>
                                    </div>
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Average Score</span>
                                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">{interviewStats?.averageScore || 0}/10</span>
                                    </div>
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Highest Score</span>
                                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{interviewStats?.highestScore || 0}/10</span>
                                    </div>
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Coding Rating</span>
                                        <span className="text-xl font-black text-amber-600 dark:text-amber-400">{interviewStats?.codingScore || 0}/10</span>
                                    </div>
                                    <div className="p-4 bg-accent-theme border border-border-theme rounded-xl text-center">
                                        <span className="text-[11px] font-medium text-text-secondary block">Communication</span>
                                        <span className="text-xl font-black text-purple-600 dark:text-purple-400">{interviewStats?.communicationScore || 0}/10</span>
                                    </div>
                                </div>

                                {/* Recent Interviews History */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                        <Video size={16} className="text-blue-600" /> Recent Interview History
                                    </h4>
                                    {recentInterviews && recentInterviews.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentInterviews.map(i => (
                                                <div key={i.id} className="p-3 bg-accent-theme border border-border-theme rounded-xl flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-bold text-text-main block">{i.role}</span>
                                                        <span className="text-[11px] text-text-secondary">{new Date(i.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">Score: {i.score}/10</span>
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${i.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                            {i.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-secondary italic">No interview sessions recorded for this user.</p>
                                    )}
                                </div>

                                {/* Feedback Submitted */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                        <MessageSquare size={16} className="text-emerald-600" /> Candidate Feedback Submitted
                                    </h4>
                                    {feedbackHistory && feedbackHistory.length > 0 ? (
                                        <div className="space-y-2">
                                            {feedbackHistory.map(f => (
                                                <div key={f.id} className="p-3 bg-accent-theme border border-border-theme rounded-xl space-y-1 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-amber-500 flex items-center gap-1">
                                                            {f.rating} <Star size={12} className="fill-amber-400 text-amber-400" /> Stars
                                                        </span>
                                                        <span className="text-[11px] text-text-secondary">{new Date(f.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-text-main font-medium">Favorite: {f.favoriteFeature}</p>
                                                    {f.suggestion && <p className="text-text-secondary italic">"{f.suggestion}"</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-secondary italic">No feedback submitted by this user yet.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 border-t border-border-theme glass flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-accent-theme hover:bg-border-theme text-text-main border border-border-theme text-xs font-bold rounded-xl transition-all"
                        >
                            Close Drawer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDetailDrawer;

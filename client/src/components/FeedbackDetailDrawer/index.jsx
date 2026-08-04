import React, { useState, useEffect } from 'react';
import { getFeedbackById, markAsReviewed } from '../../services/feedbackManagementService';
import { 
    X, User, Mail, Star, Heart, MessageSquare, CheckCircle, 
    Sparkles, RefreshCw, AlertCircle, Send, Monitor, Globe 
} from 'lucide-react';

const FeedbackDetailDrawer = ({ feedbackId, onClose, onStatusUpdated }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatusMsg, setReplyStatusMsg] = useState('');

    const fetchDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getFeedbackById(feedbackId);
            if (res.success) {
                setDetailData(res.data);
            }
        } catch (err) {
            console.error('Error fetching feedback detail:', err);
            setError(err.response?.data?.message || 'Failed to load feedback detail telemetry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (feedbackId) fetchDetail();
    }, [feedbackId]);

    const handleMarkAsReviewed = async () => {
        setUpdating(true);
        try {
            const res = await markAsReviewed(feedbackId);
            if (res.success) {
                setDetailData(prev => prev ? { ...prev, reviewStatus: 'Reviewed' } : null);
                if (onStatusUpdated) onStatusUpdated();
            }
        } catch (err) {
            console.error('Error marking as reviewed:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleSendReplyPlaceholder = (e) => {
        e.preventDefault();
        setReplyStatusMsg('Reply functionality is prepared for next release.');
        setTimeout(() => setReplyStatusMsg(''), 4000);
    };

    if (!feedbackId) return null;

    const getSentimentBadge = (sentiment) => {
        if (sentiment === 'Positive') {
            return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={12} /> Positive</span>;
        }
        if (sentiment === 'Negative') {
            return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={12} /> Negative</span>;
        }
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-0.5 rounded-full">Neutral</span>;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 glass flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <MessageSquare size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Candidate Feedback Detail</h2>
                                <p className="text-xs text-slate-500">ID: {detailData?.id || feedbackId}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scroll */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="animate-spin text-amber-600" size={32} />
                                <p className="text-xs text-slate-500 font-medium">Fetching feedback telemetry...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2 text-xs">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        ) : (
                            <>
                                {/* Candidate Profile & Review Status Bar */}
                                <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center overflow-hidden">
                                            {detailData?.userPicture ? (
                                                <img src={detailData.userPicture} alt={detailData.userName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{detailData?.userName}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} /> {detailData?.userEmail}</p>
                                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                                                Total Interviews: {detailData?.interviewCount || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                        {detailData?.reviewStatus === 'Reviewed' ? (
                                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle size={12} /> Reviewed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={handleMarkAsReviewed}
                                                disabled={updating}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {updating ? <RefreshCw className="animate-spin" size={12} /> : <CheckCircle size={14} />} Mark as Reviewed
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Rating & AI Sentiment Card */}
                                <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-amber-400 font-black text-xl">
                                            <span>{detailData?.rating}</span>
                                            <Star size={20} className="fill-amber-400" />
                                            <span className="text-xs text-slate-400 font-normal">/ 5 Rating</span>
                                        </div>
                                        {getSentimentBadge(detailData?.sentiment)}
                                    </div>

                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                                            <Sparkles size={12} /> AI Feedback Summary
                                        </span>
                                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">"{detailData?.summary}"</p>
                                    </div>
                                </div>

                                {/* Favorite Feature & Full Suggestion */}
                                <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-3">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Favorite Feature Selection</span>
                                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                                            <Heart size={16} className="fill-primary-500 text-primary-500" /> {detailData?.favoriteFeature}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Suggestion / Feedback</span>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                            "{detailData?.fullSuggestion}"
                                        </div>
                                    </div>
                                </div>

                                {/* Telemetry & System Metadata */}
                                <div className="glass p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 block flex items-center gap-1"><Monitor size={12} /> Client Device</span>
                                        <strong className="text-slate-800 dark:text-slate-200">{detailData?.deviceInfo}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block flex items-center gap-1"><Globe size={12} /> Browser Agent</span>
                                        <strong className="text-slate-800 dark:text-slate-200">{detailData?.browserInfo}</strong>
                                    </div>
                                    <div className="col-span-2 text-slate-400 text-[11px]">
                                        Submitted on: {new Date(detailData?.submittedDate).toLocaleString()}
                                    </div>
                                </div>

                                {/* Prepared Future Reply UI Component */}
                                <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Send size={14} className="text-blue-600" /> Reply to Candidate (Prepared UI)
                                    </h4>

                                    <form onSubmit={handleSendReplyPlaceholder} className="space-y-2">
                                        <textarea
                                            rows={2}
                                            placeholder="Type your official reply to candidate..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                {replyStatusMsg || 'Email reply integration prepared.'}
                                            </span>
                                            <button
                                                type="submit"
                                                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                            >
                                                <Send size={12} /> Send Response
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 glass flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold rounded-xl transition-all"
                        >
                            Close Drawer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackDetailDrawer;

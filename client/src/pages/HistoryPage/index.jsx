import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteHistoryItem, clearHistory } from '../../services/historyService';
import { 
    Trash2, 
    History, 
    Calendar, 
    Award, 
    ChevronLeft, 
    ChevronRight, 
    AlertCircle, 
    ExternalLink,
    Search,
    Filter,
    Plus,
    ArrowLeft
} from 'lucide-react';

const HistoryPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 9;
    const navigate = useNavigate();

    const fetchHistory = async (page) => {
        setLoading(true);
        try {
            const data = await getHistory(page, ITEMS_PER_PAGE);
            setInterviews(data.entries || []);
            setTotalPages(data.totalPages || 1);
            setTotalEntries(data.totalEntries || 0);
            setCurrentPage(data.currentPage || page);
        } catch (error) {
            console.error("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage);
    }, [currentPage]);

    const handleInterviewClick = (interview) => {
        if (interview.status === 'completed') {
            navigate(`/feedback/${interview._id}`);
        } else {
            navigate(`/interview/${interview._id}`);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this interview record?")) return;
        
        try {
            await deleteHistoryItem(id);
            setInterviews(prev => prev.filter(inv => inv._id !== id));
            setTotalEntries(prev => prev - 1);
        } catch (error) {
            console.error("Deletion failed.");
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your entire history? This cannot be undone.")) return;
        
        try {
            await clearHistory();
            setInterviews([]);
            setTotalEntries(0);
            setTotalPages(1);
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to clear history.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary-theme mb-2">
                        <History size={24} />
                        <span className="font-bold uppercase tracking-widest text-xs">Activity Logs</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-main tracking-tight">Interview History</h1>
                    <p className="text-text-secondary font-medium">Manage and review your past {totalEntries} simulation attempts.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 bg-card text-rose-500 border border-border-theme px-4 py-2 rounded-xl font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 transition-all active:scale-95 shadow-sm"
                    >
                        <Trash2 size={16} /> Clear All
                    </button>
                    <button 
                        onClick={() => navigate('/setup')}
                        className="flex items-center gap-2 bg-primary-theme text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-theme-hover transition-all active:scale-95"
                    >
                        <Plus size={16} /> New Session
                    </button>
                </div>
            </div>

            {/* Content Table/Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-card border border-border-theme rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : interviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((inv) => (
                        <div 
                            key={inv._id} 
                            onClick={() => handleInterviewClick(inv)}
                            className="group bg-card rounded-2xl border border-border-theme card-shadow p-6 hover:border-primary-theme/50 transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        inv.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                                    }`}>
                                        {inv.status}
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(inv._id, e)}
                                        className="text-text-secondary/50 hover:text-rose-500 transition-colors p-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-text-main group-hover:text-primary-theme transition-colors line-clamp-1">{inv.role}</h3>
                                    <div className="flex items-center gap-2 text-text-secondary mt-1">
                                        <Calendar size={14} />
                                        <span className="text-xs font-semibold">{new Date(inv.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-4 border-t border-border-theme">
                                {inv.status === 'completed' ? (
                                    <div className="flex items-center gap-2 text-text-main">
                                        <Award size={18} className="text-amber-500" />
                                        <span className="text-sm font-bold">Score: {inv.feedback?.scores?.['Overall Performance'] || 'N/A'}/10</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest">In Progress</span>
                                    </div>
                                )}
                                <div className="text-primary-theme opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-3xl border border-border-theme p-20 text-center space-y-6 card-shadow">
                    <div className="w-20 h-20 bg-accent-theme rounded-full mx-auto flex items-center justify-center text-text-secondary/50">
                        <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-text-main">No History Discovered</h4>
                        <p className="text-text-secondary max-w-sm mx-auto">Your completed and active interview sessions will appear here for review and management.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/setup')}
                        className="bg-primary-theme text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-theme-hover transition-all"
                    >
                        Start Your First Session
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2.5 rounded-xl border border-border-theme bg-card text-text-secondary hover:bg-accent-theme disabled:opacity-30 transition-all card-shadow"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-primary-theme text-white shadow-lg' 
                                    : 'bg-card border border-border-theme text-text-secondary hover:border-primary-theme/50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="p-2.5 rounded-xl border border-border-theme bg-card text-text-secondary hover:bg-accent-theme disabled:opacity-30 transition-all card-shadow"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
            
            <div className="flex justify-center border-t border-border-theme pt-10">
                <button 
                    onClick={() => navigate('/')}
                    className="text-text-secondary font-bold hover:text-text-main transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default HistoryPage;

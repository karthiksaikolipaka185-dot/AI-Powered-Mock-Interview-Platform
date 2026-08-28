import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/historyService';
import authService from '../../services/authService';
import FeedbackModal from '../../components/FeedbackModal';
import SkillDashboard from '../../components/SkillDashboard';
import { 
    Plus, 
    BarChart2, 
    CheckCircle2, 
    Star, 
    ArrowRight, 
    Calendar,
    ChevronRight,
    Trophy,
    Sparkles,
    Zap,
    Clock,
    Briefcase,
    TrendingUp,
    PlayCircle
} from 'lucide-react';

const StatCard = ({ title, value, label, icon: Icon, colorClass }) => (
    <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border-theme auth-card-shadow hover:border-primary-theme/40 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
            <div className={"w-11 h-11 rounded-xl " + colorClass + " flex items-center justify-center font-bold transition-transform group-hover:scale-105 duration-300 shrink-0"}>
                <Icon size={20} />
            </div>
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest bg-accent-theme/60 px-2.5 py-1 rounded-md border border-border-theme/40">
                {label}
            </span>
        </div>
        <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">{value}</h3>
            <p className="text-xs sm:text-sm font-semibold text-text-secondary mt-1">{title}</p>
        </div>
    </div>
);

const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10 space-y-8 animate-pulse">
        <div className="space-y-3">
            <div className="h-6 w-44 bg-accent-theme/80 rounded-full"></div>
            <div className="h-9 w-72 bg-accent-theme rounded-xl"></div>
            <div className="h-4 w-96 bg-accent-theme/60 rounded-lg"></div>
        </div>
        <div className="h-64 w-full bg-accent-theme/70 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-accent-theme/60 rounded-2xl"></div>
            ))}
        </div>
        <div className="h-72 bg-accent-theme/50 rounded-3xl"></div>
    </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [allInterviews, setAllInterviews] = useState([]);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const user = authService.getCurrentUser();
    const userName = user?.name?.split(' ')[0] || user?.name || 'Candidate';

    const getGreetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const historyBlock = await getHistory(1, 100);
                const entries = historyBlock.entries || [];
                setAllInterviews(entries);
                setRecentInterviews(entries.slice(0, 3));
            } catch (err) {
                console.error("Dashboard extraction failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (loading) return;

        const completedCount = allInterviews.filter(inv => inv.status === 'completed').length;
        if (completedCount < 1) return;

        const userId = user?.id || user?._id || user?.email || 'guest';

        const submitted = localStorage.getItem("feedbackSubmitted_" + userId) === 'true';
        const dismissed = localStorage.getItem("feedbackDismissed_" + userId) === 'true';
        const postponedAfter = Number(localStorage.getItem("feedbackPostponedAfter_" + userId) || 0);

        if (!submitted && !dismissed && completedCount > postponedAfter) {
            const timer = setTimeout(() => {
                setShowFeedbackModal(true);
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [loading, allInterviews, user]);

    const handleFeedbackSubmitSuccess = () => {
        const userId = user?.id || user?._id || user?.email || 'guest';
        localStorage.setItem("feedbackSubmitted_" + userId, 'true');
        setShowFeedbackModal(false);
    };

    const handleFeedbackMaybeLater = () => {
        const userId = user?.id || user?._id || user?.email || 'guest';
        const completedCount = allInterviews.filter(inv => inv.status === 'completed').length;
        localStorage.setItem("feedbackPostponedAfter_" + userId, completedCount.toString());
        setShowFeedbackModal(false);
    };

    const handleFeedbackNeverAskAgain = () => {
        const userId = user?.id || user?._id || user?.email || 'guest';
        localStorage.setItem("feedbackDismissed_" + userId, 'true');
        setShowFeedbackModal(false);
    };

    const totalInterviews = allInterviews.length;
    const completedInterviews = allInterviews.filter(inv => inv.status === 'completed').length;
    
    let averageScore = 0;
    if (completedInterviews > 0) {
        const scoredInterviews = allInterviews.filter(inv => inv.status === 'completed' && inv.feedback?.scores?.['Overall Performance']);
        const totalSum = scoredInterviews.reduce((sum, inv) => sum + Number(inv.feedback.scores['Overall Performance']), 0);
        averageScore = scoredInterviews.length > 0 ? (totalSum / scoredInterviews.length).toFixed(1) : 0;
    }

    const completionRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="min-h-screen bg-background auth-bg-gradient relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10 space-y-8 relative z-10">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-theme/10 border border-primary-theme/20 mb-2">
                            <Sparkles size={14} className="text-primary-theme" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-theme">Interview Preparation Suite</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
                            {getGreetingTime()}, <span className="text-primary-theme">{userName}</span> 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary font-medium mt-1">
                            Here is your interview readiness breakdown and ongoing activity.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                        <button
                            onClick={() => navigate('/setup')}
                            className="group bg-primary-theme text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm hover:bg-primary-theme-hover shadow-md shadow-primary-500/20 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={18} />
                            <span>New Practice Session</span>
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 p-6 sm:p-10 text-white shadow-2xl shadow-primary-900/30 border border-primary-700/40">
                    <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary-200 text-xs font-bold uppercase tracking-wider">
                            <Zap size={14} className="text-amber-400" />
                            Adaptive AI Interview Engine
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            Ready for your next mock interview?
                        </h2>

                        <p className="text-sm sm:text-base text-primary-100/90 font-medium leading-relaxed max-w-xl">
                            Upload your resume and practice with custom role-specific questions generated specifically for your target domain, experience, and key skills.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <button 
                                onClick={() => navigate('/setup')}
                                className="group flex items-center gap-2.5 bg-white text-primary-950 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] cursor-pointer"
                            >
                                <PlayCircle size={20} className="text-primary-600 group-hover:scale-110 transition-transform" />
                                <span>Start Interview Session</span>
                                <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {totalInterviews > 0 && (
                                <button
                                    onClick={() => navigate('/history')}
                                    className="px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-primary-100 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all backdrop-blur-md cursor-pointer"
                                >
                                    Review Past Sessions
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                            <BarChart2 size={20} className="text-primary-theme" />
                            <span>Performance Overview</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <StatCard 
                            title="Total Practice Sessions" 
                            value={totalInterviews} 
                            label="Total"
                            icon={Briefcase} 
                            colorClass="bg-primary-500/10 text-primary-theme" 
                        />
                        <StatCard 
                            title="Completed Evaluations" 
                            value={completedInterviews} 
                            label="Finished"
                            icon={CheckCircle2} 
                            colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        />
                        <StatCard 
                            title="Average Score" 
                            value={completedInterviews > 0 ? (averageScore + "/10") : 'N/A'} 
                            label="Overall"
                            icon={Star} 
                            colorClass="bg-amber-500/10 text-amber-500" 
                        />
                        <StatCard 
                            title="Session Completion Rate" 
                            value={completionRate + "%"} 
                            label="Efficiency"
                            icon={TrendingUp} 
                            colorClass="bg-indigo-500/10 text-indigo-500" 
                        />
                    </div>
                </section>

                <section>
                    <SkillDashboard />
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                                <Clock size={20} className="text-primary-theme" />
                                <span>Recent Activity</span>
                            </h2>
                            {allInterviews.length > 0 && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-theme text-text-secondary border border-border-theme">
                                    {allInterviews.length} {allInterviews.length === 1 ? 'Session' : 'Sessions'}
                                </span>
                            )}
                        </div>

                        {allInterviews.length > 3 && (
                            <button 
                                onClick={() => navigate('/history')}
                                className="text-primary-theme text-xs sm:text-sm font-bold flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer"
                            >
                                <span>View All History</span>
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>

                    <div className="bg-card rounded-2xl border border-border-theme auth-card-shadow overflow-hidden">
                        {recentInterviews.length > 0 ? (
                            <div className="divide-y divide-border-theme">
                                {recentInterviews.map((inv) => (
                                    <div 
                                        key={inv._id} 
                                        onClick={() => navigate(inv.status === 'completed' ? ("/feedback/" + inv._id) : ("/interview/" + inv._id))}
                                        className="group flex items-center justify-between p-4 sm:p-5 hover:bg-accent-theme/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={"p-3 rounded-xl shrink-0 " + (
                                                inv.status === 'completed' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-primary-theme/10 text-primary-theme border border-primary-theme/20'
                                            )}>
                                                {inv.status === 'completed' ? <Trophy size={20} /> : <Calendar size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-main text-base group-hover:text-primary-theme transition-colors">
                                                    {(inv.role || 'General') + " Interview"}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-text-secondary font-medium">
                                                    {inv.status === 'completed' ? (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 size={13} /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 font-semibold text-primary-theme">
                                                            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                                                            In Progress
                                                        </span>
                                                    )}
                                                    <span className="text-border-theme">•</span>
                                                    <span>{new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            {inv.status === 'completed' && inv.feedback?.scores?.['Overall Performance'] ? (
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Score</div>
                                                    <div className="text-xl font-extrabold text-text-main">
                                                        {inv.feedback.scores['Overall Performance']}<span className="text-xs text-text-secondary font-normal">/10</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                            <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-primary-theme group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 sm:p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-primary-theme/10 text-primary-theme rounded-2xl mx-auto flex items-center justify-center border border-primary-theme/20">
                                    <BarChart2 size={32} />
                                </div>
                                <div className="max-w-md mx-auto space-y-1">
                                    <h4 className="text-lg font-bold text-text-main">Your interview journey starts here</h4>
                                    <p className="text-xs sm:text-sm text-text-secondary font-medium">
                                        Complete your first AI-powered mock interview and start building your performance history and skill breakdown.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate('/setup')}
                                    className="bg-primary-theme text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-theme-hover transition-all shadow-md shadow-primary-500/20 active:scale-[0.99] cursor-pointer inline-flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span>Start First Session</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <FeedbackModal 
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmitSuccess={handleFeedbackSubmitSuccess}
                    onMaybeLater={handleFeedbackMaybeLater}
                    onNeverAskAgain={handleFeedbackNeverAskAgain}
                />
            </div>
        </div>
    );
};

export default HomePage;

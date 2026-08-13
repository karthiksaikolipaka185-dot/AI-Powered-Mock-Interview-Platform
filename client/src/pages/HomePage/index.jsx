import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/historyService';
import authService from '../../services/authService';
import FeedbackModal from '../../components/FeedbackModal';
import SkillDashboard from '../../components/SkillDashboard';
import { 
    Plus, 
    BarChart2, 
    CheckCircle, 
    Star, 
    ArrowRight, 
    Calendar,
    ChevronRight,
    Trophy
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card p-6 rounded-2xl border border-border-theme card-shadow hover:border-primary-theme/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Metrics</span>
        </div>
        <h3 className="text-3xl font-bold text-text-main tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-text-secondary mt-1">{title}</p>
    </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [allInterviews, setAllInterviews] = useState([]);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

    // Delayed non-intrusive Feedback Modal trigger logic
    useEffect(() => {
        if (loading) return;

        const completedCount = allInterviews.filter(inv => inv.status === 'completed').length;
        if (completedCount < 1) return;

        const user = authService.getCurrentUser();
        const userId = user?.id || user?._id || user?.email || 'guest';

        const submitted = localStorage.getItem(`feedbackSubmitted_${userId}`) === 'true';
        const dismissed = localStorage.getItem(`feedbackDismissed_${userId}`) === 'true';
        const postponedAfter = Number(localStorage.getItem(`feedbackPostponedAfter_${userId}`) || 0);

        if (!submitted && !dismissed && completedCount > postponedAfter) {
            const timer = setTimeout(() => {
                setShowFeedbackModal(true);
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [loading, allInterviews]);

    const handleFeedbackSubmitSuccess = () => {
        const user = authService.getCurrentUser();
        const userId = user?.id || user?._id || user?.email || 'guest';
        localStorage.setItem(`feedbackSubmitted_${userId}`, 'true');
        setShowFeedbackModal(false);
    };

    const handleFeedbackMaybeLater = () => {
        const user = authService.getCurrentUser();
        const userId = user?.id || user?._id || user?.email || 'guest';
        const completedCount = allInterviews.filter(inv => inv.status === 'completed').length;
        localStorage.setItem(`feedbackPostponedAfter_${userId}`, completedCount.toString());
        setShowFeedbackModal(false);
    };

    const handleFeedbackNeverAskAgain = () => {
        const user = authService.getCurrentUser();
        const userId = user?.id || user?._id || user?.email || 'guest';
        localStorage.setItem(`feedbackDismissed_${userId}`, 'true');
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary-900 rounded-3xl p-8 md:p-16 text-white shadow-2xl shadow-primary-900/20">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary-500/20 backdrop-blur-md rounded-full border border-primary-500/20">
                        AI-Powered Career Suite
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-[1.15]">
                        Master the Interview <br />
                        <span className="text-primary-300">with Advanced AI</span>
                    </h1>
                    <p className="text-lg text-primary-100/90 mb-10 leading-relaxed max-w-lg">
                        Upload your resume and practice with customized questions generated specifically for your target role and experience level.
                    </p>
                    <button 
                        onClick={() => navigate('/setup')}
                        className="group flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <Plus size={22} className="text-primary-600" />
                        Start New Interview
                        <ArrowRight size={18} className="text-primary-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Stats Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-text-main">Performance Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Sessions" 
                        value={totalInterviews} 
                        icon={BarChart2} 
                        color="bg-primary-500" 
                    />
                    <StatCard 
                        title="Completed Path" 
                        value={completedInterviews} 
                        icon={CheckCircle} 
                        color="bg-emerald-500" 
                    />
                    <StatCard 
                        title="Avg. Performance" 
                        value={`${averageScore}/10`} 
                        icon={Star} 
                        color="bg-amber-500" 
                    />
                </div>
            </section>

            {/* Phase 3 Candidate Skill Dashboard */}
            <section>
                <SkillDashboard />
            </section>

            {/* Recent Activity */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text-main">Recent Activity</h2>
                    {allInterviews.length > 3 && (
                        <button 
                            onClick={() => navigate('/history')}
                            className="text-primary-theme font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View All <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <div className="bg-card rounded-2xl border border-border-theme card-shadow overflow-hidden">
                    {recentInterviews.length > 0 ? (
                        <div className="divide-y divide-border-theme">
                            {recentInterviews.map((inv) => (
                                <div 
                                    key={inv._id} 
                                    onClick={() => navigate(inv.status === 'completed' ? `/feedback/${inv._id}` : `/interview/${inv._id}`)}
                                    className="group flex items-center justify-between p-6 hover:bg-accent-theme transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3 rounded-xl ${inv.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'}`}>
                                            {inv.status === 'completed' ? <Trophy size={24} /> : <Calendar size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main text-lg group-hover:text-primary-theme transition-colors">{inv.role} Interview</h4>
                                            <p className="text-text-secondary text-sm flex items-center gap-2 mt-0.5">
                                                {inv.status === 'completed' 
                                                    ? <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /> Completed</span>
                                                    : <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div> In Progress</span>
                                                }
                                                <span className="text-text-secondary/50">•</span>
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {inv.status === 'completed' && inv.feedback?.scores?.['Overall Performance'] && (
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Score</div>
                                                <div className="text-2xl font-bold text-text-main">{inv.feedback.scores['Overall Performance']}<span className="text-sm text-text-secondary ml-0.5">/10</span></div>
                                            </div>
                                        )}
                                        <ChevronRight size={24} className="text-text-secondary/50 group-hover:text-primary-theme transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-accent-theme rounded-3xl mx-auto flex items-center justify-center mb-6">
                                <BarChart2 size={40} className="text-text-secondary" />
                            </div>
                            <h4 className="text-xl font-bold text-text-main mb-2">No Interviews Yet</h4>
                            <p className="text-text-secondary mb-8 max-w-sm mx-auto">Start your first AI-powered mock interview to see your stats and analysis here.</p>
                            <button 
                                onClick={() => navigate('/setup')}
                                className="bg-primary-theme text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-theme-hover transition-all shadow-md shadow-primary-200 dark:shadow-none"
                            >
                                Start First Session
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* User Feedback System Modal */}
            <FeedbackModal 
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmitSuccess={handleFeedbackSubmitSuccess}
                onMaybeLater={handleFeedbackMaybeLater}
                onNeverAskAgain={handleFeedbackNeverAskAgain}
            />
        </div>
    );
};

export default HomePage;

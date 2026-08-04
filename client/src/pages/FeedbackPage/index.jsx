import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInterview } from '../../services/interviewService';
import { 
    Award, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    Target,
    ArrowLeft,
    Lightbulb,
    BarChart3,
    ShieldCheck,
    Code2,
    MessageSquare
} from 'lucide-react';

const ScoreCard = ({ title, score, icon: Icon, description }) => {
    const getScoreColor = (s) => {
        if (s >= 8) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50';
        if (s >= 6) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50';
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50';
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700`}>
                    <Icon size={20} />
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
                    {score}/10
                </div>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-auto">
                <div 
                    className={`h-full transition-all duration-1000 ${score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                    style={{ width: `${score * 10}%` }} 
                />
            </div>
        </div>
    );
};

const FeedbackPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const data = await getInterview(id);
                if (data && data.feedback) {
                    setFeedback(data.feedback);
                } else {
                    throw new Error('Feedback not available');
                }
            } catch (error) {
                console.error("Failed to load feedback.");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!feedback) return null;

    const overallScore = feedback?.scores?.['Overall Performance'] || 0;

    const metrics = [
        { title: 'Communication', score: feedback?.scores?.['Communication Skills'], icon: MessageSquare, desc: 'Clarity, tone, and delivery of responses.' },
        { title: 'Technical', score: feedback?.scores?.['Technical Knowledge'], icon: ShieldCheck, desc: 'Understanding of core concepts and domains.' },
        { title: 'Problem Solving', score: feedback?.scores?.['Problem Solving'], icon: Lightbulb, desc: 'Analytical approach to complex tasks.' },
        { title: 'Code Quality', score: feedback?.scores?.['Code Quality'], icon: Code2, desc: 'Cleanliness, optimization, and standards.' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-12">
            {/* Header & Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <button 
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm mb-4 bg-primary-50 dark:bg-primary-950/50 px-3 py-1.5 rounded-lg w-fit hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to History
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Performance Summary</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Detailed analysis of your interview session artifacts.</p>
                </div>
                
                <div className="bg-primary-900 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-primary-900/20 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Award size={40} className="text-primary-300" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-primary-300 uppercase tracking-widest mb-1">Overall Score</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black">{overallScore}</span>
                            <span className="text-lg font-bold text-primary-400">/10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, idx) => (
                    <ScoreCard key={idx} title={m.title} score={m.score} icon={m.icon} description={m.desc} />
                ))}
            </div>

            {/* Code Review & Complexity Analysis Section */}
            {feedback?.codeReview && (
                <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-8 card-shadow space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
                                <Code2 size={28} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-primary-300 uppercase tracking-widest">Technical Assessment</span>
                                <h3 className="text-2xl font-extrabold text-white">Python Code Review & Complexity Analysis</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm font-mono font-bold text-emerald-400">
                                Time: {feedback.codeReview.timeComplexity}
                            </div>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm font-mono font-bold text-amber-400">
                                Space: {feedback.codeReview.spaceComplexity}
                            </div>
                            <div className="px-4 py-2 bg-primary-600 rounded-xl font-extrabold text-sm text-white">
                                Coding Score: {feedback.codeReview.score}/10
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Summary & Correctness</h4>
                        <p className="text-slate-200 text-sm leading-relaxed font-medium bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                            {feedback.codeReview.summary || feedback.codeReview.correctness}
                        </p>
                    </div>

                    {feedback.codeReview.improvements?.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Optimization Suggestions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {feedback.codeReview.improvements.map((imp, i) => (
                                    <div key={i} className="flex items-start gap-2.5 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 font-medium">
                                        <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                        <span>{imp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Qualitative Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 card-shadow flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Identified Strengths</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.strengths?.map((str, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{str}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Improvements */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 card-shadow flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Areas for Growth</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.weaknesses?.map((weak, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{weak}</p>
                            </div>
                        ))}
                        {feedback?.suggestions?.map((sug, idx) => (
                            <div key={`sug-${idx}`} className="flex gap-3 group">
                                <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{sug}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95"
                >
                    <BarChart3 size={20} />
                    Exit to Dashboard
                </button>
            </div>
        </div>
    );
};

export default FeedbackPage;

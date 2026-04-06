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
        if (s >= 8) return 'text-emerald-600 bg-emerald-50';
        if (s >= 6) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50';
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100`}>
                    <Icon size={20} />
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
                    {score}/10
                </div>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
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
                        className="flex items-center gap-2 text-primary-600 font-bold text-sm mb-4 bg-primary-50 px-3 py-1.5 rounded-lg w-fit hover:bg-primary-100 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to History
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Performance Summary</h1>
                    <p className="text-slate-500 font-medium">Detailed analysis of your interview session artifacts.</p>
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

            {/* Qualitative Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Identified Strengths</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.strengths?.map((str, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{str}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Areas for Growth</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.weaknesses?.map((weak, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{weak}</p>
                            </div>
                        ))}
                        {feedback?.suggestions?.map((sug, idx) => (
                            <div key={`sug-${idx}`} className="flex gap-3 group">
                                <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-slate-600 font-medium leading-relaxed italic group-hover:text-slate-900 transition-colors">{sug}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <BarChart3 size={20} />
                    Exit to Dashboard
                </button>
            </div>
        </div>
    );
};

export default FeedbackPage;

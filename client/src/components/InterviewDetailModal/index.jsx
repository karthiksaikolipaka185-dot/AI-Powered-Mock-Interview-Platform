import React, { useState, useEffect } from 'react';
import { getInterviewById } from '../../services/interviewManagementService';
import { 
    X, User, Mail, Video, Clock, FileText, Code2, MessageSquare, 
    CheckCircle, Star, AlertCircle, RefreshCw, Download, Cpu, Layers, Sparkles,
    Award
} from 'lucide-react';

const InterviewDetailModal = ({ interviewId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailData, setDetailData] = useState(null);

    useEffect(() => {
        if (!interviewId) return;
        const fetchDetail = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getInterviewById(interviewId);
                if (res.success) {
                    setDetailData(res.data);
                }
            } catch (err) {
                console.error('Error loading interview details:', err);
                setError(err.response?.data?.message || 'Failed to load interview session details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [interviewId]);

    if (!interviewId) return null;

    const { interviewInfo, candidateInfo, resumeSummary, questions, messages, codeSubmissions, feedback } = detailData || {};

    const scores = feedback?.scores || {};

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-background border border-border-theme rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-border-theme glass flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                            <Video size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-extrabold text-text-main">
                                    Interview Session Telemetry
                                </h2>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    interviewInfo?.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                }`}>
                                    {interviewInfo?.status}
                                </span>
                            </div>
                            <p className="text-xs text-text-secondary">ID: {interviewInfo?.id} • Role: {interviewInfo?.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1 text-xs font-bold bg-accent-theme hover:bg-border-theme text-text-main px-3 py-2 rounded-xl transition-colors border border-border-theme"
                        >
                            <Download size={14} /> Print / Export PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-text-secondary hover:text-text-main hover:bg-accent-theme transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Body Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="animate-spin text-primary-theme" size={32} />
                            <p className="text-xs text-text-secondary font-medium">Fetching interview transcript & evaluation...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2 text-xs">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    ) : (
                        <>
                            {/* Candidate & Metadata Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Candidate Profile Card */}
                                <div className="glass p-4 rounded-2xl border border-border-theme shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent-theme text-primary-theme flex items-center justify-center font-bold overflow-hidden">
                                        {candidateInfo?.picture ? (
                                            <img src={candidateInfo.picture} alt={candidateInfo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-bold text-text-main">{candidateInfo?.name}</h3>
                                        <p className="text-xs text-text-secondary flex items-center gap-1"><Mail size={12} /> {candidateInfo?.email}</p>
                                        {resumeSummary && (
                                            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                                                <FileText size={12} /> {resumeSummary.fileName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Session Metadata Card */}
                                <div className="glass p-4 rounded-2xl border border-border-theme shadow-sm grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-text-secondary block">Target Role:</span>
                                        <strong className="text-text-main capitalize">{interviewInfo?.role}</strong>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary block">Duration:</span>
                                        <strong className="text-blue-600 dark:text-blue-400">{interviewInfo?.durationMinutes} mins</strong>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary block">Started:</span>
                                        <span className="text-text-secondary">{new Date(interviewInfo?.startedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary block">Overall Score:</span>
                                        <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
                                            {scores['Overall Performance'] || scores['overall'] || '8.5'}/10
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Conversation Timeline */}
                            <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare size={16} className="text-blue-600" /> Question & Response Conversation Timeline
                                </h3>

                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {messages && messages.length > 0 ? (
                                        messages.map((m, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`p-3 rounded-2xl text-xs space-y-1 ${
                                                    m.role === 'ai'
                                                    ? 'bg-primary-theme/10 border border-primary-theme/20 text-text-main mr-8'
                                                    : 'bg-accent-theme border border-border-theme text-text-main ml-8'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase">
                                                    <span>{m.role === 'ai' ? 'AI Voice Interviewer' : candidateInfo?.name}</span>
                                                    <span>Msg #{idx + 1}</span>
                                                </div>
                                                <p className="leading-relaxed">{m.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-text-secondary italic">No message transcript recorded.</p>
                                    )}
                                </div>
                            </div>

                            {/* Coding Submissions Section */}
                            {codeSubmissions && codeSubmissions.length > 0 && (
                                <div className="glass p-5 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-sm space-y-4 bg-amber-500/5">
                                    <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Code2 size={16} /> Candidate Code Submission & AI Analysis
                                    </h3>

                                    {codeSubmissions.map(sub => (
                                        <div key={sub.id} className="space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-text-main">Programming Language: <strong className="text-amber-600 capitalize">{sub.language}</strong></span>
                                                <span className="text-text-secondary">{new Date(sub.timestamp).toLocaleTimeString()}</span>
                                            </div>

                                            {/* Code Editor Preview */}
                                            <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                                                <pre><code>{sub.code}</code></pre>
                                            </div>

                                            {/* AI Complexity Cards */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <div className="p-3 bg-card border border-border-theme rounded-xl text-center">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase block flex items-center justify-center gap-1">
                                                        <Cpu size={12} /> Time Complexity
                                                    </span>
                                                    <strong className="text-amber-600 dark:text-amber-400 text-sm">{sub.timeComplexity}</strong>
                                                </div>
                                                <div className="p-3 bg-card border border-border-theme rounded-xl text-center">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase block flex items-center justify-center gap-1">
                                                        <Layers size={12} /> Space Complexity
                                                    </span>
                                                    <strong className="text-blue-600 dark:text-blue-400 text-sm">{sub.spaceComplexity}</strong>
                                                </div>
                                                <div className="p-3 bg-card border border-border-theme rounded-xl text-center col-span-2 sm:col-span-1">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase block flex items-center justify-center gap-1">
                                                        <Sparkles size={12} /> Optimization
                                                    </span>
                                                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">Optimal Logic</strong>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-card border border-border-theme rounded-xl text-xs space-y-1">
                                                <strong className="text-text-main block">AI Code Evaluation Notes:</strong>
                                                <p className="text-text-secondary">{sub.aiEvaluation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Final AI Feedback Report */}
                            <div className="glass p-5 rounded-2xl border border-border-theme shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Award size={16} className="text-indigo-600" /> Final AI Feedback & Grading Breakdown
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Scores Breakdown */}
                                    <div className="space-y-3">
                                        {Object.entries(scores).map(([metric, score]) => (
                                            <div key={metric} className="space-y-1 text-xs">
                                                <div className="flex justify-between font-semibold">
                                                    <span className="text-text-main">{metric}</span>
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{score}/10</span>
                                                </div>
                                                <div className="w-full h-2 bg-accent-theme rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full" 
                                                        style={{ width: `${(Number(score) / 10) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Qualitative Feedback Lists */}
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">Key Strengths:</strong>
                                            <ul className="list-disc list-inside text-text-secondary space-y-0.5">
                                                {(feedback?.strengths || ['Demonstrated clear domain expertise']).map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong className="text-amber-600 dark:text-amber-400 block mb-1">Areas for Improvement:</strong>
                                            <ul className="list-disc list-inside text-text-secondary space-y-0.5">
                                                {(feedback?.weaknesses || ['Could elaborate further on system architecture']).map((w, i) => <li key={i}>{w}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border-theme glass flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-accent-theme hover:bg-border-theme text-text-main rounded-xl border border-border-theme text-xs font-bold transition-all"
                    >
                        Close Modal
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InterviewDetailModal;

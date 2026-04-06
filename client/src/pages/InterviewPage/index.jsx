import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    getInterview, 
    submitTextAnswer, 
    transcribeAudio, 
    submitCode, 
    endInterview 
} from '../../services/interviewService';

import AudioPlayer from '../../components/AudioPlayer';
import VoiceRecorder from '../../components/VoiceRecorder';
import CodeEditor from '../../components/CodeEditor';
import { 
    MessageSquare, 
    Mic, 
    Code, 
    Bot, 
    CheckCircle, 
    Info, 
    LogOut, 
    Volume2, 
    Brain,
    Loader2,
    Trophy,
    ArrowRight
} from 'lucide-react';

const StatusBadge = ({ phase }) => {
    const config = {
        speaking: { label: 'Speaking', color: 'bg-primary-500 text-white', icon: Volume2 },
        listening: { label: 'Listening', color: 'bg-emerald-500 text-white', icon: Mic },
        thinking: { label: 'Thinking', color: 'bg-amber-500 text-white', icon: Brain },
        loading: { label: 'Loading', color: 'bg-slate-200 text-slate-500', icon: Loader2 },
        farewell: { label: 'Finished', color: 'bg-slate-900 text-white', icon: Trophy },
    };

    const { label, color, icon: Icon } = config[phase] || config.loading;
    return (
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${color} shadow-lg shadow-current/20 transition-all duration-500`}>
            <Icon size={14} className={phase === 'thinking' || phase === 'loading' ? 'animate-pulse' : ''} />
            {label}
        </div>
    );
};

const InterviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [phase, setPhase] = useState('loading');
    const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [audioBase64, setAudioBase64] = useState(null);
    const [feedbackReport, setFeedbackReport] = useState(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [activeTab, setActiveTab] = useState('voice'); // voice | text | code

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getInterview(id);
                if (data.questions) {
                    setTotalQuestions(data.questions.length);
                    const aiChats = data.messages ? data.messages.filter(m => m.role === 'ai').length : 0;
                    setCurrentQuestionNum(Math.min(aiChats, data.questions.length));
                }
                setPhase('speaking');
                if (location.state?.audio) {
                    setAudioBase64(location.state.audio);
                } else if (data.lastAudio) {
                    setAudioBase64(data.lastAudio);
                }
            } catch (error) {
                console.error("Failed to load interview context.");
            }
        };
        if (id) loadInitialData();
    }, [id, location.state]);

    const handleAudioEnded = () => setPhase('listening');

    const processAnswerResult = (response) => {
        if (response.audio) setAudioBase64(response.audio);
        setCurrentQuestionNum(prev => prev + 1);
        if (response.isCompleted) {
            setPhase('farewell');
        } else {
            setPhase('speaking');
        }
    };

    const handleVoiceSubmit = async (audioBlob) => {
        try {
            console.log('[InterviewPage] After recording: Audio blob captured successfully.', audioBlob);
            setPhase('thinking');

            // 1. Transcription step mapping AssemblyAI integration
            console.log('[InterviewPage] Starting transcription pipeline...');
            const transcribedData = await transcribeAudio(audioBlob);
            
            // Extract text from wrapper if returned as object based on refined backend controller response
            const transcribedString = typeof transcribedData === 'string' ? transcribedData : transcribedData?.transcription;
            console.log(`[InterviewPage] After transcription: Received text "${transcribedString}"`);

            if (!transcribedString || transcribedString.trim() === '') {
                console.warn('[InterviewPage] Transcription returned empty or null text.');
                alert('We couldn\'t quite catch that. Please try recording your answer again.');
                setPhase('listening');
                return;
            }

            // 2. Submit transcribed text to AI engine
            console.log('[InterviewPage] Before submitAnswer: Dispatching text to AI interviewer...');
            const response = await submitTextAnswer(id, transcribedString);
            console.log('[InterviewPage] After API response: AI evaluation received.');
            
            processAnswerResult(response);
        } catch (error) {
            console.error('[InterviewPage] Voice submission failed:', error.message || error);
            alert('Voice transcription failed. You can use the text tab to submit your answer manually.');
            setPhase('listening');
        }
    };

    const handleTextSubmit = async () => {
        if (!textAnswer.trim()) return;
        try {
            setPhase('thinking');
            const response = await submitTextAnswer(id, textAnswer);
            setTextAnswer('');
            processAnswerResult(response);
        } catch (error) {
            setPhase('listening');
        }
    };

    const handleCodeSubmit = async (code, language) => {
        try {
            setPhase('thinking');
            const response = await submitCode(id, code, language);
            processAnswerResult(response);
        } catch (error) {
            setPhase('listening');
        }
    };

    const handleEndInterview = async () => {
        try {
            const report = await endInterview(id);
            setFeedbackReport(report);
            setPhase('farewell');
        } catch (error) {
            console.error('Failed to end interview.');
        }
    };

    if (phase === 'loading') return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Initializing AI Interviewer...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-80px)] flex flex-col gap-6">
            {/* Header / Tracker */}
            <div className="flex bg-white p-4 rounded-2xl border border-slate-200 items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <StatusBadge phase={phase} />
                    {totalQuestions > 0 && (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                            <div className="flex gap-1">
                                {[...Array(totalQuestions)].map((_, i) => (
                                    <div key={i} className={`w-6 h-1.5 rounded-full transition-all duration-500 ${i < currentQuestionNum ? 'bg-primary-500' : 'bg-slate-100'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => { if(window.confirm('Are you sure you want to exit?')) navigate('/') }}
                    className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all flex items-center gap-2 text-sm font-bold"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Exit Session</span>
                </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden">
                {phase === 'farewell' ? (
                    <div className="h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                        <div className="max-w-xl w-full text-center space-y-8 bg-white p-12 rounded-3xl border border-slate-200 card-shadow">
                            <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/10">
                                <Trophy size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-extrabold text-slate-800">Excellent Work!</h2>
                                <p className="text-slate-500 text-lg">The interview session has been successfully completed. Our AI is now ready to present your detailed assessment.</p>
                            </div>
                            
                            {!feedbackReport ? (
                                <button 
                                    onClick={handleEndInterview} 
                                    className="w-full py-5 bg-primary-600 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all transform hover:-translate-y-1"
                                >
                                    Generate Performance Report
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate(`/feedback/${id}`)} 
                                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                >
                                    View Detailed Feedback <ArrowRight size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 h-full">
                        {/* Left: AI Column */}
                        <div className="flex flex-col gap-6">
                            <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative card-shadow group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-primary-50">
                                    <Bot size={180} className="stroke-[0.5]" />
                                </div>
                                <div className="relative z-10 space-y-8 max-w-md">
                                    <div className={`w-24 h-24 rounded-3xl bg-primary-600 shadow-2xl flex items-center justify-center mx-auto transition-transform duration-500 ${phase === 'speaking' ? 'scale-110' : ''}`}>
                                        <Bot size={48} className="text-white" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-extrabold text-slate-800">Recruitment AI</h3>
                                        <div className={`min-h-[100px] flex items-center justify-center ${phase === 'speaking' ? 'animate-in fade-in duration-700' : ''}`}>
                                            {phase === 'speaking' ? (
                                                <div className="flex gap-1.5 items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`w-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:${i * 0.1}s]`} style={{ height: `${Math.random() * 40 + 20}px` }} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 text-lg leading-relaxed font-medium">Ready for your response</p>
                                            )}
                                        </div>
                                    </div>
                                    {phase === 'speaking' && audioBase64 && (
                                        <AudioPlayer audioBase64={audioBase64} onEnded={handleAudioEnded} />
                                    )}
                                </div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                                    <Volume2 size={12} />
                                    Spatial Audio Active
                                </div>
                            </div>
                        </div>

                        {/* Right: Candidate Column */}
                        <div className="flex flex-col h-full overflow-hidden mt-6 lg:mt-0">
                            <div className="bg-white rounded-3xl border border-slate-200 flex flex-col h-full shadow-sm">
                                {/* Tab Switcher */}
                                <div className="flex border-b border-slate-100 p-2">
                                    {[
                                        { id: 'voice', label: 'Audio Response', icon: Mic },
                                        { id: 'text', label: 'Text Input', icon: MessageSquare },
                                        { id: 'code', label: 'Developer Console', icon: Code },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                                activeTab === tab.id 
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
                                            }`}
                                        >
                                            <tab.icon size={18} />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 p-8 flex flex-col">
                                    {activeTab === 'voice' && (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                                            <VoiceRecorder onSubmit={handleVoiceSubmit} disabled={phase !== 'listening'} />
                                            {phase === 'listening' ? (
                                                <div className="text-center space-y-2">
                                                    <h4 className="text-lg font-bold text-slate-800">Recording Active</h4>
                                                    <p className="text-slate-500 text-sm">Please provide your answer clearly.</p>
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 font-medium text-center max-w-xs">{phase === 'thinking' ? 'AI is processing...' : 'Interviewer is speaking...'}</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'text' && (
                                        <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
                                            <div className="flex-1 relative">
                                                <textarea 
                                                    value={textAnswer}
                                                    onChange={(e) => setTextAnswer(e.target.value)}
                                                    placeholder="Focus on specific examples from your experience..."
                                                    className="w-full h-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 outline-none focus:border-primary-500 transition-all font-medium text-slate-800 resize-none"
                                                    disabled={phase !== 'listening'}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleTextSubmit} 
                                                disabled={!textAnswer.trim() || phase !== 'listening'}
                                                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                Submit Response <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {activeTab === 'code' && (
                                        <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-hidden">
                                            <div className="flex-1 min-h-[300px]">
                                                <CodeEditor onSubmit={handleCodeSubmit} />
                                            </div>
                                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                                                <Info size={18} className="text-primary-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                    Use this environment for technical solutions. The AI will evaluate your syntax, logic, and optimization strategies.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Thinking Overlay */}
            {phase === 'thinking' && (
                <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white px-8 py-5 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-4 animate-in zoom-in-95 duration-300">
                        <Loader2 size={24} className="text-primary-600 animate-spin" />
                        <span className="font-extrabold text-slate-800 tracking-tight">AI Evaluation in Progress...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewPage;

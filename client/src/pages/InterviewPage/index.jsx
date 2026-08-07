import React, { useState, useEffect, useRef } from 'react';
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
        speaking: { label: 'Speaking', color: 'bg-primary-theme text-white', icon: Volume2 },
        listening: { label: 'Listening', color: 'bg-emerald-500 text-white', icon: Mic },
        thinking: { label: 'Thinking', color: 'bg-amber-500 text-white', icon: Brain },
        loading: { label: 'Loading', color: 'bg-accent-theme text-text-secondary', icon: Loader2 },
        farewell: { label: 'Finished', color: 'bg-text-main text-background', icon: Trophy },
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
    const [audioBase64, setAudioBase64] = useState('');
    const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
    const [questionsList, setQuestionsList] = useState([]);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [textAnswer, setTextAnswer] = useState('');
    const [activeTab, setActiveTab] = useState('voice');
    const [feedbackReport, setFeedbackReport] = useState(null);

    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const playedAudioKeyRef = useRef(null);

    const stopAndCleanupAudio = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
            } catch (e) {
                // Ignore audio pause errors
            }
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            try {
                URL.revokeObjectURL(audioUrlRef.current);
            } catch (e) {
                // Ignore revoke errors
            }
            audioUrlRef.current = null;
        }
    };

    const playAudioStream = (base64Data, key, forceRestart = false) => {
        if (!base64Data) return;

        // 1. Replay current question audio: Reuse existing audio instance, reset time to 0
        if (forceRestart) {
            if (audioRef.current && playedAudioKeyRef.current === key) {
                console.log('[AudioStream] Replaying current audio from time = 0');
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setPhase('speaking');
                audioRef.current.play().catch(err => console.warn('[AudioStream] Replay play() blocked:', err));
                return;
            }
        }

        // 2. Prevent duplicate auto-plays on re-renders/tab changes for same question
        if (!forceRestart && playedAudioKeyRef.current === key) {
            return;
        }

        // 3. New question: Clean up previous audio instance and Object URL completely
        stopAndCleanupAudio();

        try {
            console.log(`[AudioStream] Initializing new audio stream for key: ${key}`);
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });

            const url = URL.createObjectURL(blob);
            audioUrlRef.current = url;
            playedAudioKeyRef.current = key;

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                console.log('[AudioStream] Audio playback finished.');
                setPhase('listening');
            };

            setPhase('speaking');
            audio.play().catch(err => console.warn('[AudioStream] Auto-play blocked by browser:', err));
        } catch (error) {
            console.error('[AudioStream] Audio stream creation error:', error);
            setPhase('listening');
        }
    };

    // Auto-play audio when new question audio arrives
    useEffect(() => {
        if (audioBase64 && phase === 'speaking') {
            const key = `${currentQuestionNum}_${audioBase64.substring(0, 30)}`;
            playAudioStream(audioBase64, key, false);
        }
    }, [audioBase64, currentQuestionNum, phase]);

    // Cleanup audio on component unmount
    useEffect(() => {
        return () => {
            stopAndCleanupAudio();
        };
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getInterview(id);
                if (data.questions) {
                    setQuestionsList(data.questions);
                    setTotalQuestions(data.questions.length);
                    const aiChats = data.messages ? data.messages.filter(m => m.role === 'ai').length : 0;
                    setCurrentQuestionNum(Math.max(1, Math.min(aiChats, data.questions.length)));
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

    const currentQuestion = questionsList[currentQuestionNum - 1] || null;

    const processAnswerResult = (response) => {
        if (response.audio) setAudioBase64(response.audio);
        setCurrentQuestionNum(prev => prev + 1);
        if (response.isCompleted) {
            stopAndCleanupAudio();
            setPhase('farewell');
        } else {
            setPhase('speaking');
        }
    };

    const handleVoiceSubmit = async (audioBlob) => {
        try {
            console.log('[InterviewPage] After recording: Audio blob captured successfully.', audioBlob);
            stopAndCleanupAudio();
            setPhase('thinking');

            console.log('[InterviewPage] Starting transcription pipeline...');
            const transcribedData = await transcribeAudio(audioBlob);
            
            const transcribedString = typeof transcribedData === 'string' ? transcribedData : transcribedData?.transcription;
            console.log(`[InterviewPage] After transcription: Received text "${transcribedString}"`);

            if (!transcribedString || transcribedString.trim() === '') {
                console.warn('[InterviewPage] Transcription returned empty or null text.');
                alert('We couldn\'t quite catch that. Please try recording your answer again.');
                setPhase('listening');
                return;
            }

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
            stopAndCleanupAudio();
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
            stopAndCleanupAudio();
            setPhase('thinking');
            const response = await submitCode(id, code, language);
            processAnswerResult(response);
        } catch (error) {
            setPhase('listening');
        }
    };

    const handleEndInterview = async () => {
        try {
            stopAndCleanupAudio();
            const report = await endInterview(id);
            setFeedbackReport(report);
            setPhase('farewell');
        } catch (error) {
            console.error('Failed to end interview.');
        }
    };

    const handleManualReplayAudio = () => {
        if (!audioBase64) return;
        const key = `${currentQuestionNum}_${audioBase64.substring(0, 30)}`;
        playAudioStream(audioBase64, key, true);
    };

    if (phase === 'loading') return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <Loader2 size={48} className="text-primary-theme animate-spin" />
            <p className="text-text-secondary font-medium animate-pulse">Initializing AI Interviewer...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-80px)] flex flex-col gap-6">

            {/* Header / Tracker */}
            <div className="flex bg-card p-4 rounded-2xl border border-border-theme items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <StatusBadge phase={phase} />
                    {totalQuestions > 0 && (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Progress</span>
                            <div className="flex gap-1">
                                {[...Array(totalQuestions)].map((_, i) => (
                                    <div key={i} className={`w-6 h-1.5 rounded-full transition-all duration-500 ${i < currentQuestionNum ? 'bg-primary-theme' : 'bg-accent-theme'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Manual Audio Replay Speaker Button */}
                    <button 
                        onClick={handleManualReplayAudio}
                        disabled={!audioBase64}
                        className="flex items-center gap-2 bg-accent-theme hover:bg-border-theme text-text-main px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-border-theme disabled:opacity-40"
                        title="Replay Current Question Audio"
                    >
                        <Volume2 size={16} className="text-primary-theme" />
                        <span className="hidden sm:inline">Replay Audio</span>
                    </button>

                    <button 
                        onClick={() => { if(window.confirm('Are you sure you want to exit?')) navigate('/') }}
                        className="text-text-secondary hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Exit Session</span>
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden">
                {phase === 'farewell' ? (
                    <div className="h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                        <div className="max-w-xl w-full text-center space-y-8 bg-card p-12 rounded-3xl border border-border-theme card-shadow">
                            <div className="w-24 h-24 bg-primary-theme/10 text-primary-theme rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/10">
                                <Trophy size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-extrabold text-text-main">Excellent Work!</h2>
                                <p className="text-text-secondary text-lg">The interview session has been successfully completed. Our AI is now ready to present your detailed assessment.</p>
                            </div>
                            
                            {!feedbackReport ? (
                                <button 
                                    onClick={handleEndInterview} 
                                    className="w-full py-5 bg-primary-theme text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-primary-500/30 hover:bg-primary-theme-hover transition-all transform hover:-translate-y-1"
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
                            <div className="flex-1 bg-card rounded-3xl border border-border-theme p-8 flex flex-col items-center justify-center text-center relative card-shadow group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-text-secondary/5">
                                    <Bot size={180} className="stroke-[0.5]" />
                                </div>
                                <div className="relative z-10 space-y-8 max-w-md">
                                    <div className={`w-24 h-24 rounded-3xl bg-primary-theme shadow-2xl flex items-center justify-center mx-auto transition-transform duration-500 ${phase === 'speaking' ? 'scale-110' : ''}`}>
                                        <Bot size={48} className="text-white" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-extrabold text-text-main">Recruitment AI</h3>
                                        <div className={`min-h-[100px] flex items-center justify-center ${phase === 'speaking' ? 'animate-in fade-in duration-700' : ''}`}>
                                            {phase === 'speaking' ? (
                                                <div className="flex gap-1.5 items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`w-1.5 bg-primary-theme rounded-full animate-bounce [animation-delay:${i * 0.1}s]`} style={{ height: `${Math.random() * 40 + 20}px` }} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-text-secondary text-lg leading-relaxed font-medium">Ready for your response</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs font-bold text-text-secondary bg-accent-theme px-3 py-1.5 rounded-full border border-border-theme uppercase tracking-widest">
                                    <Volume2 size={12} />
                                    Spatial Audio Active
                                </div>
                            </div>
                        </div>

                        {/* Right: Candidate Column */}
                        <div className="flex flex-col h-full overflow-hidden mt-6 lg:mt-0">
                            <div className="bg-card rounded-3xl border border-border-theme flex flex-col h-full shadow-sm">
                                {/* Tab Switcher */}
                                <div className="flex border-b border-border-theme p-2">
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
                                                ? 'bg-primary-theme text-white shadow-lg' 
                                                : 'text-text-secondary hover:bg-accent-theme hover:text-primary-theme'
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
                                                    <h4 className="text-lg font-bold text-text-main">Recording Active</h4>
                                                    <p className="text-text-secondary text-sm">Please provide your answer clearly.</p>
                                                </div>
                                            ) : (
                                                <p className="text-text-secondary font-medium text-center max-w-xs">{phase === 'thinking' ? 'AI is processing...' : 'Interviewer is speaking...'}</p>
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
                                                    className="w-full h-full bg-accent-theme border-2 border-border-theme rounded-2xl p-6 outline-none focus:border-primary-theme focus:bg-surface transition-all font-medium text-text-main placeholder-text-secondary/50 resize-none"
                                                    disabled={phase !== 'listening'}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleTextSubmit} 
                                                disabled={!textAnswer.trim() || phase !== 'listening'}
                                                className="w-full py-4 bg-primary-theme text-white rounded-xl font-bold hover:bg-primary-theme-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
                                            <div className="mt-4 p-4 bg-accent-theme rounded-xl border border-border-theme flex items-start gap-3">
                                                <Info size={18} className="text-primary-theme shrink-0 mt-0.5" />
                                                <p className="text-xs text-text-secondary font-medium leading-relaxed">
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
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-card px-8 py-5 rounded-2xl shadow-2xl border border-border-theme flex items-center gap-4 animate-in zoom-in-95 duration-300">
                        <Loader2 size={24} className="text-primary-theme animate-spin" />
                        <span className="font-extrabold text-text-main tracking-tight">AI Evaluation in Progress...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewPage;

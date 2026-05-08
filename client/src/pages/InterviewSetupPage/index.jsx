import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResume, uploadResume, startInterview } from '../../services/interviewService';
import { 
    Briefcase, 
    Target, 
    FileText, 
    ChevronRight, 
    ChevronLeft, 
    Zap, 
    Brain, 
    Flame,
    FileUp,
    CheckCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';

const DIFFICULTY_OPTS = [
    { label: 'Easy', questions: 5, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
    { label: 'Medium', questions: 10, icon: Brain, color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
    { label: 'Hard', questions: 15, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50', border: 'hover:border-rose-200' }
];

const InterviewSetupPage = () => {
    const navigate = useNavigate();
    
    // Wizard State
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [fileName, setFileName] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [interviewId, setInterviewId] = useState(''); // NEW: Track ID across steps

    // Status State
    const [isUploading, setIsUploading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const existingResume = await getResume();
                if (existingResume) {
                    if (existingResume.fileName) setFileName(existingResume.fileName);
                    if (existingResume.extractedText) setResumeText(existingResume.extractedText);
                }
            } catch (err) {
                console.warn('Silent skip resume fetch');
            }
        };
        fetchResume();
    }, []);

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');
        try {
            const data = await uploadResume(file, role);
            setFileName(data.fileName || file.name);
            setResumeText(data.text || data.extractedText || 'Processed');
            if (data.interviewId) {
                setInterviewId(data.interviewId);
                localStorage.setItem("interviewId", data.interviewId); // NEW: Persist for start
            }
        } catch (error) {
            console.error('Resume upload failed:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleStart = async () => {
        if (!role || !difficulty || !resumeText) {
            setError('Please complete all steps before starting.');
            return;
        }

        setIsStarting(true);
        setError('');
        try {
            const id = localStorage.getItem("interviewId"); // NEW: Retrieve from storage
            console.log("Sending ID:", id); // NEW: Debug log

            if (!id) {
                setError('Interview context not found. Please re-upload your resume.');
                setIsStarting(false);
                return;
            }

            const difficultyData = DIFFICULTY_OPTS.find(d => d.label === difficulty);
            const totalQuestions = difficultyData?.questions || 5;
            const interviewData = await startInterview(id, role, resumeText, totalQuestions);

            navigate(`/interview/${interviewData.interviewId}`);
        } catch (error) {
            console.error('Failed to start interview:', error.response?.data); // Log detailed server error
            setError(error.message || 'Failed to initialize interview. Please check your connection.');
            setIsStarting(false);
        }
    };

    const steps = [
        { id: 1, label: 'Role', icon: Briefcase },
        { id: 2, label: 'Level', icon: Target },
        { id: 3, label: 'Resume', icon: FileText }
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Stepper Header */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                    {steps.map((s) => {
                        const Icon = s.icon;
                        const isCompleted = step > s.id;
                        const isActive = step === s.id;
                        
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                                    isCompleted 
                                    ? 'bg-primary-600 border-white text-white rotate-[360deg]' 
                                    : isActive 
                                    ? 'bg-white border-primary-600 text-primary-600' 
                                    : 'bg-white border-slate-200 text-slate-400'
                                } shadow-md`}>
                                    {isCompleted ? <CheckCircle size={24} /> : <Icon size={22} />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 card-shadow">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-extrabold text-slate-800">What's the target role?</h2>
                            <p className="text-slate-500">The AI will generate questions specific to this position.</p>
                        </div>
                        <div className="relative group">
                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={24} />
                            <input 
                                type="text" 
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 outline-none text-lg font-medium transition-all"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={() => setStep(2)}
                            disabled={!role.trim()}
                            className="w-full py-5 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Level <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-extrabold text-slate-800">Set the challenge</h2>
                            <p className="text-slate-500">Choose a difficulty level for your technical assessment.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {DIFFICULTY_OPTS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = difficulty === opt.label;
                                return (
                                    <button 
                                        key={opt.label}
                                        onClick={() => setDifficulty(opt.label)}
                                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                                            isSelected 
                                            ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-50' 
                                            : `border-slate-100 bg-slate-50 ${opt.border}`
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${opt.bg} ${opt.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-800 text-lg">{opt.label}</h4>
                                                <p className="text-slate-500 text-sm">Targeting {opt.questions} core questions</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200'}`}>
                                            {isSelected && <CheckCircle size={16} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={20} /> Back
                            </button>
                            <button onClick={() => setStep(3)} disabled={!difficulty} className="flex-[2] py-5 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                Continue to Resume <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-extrabold text-slate-800">Final Step: Your Context</h2>
                            <p className="text-slate-500">Provide your resume so the AI can customize the questions.</p>
                        </div>

                        <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 ${
                            fileName ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-primary-300'
                        }`}>
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={handleUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isUploading || isStarting}
                            />
                            
                            {isUploading ? (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Loader2 size={32} className="text-primary-600 animate-spin" />
                                    </div>
                                    <h4 className="font-bold text-slate-700">Analyzing Resume...</h4>
                                </>
                            ) : fileName ? (
                                <>
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{fileName}</h4>
                                        <p className="text-emerald-600 text-sm font-medium">Successfully processed</p>
                                    </div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Click to replace</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <FileUp size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">Click to upload your resume</h4>
                                        <p className="text-slate-500 text-sm">Only PDF files are supported</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => setStep(2)} 
                                disabled={isUploading || isStarting} 
                                className="flex-1 py-5 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>
                            <button 
                                onClick={handleStart} 
                                disabled={!resumeText || isUploading || isStarting}
                                className="flex-[2] py-5 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isStarting ? (
                                    <>Initializing... <Loader2 size={20} className="animate-spin" /></>
                                ) : (
                                    <>Start Interview <Zap size={20} fill="currentColor" /></>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewSetupPage;

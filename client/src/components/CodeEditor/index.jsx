import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Terminal, Play, CheckCircle, ChevronDown, Check, X, ShieldAlert, Cpu, AlertTriangle, Save } from 'lucide-react';

const GENERIC_STARTER_CODE = {
    python: `# Python 3.10\ndef solve():\n    # Write your solution here\n    pass\n`,
    javascript: `// Node.js (JavaScript)\nfunction solve() {\n    // Write your solution here\n}\n`,
    java: `// Java 17\nclass Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n`,
    cpp: `// C++17\nclass Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};\n`
};

const CodeEditor = ({
    interviewId = 'default',
    problem = null,
    initialCode = '',
    initialLanguage = 'python',
    onRun,
    onSubmit,
    onSave,
    isRunning = false,
    isSubmitting = false,
    executionResult = null
}) => {
    const [language, setLanguage] = useState(initialLanguage || 'python');
    const [codeState, setCodeState] = useState({});
    const [currentCode, setCurrentCode] = useState('');
    const [activeResultTab, setActiveResultTab] = useState('tests'); // 'tests' | 'output'
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const problemId = problem?.id || 'default_prob';
    const getDraftKey = (lang) => `mock-interview:draft:${interviewId}:${problemId}:${lang}`;

    // Get canonical starter code for a language from the problem definition (NEVER containing solutions)
    const getStarterCodeForLanguage = (lang) => {
        if (problem?.starterCode && problem.starterCode[lang]) {
            return problem.starterCode[lang];
        }
        return GENERIC_STARTER_CODE[lang] || '';
    };

    // Load persisted draft or problem starter code when problem, language, or interviewId changes
    useEffect(() => {
        const targetLang = initialLanguage || language || 'python';
        setLanguage(targetLang);

        const draftKey = `mock-interview:draft:${interviewId}:${problemId}:${targetLang}`;
        const localDraft = localStorage.getItem(draftKey);

        if (initialCode && initialCode.trim()) {
            setCurrentCode(initialCode);
            setCodeState(prev => ({ ...prev, [targetLang]: initialCode }));
        } else if (localDraft && localDraft.trim()) {
            setCurrentCode(localDraft);
            setCodeState(prev => ({ ...prev, [targetLang]: localDraft }));
        } else {
            const starter = getStarterCodeForLanguage(targetLang);
            setCurrentCode(starter);
            setCodeState(prev => ({ ...prev, [targetLang]: starter }));
        }
    }, [problemId, interviewId]);

    // Update code when initialCode changes externally (e.g. backend restore)
    useEffect(() => {
        if (initialCode && initialCode !== currentCode) {
            setCurrentCode(initialCode);
            setCodeState(prev => ({ ...prev, [language]: initialCode }));
        }
    }, [initialCode]);

    // Handle language change with confirmation if candidate modified the code
    const handleLanguageChange = (newLang) => {
        if (newLang === language) return;

        const currentStarter = getStarterCodeForLanguage(language);
        const hasModifiedCurrent = currentCode.trim() !== currentStarter.trim();

        if (hasModifiedCurrent) {
            const confirmSwitch = window.confirm(
                `Switching to ${newLang.toUpperCase()} will load its starter template. Your current work for ${language.toUpperCase()} will be saved in your draft history. Do you want to proceed?`
            );
            if (!confirmSwitch) return;
        }

        // Save current code to draft state and localStorage
        if (currentCode) {
            localStorage.setItem(getDraftKey(language), currentCode);
            if (onSave) onSave(currentCode, language);
        }
        setCodeState(prev => ({ ...prev, [language]: currentCode }));

        setLanguage(newLang);

        // Load new language: draft or starter code
        const targetDraftKey = getDraftKey(newLang);
        const savedTargetDraft = localStorage.getItem(targetDraftKey);
        const targetCode = (savedTargetDraft && savedTargetDraft.trim())
            ? savedTargetDraft
            : (codeState[newLang] || getStarterCodeForLanguage(newLang));

        setCurrentCode(targetCode);
        setCodeState(prev => ({ ...prev, [newLang]: targetCode }));
    };

    // Handle editor text change
    const handleCodeChange = (value) => {
        const val = value || '';
        setCurrentCode(val);
        setCodeState(prev => ({ ...prev, [language]: val }));
        try {
            localStorage.setItem(getDraftKey(language), val);
        } catch (e) {}
    };

    // Auto-save debounce to backend
    const saveTimeoutRef = useRef(null);
    useEffect(() => {
        if (!currentCode) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            if (onSave) {
                setIsSavingDraft(true);
                Promise.resolve(onSave(currentCode, language))
                    .finally(() => setIsSavingDraft(false));
            }
        }, 1500);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [currentCode, language]);

    const handleRunClick = async () => {
        setActiveResultTab('tests');
        if (onRun) await onRun(currentCode, language);
    };

    const handleSubmitClick = async () => {
        setActiveResultTab('tests');
        if (onSubmit) {
            await onSubmit(currentCode, language);
            try {
                localStorage.removeItem(getDraftKey(language));
            } catch (e) {}
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-border-theme shadow-2xl">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-border-theme gap-2">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 px-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                    
                    {/* Language Dropdown Selector */}
                    <div className="relative group">
                        <select 
                            value={language} 
                            onChange={(e) => handleLanguageChange(e.target.value)} 
                            className="appearance-none bg-[#1e1e1e] border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest pl-3 pr-8 py-1.5 rounded-lg outline-none cursor-pointer hover:border-primary-theme transition-colors"
                        >
                            <option value="python">Python 3.10</option>
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="java">Java 17</option>
                            <option value="cpp">C++17</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-white transition-colors" />
                    </div>

                    {isSavingDraft && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Save size={11} className="animate-pulse text-emerald-400" />
                            Auto-saving...
                        </span>
                    )}
                </div>

                {/* Execution Actions */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRunClick}
                        disabled={!currentCode.trim() || isRunning || isSubmitting}
                        className="flex items-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-700 hover:text-white active:scale-95 transition-all disabled:opacity-50"
                        title="Run code against public example test cases"
                    >
                        {isRunning ? <Cpu size={14} className="animate-spin text-primary-theme" /> : <Play size={14} className="text-emerald-400" fill="currentColor" />}
                        <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                    </button>

                    <button 
                        onClick={handleSubmitClick}
                        disabled={!currentCode.trim() || isRunning || isSubmitting}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-emerald-900/30"
                        title="Submit code for full evaluation across public and hidden test cases"
                    >
                        {isSubmitting ? <CheckCircle size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                    </button>
                </div>
            </div>

            {/* Monaco Editor Component */}
            <div className="flex-1 relative min-h-[320px]">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={currentCode}
                    theme="vs-dark"
                    onChange={handleCodeChange}
                    options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        folding: true,
                        bracketPairColorization: { enabled: true }
                    }}
                />
            </div>

            {/* Execution & Test Results Panel */}
            {executionResult && (
                <div className="bg-[#181818] border-t border-border-theme flex flex-col max-h-[240px] animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#202020] border-b border-border-theme">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveResultTab('tests')}
                                className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${activeResultTab === 'tests' ? 'bg-primary-theme text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Test Results {executionResult.publicResults ? `(${executionResult.publicResults.passedCount}/${executionResult.publicResults.totalCount})` : ''}
                            </button>
                            {executionResult.hiddenSummary && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/50">
                                    <ShieldAlert size={13} />
                                    <span>Hidden Tests: {executionResult.hiddenSummary.passedCount}/{executionResult.hiddenSummary.totalCount} ({executionResult.hiddenSummary.passPercentage}%)</span>
                                </div>
                            )}
                        </div>

                        {executionResult.correctnessScore !== undefined && (
                            <div className="text-xs font-extrabold text-emerald-400">
                                Score: {executionResult.correctnessScore}/10
                            </div>
                        )}
                    </div>

                    <div className="p-4 overflow-y-auto font-mono text-xs space-y-3">
                        {/* Public Test Case Cards */}
                        {executionResult.publicResults?.results?.map((res, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border ${res.passed ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/20 border-rose-800/40 text-rose-300'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-bold">
                                        {res.passed ? <Check size={16} className="text-emerald-400" /> : <X size={16} className="text-rose-400" />}
                                        <span>Public Test Case {res.testId}</span>
                                    </div>
                                    <span className="text-[10px] opacity-70">{res.executionTimeMs} ms</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2 opacity-90">
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-sans">Input</span>
                                        <code className="bg-black/40 px-2 py-1 rounded block mt-0.5 whitespace-pre-wrap">{typeof res.input === 'object' ? JSON.stringify(res.input) : String(res.input)}</code>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-sans">Expected Output</span>
                                        <code className="bg-black/40 px-2 py-1 rounded block mt-0.5 whitespace-pre-wrap">{typeof res.expectedOutput === 'object' ? JSON.stringify(res.expectedOutput) : String(res.expectedOutput)}</code>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-slate-500 block text-[10px] uppercase font-sans">Actual Output</span>
                                        <code className="bg-black/40 px-2 py-1 rounded block mt-0.5 whitespace-pre-wrap">{res.actualOutput || '(no output)'}</code>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Evaluation Note */}
                        {executionResult.evaluationResult && (
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                                <div className="font-bold text-primary-theme mb-1 flex items-center gap-1.5">
                                    <Terminal size={14} />
                                    <span>AI Qualitative Review</span>
                                </div>
                                <p className="text-xs leading-relaxed whitespace-pre-line font-sans opacity-90">{executionResult.evaluationResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer / Status Bar */}
            <div className="px-4 py-2 bg-[#007acc] text-white flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Terminal size={12} />
                        <span>Interactive Sandbox</span>
                    </div>
                    {problem?.topic && (
                        <span className="opacity-80">Topic: {problem.topic}</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                    <span className="flex items-center gap-1">
                        <Code size={12} />
                        {language.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;

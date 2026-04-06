import React, { useState } from 'react';
import { Code, Terminal, Play, Save, ChevronDown, CheckCircle } from 'lucide-react';

const CodeEditor = ({ onSubmit }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        await onSubmit(code, language);
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 px-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                    <div className="relative group">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="appearance-none bg-transparent text-slate-300 text-xs font-bold uppercase tracking-widest pl-2 pr-8 py-1 outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors" />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSubmit}
                        disabled={!code.trim() || isSaving}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isSaving ? <CheckCircle size={14} className="animate-pulse" /> : <Play size={14} fill="currentColor" />}
                        <span>{isSaving ? 'Running...' : 'Execute'}</span>
                    </button>
                </div>
            </div>

            {/* Main Input Area */}
            <div className="flex-1 relative font-mono text-sm group">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-center pt-4 text-[#858585] select-none text-[11px] leading-6">
                    {[...Array(20)].map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                <textarea 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="// Write your solution here...
// The AI will evaluate logic and complexity."
                    className="w-full h-full bg-transparent text-[#d4d4d4] pl-16 pr-6 pt-4 outline-none resize-none placeholder:text-slate-600 leading-6"
                    spellCheck="false"
                />
            </div>

            {/* Footer / Status */}
            <div className="px-4 py-2 bg-[#007acc] text-white flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Terminal size={12} />
                        <span>Ready</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                    <span className="flex items-center gap-1">
                        <Code size={12} />
                        {language}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;

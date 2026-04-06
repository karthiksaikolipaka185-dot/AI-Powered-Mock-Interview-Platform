import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Send, Volume2, Play, AlertCircle } from 'lucide-react';

const VoiceRecorder = ({ onSubmit, disabled }) => {
    const [status, setStatus] = useState('idle');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const safetyTimerRef = useRef(null);
    const maxDurationLimit = 300000;

    const startRecording = async () => {
        if (disabled) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const options = { mimeType: 'audio/webm;codecs=opus' };
            const mimeType = MediaRecorder.isTypeSupported(options.mimeType) ? options.mimeType : 'audio/webm';
            
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                setStatus('preview');
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setStatus('recording');

            safetyTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    stopRecording();
                }
            }, maxDurationLimit);

        } catch (error) {
            console.error('Mic access error:', error);
            alert('Please allow microphone access to record your answer.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            clearTimeout(safetyTimerRef.current);
        }
    };

    const submitAnswer = () => {
        if (onSubmit && audioBlob) {
            onSubmit(audioBlob);
            resetState();
        }
    };

    const resetState = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setAudioBlob(null);
        setStatus('idle');
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            clearTimeout(safetyTimerRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [previewUrl]);

    return (
        <div className="w-full max-w-sm mx-auto">
            {status === 'idle' && (
                <button 
                    onClick={startRecording}
                    disabled={disabled}
                    className="w-full flex flex-col items-center gap-6 p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary-400 hover:bg-primary-50 group transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:border-slate-200"
                >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-slate-400 group-hover:text-primary-600">
                        <Mic size={36} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-700">Record Voice Answer</h4>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Click to initialize mic</p>
                    </div>
                </button>
            )}
            
            {status === 'recording' && (
                <div className="w-full flex flex-col items-center gap-8 p-10 bg-primary-50/50 border-2 border-primary-100 rounded-3xl">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20"></div>
                        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center shadow-xl shadow-primary-500/40 relative z-10 transition-transform">
                            <Mic size={36} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-4 text-center">
                        <div className="space-y-1">
                            <h4 className="font-bold text-primary-900">Recording Live...</h4>
                            <p className="text-xs text-primary-600 font-bold uppercase tracking-widest animate-pulse">Stay clear of background noise</p>
                        </div>
                        <button 
                            onClick={stopRecording}
                            className="flex items-center gap-2 bg-white text-rose-600 px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-rose-50 transition-colors"
                        >
                            <Square size={16} fill="currentColor" /> Stop Session
                        </button>
                    </div>
                </div>
            )}

            {status === 'preview' && (
                <div className="w-full flex flex-col gap-6 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                            <Volume2 size={20} />
                        </div>
                        <audio src={previewUrl} controls className="flex-1 h-8" />
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={resetState}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            <RotateCcw size={16} /> Retake
                        </button>
                        <button 
                            onClick={submitAnswer}
                            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                        >
                             Submit <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;

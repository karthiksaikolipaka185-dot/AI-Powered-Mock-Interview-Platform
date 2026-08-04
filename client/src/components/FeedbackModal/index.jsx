import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../../services/feedbackService';

const FEATURE_OPTIONS = [
    'AI Interview',
    'Voice Interview',
    'Coding Challenge',
    'Feedback Report',
    'UI/UX',
    'Other'
];

const FeedbackModal = ({ isOpen, onClose, onSubmitSuccess, onMaybeLater, onNeverAskAgain }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [favoriteFeature, setFavoriteFeature] = useState('AI Interview');
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onMaybeLater();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onMaybeLater]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !favoriteFeature) {
            setError('Please provide a rating and select your favorite feature.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await submitFeedback({ rating, favoriteFeature, suggestion });
            setIsSubmitted(true);
            setTimeout(() => {
                onSubmitSuccess();
            }, 1800);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={onMaybeLater}
        >
            <div 
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onMaybeLater}
                    className="absolute top-5 right-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title="Close"
                >
                    <X size={20} />
                </button>

                {isSubmitted ? (
                    <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle size={36} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Thank You!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                            Your feedback has been submitted successfully. We appreciate your help in improving the platform!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="space-y-2 text-center pr-6">
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-center gap-2">
                                <span>⭐</span> We'd Love Your Feedback
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Congratulations on completing your first AI interview. Your feedback helps us improve the platform.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Question 1: Star Rating */}
                            <div className="space-y-2 text-center">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Overall Rating
                                </label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isFilled = (hoverRating || rating) >= star;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 text-amber-400 transition-transform active:scale-125 focus:outline-none"
                                            >
                                                <Star 
                                                    size={32} 
                                                    className={isFilled ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"} 
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Question 2: Favorite Feature */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Favorite Feature
                                </label>
                                <select
                                    value={favoriteFeature}
                                    onChange={(e) => setFavoriteFeature(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary-500 text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
                                >
                                    {FEATURE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question 3: Suggestions */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Suggestions
                                </label>
                                <textarea
                                    rows={3}
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                    placeholder="Tell us how we can improve."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary-500 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-all"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onMaybeLater}
                                        className="flex-1 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[1.5] py-3 bg-primary-600 text-white rounded-xl font-extrabold text-sm hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                                    >
                                        {loading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            'Submit Feedback'
                                        )}
                                    </button>
                                </div>

                                <div className="text-center pt-1">
                                    <button
                                        type="button"
                                        onClick={onNeverAskAgain}
                                        className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
                                    >
                                        Don't ask again
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;

import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { submitFeedback } from '../../services/feedbackService';

const CATEGORY_OPTIONS = [
    'General',
    'Interview',
    'Coding Playground',
    'Resume',
    'Skill Tracking',
    'Bug Report',
    'Feature Request',
    'Other'
];

const FeedbackModal = ({ 
    isOpen, 
    onClose, 
    pageContext = '', 
    onSubmitSuccess, 
    onMaybeLater, 
    onNeverAskAgain 
}) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('General');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleClose = onClose || onMaybeLater || (() => {});

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    // Reset form states when modal opens
    useEffect(() => {
        if (isOpen) {
            setRating(5);
            setHoverRating(0);
            setCategory('General');
            setMessage('');
            setError('');
            setIsSubmitted(false);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevent duplicate submission

        if (!rating || rating < 1 || rating > 5) {
            setError('Please provide a rating between 1 and 5 stars.');
            return;
        }

        if (!message.trim()) {
            setError('Please enter your feedback message.');
            return;
        }

        if (message.trim().length < 3) {
            setError('Feedback message must be at least 3 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await submitFeedback({
                rating,
                category,
                message: message.trim(),
                page: pageContext,
                favoriteFeature: category,
                suggestion: message.trim()
            });

            setIsSubmitted(true);
            setTimeout(() => {
                if (onSubmitSuccess) onSubmitSuccess();
                handleClose();
            }, 1800);
        } catch (err) {
            console.error('[FeedbackModal] Failed to submit feedback:', err);
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={handleClose}
        >
            <div 
                className="w-full max-w-md bg-card rounded-3xl border border-border-theme shadow-2xl p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-text-secondary hover:text-text-main p-1.5 rounded-full hover:bg-accent-theme transition-all"
                    title="Close"
                >
                    <X size={20} />
                </button>

                {isSubmitted ? (
                    <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle size={36} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-text-main">Thank You!</h3>
                        <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed font-medium">
                            Your feedback has been submitted successfully. We appreciate your input in making the platform better!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Header */}
                        <div className="space-y-1.5 text-center pr-6">
                            <h3 className="text-2xl font-extrabold text-text-main tracking-tight flex items-center justify-center gap-2">
                                <MessageSquare size={24} className="text-primary-theme" />
                                <span>Send Feedback</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                                Tell us about your experience, report issues, or suggest improvements.
                            </p>
                            {pageContext && (
                                <div className="inline-block mt-1 px-3 py-1 bg-accent-theme border border-border-theme rounded-full text-[11px] font-mono text-text-secondary">
                                    Context: <span className="font-bold text-primary-theme">{pageContext}</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Star Rating */}
                            <div className="space-y-1.5 text-center">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
                                    Rating
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
                                                    size={30} 
                                                    className={isFilled ? "fill-amber-400 text-amber-400" : "text-border-theme"} 
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-1">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-accent-theme border-2 border-border-theme rounded-xl p-3 outline-none focus:border-primary-theme text-sm font-semibold text-text-main transition-all cursor-pointer"
                                >
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
                                        Your Feedback
                                    </label>
                                    <span className="text-[10px] text-text-secondary font-mono">
                                        {message.length}/2000
                                    </span>
                                </div>
                                <textarea
                                    rows={3}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={2000}
                                    placeholder="Write your feedback, bug report, or feature request here..."
                                    className="w-full bg-accent-theme border-2 border-border-theme rounded-xl p-3 outline-none focus:border-primary-theme text-sm font-medium text-text-main placeholder-text-secondary/50 resize-none transition-all"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-1">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-3 border-2 border-border-theme rounded-xl font-bold text-sm text-text-secondary hover:bg-accent-theme transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[1.5] py-3 bg-primary-theme text-white rounded-xl font-extrabold text-sm hover:bg-primary-theme-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {loading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            'Submit Feedback'
                                        )}
                                    </button>
                                </div>

                                {onNeverAskAgain && (
                                    <div className="text-center pt-1">
                                        <button
                                            type="button"
                                            onClick={onNeverAskAgain}
                                            className="text-xs font-bold text-text-secondary hover:text-text-main underline transition-colors"
                                        >
                                            Don't ask again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;

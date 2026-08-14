import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import authService from '../../services/authService';
import FeedbackModal from '../FeedbackModal';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const user = authService.getCurrentUser();

    // Render floating feedback trigger button only for authenticated candidates/users
    if (!user) return null;

    return (
        <>
            {/* Floating Persistent Feedback Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-primary-theme text-white rounded-full shadow-2xl hover:bg-primary-theme-hover hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-extrabold border border-white/20 card-shadow group"
                title="Give Platform Feedback"
                aria-label="Open Feedback Dialog"
            >
                <MessageSquarePlus size={18} className="transition-transform group-hover:rotate-12" />
                <span>Feedback</span>
            </button>

            {/* Persistent Feedback Modal Dialog */}
            <FeedbackModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                pageContext={location.pathname}
                onSubmitSuccess={() => setIsOpen(false)}
            />
        </>
    );
};

export default FeedbackWidget;

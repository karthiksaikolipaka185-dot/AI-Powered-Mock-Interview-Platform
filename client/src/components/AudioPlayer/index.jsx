import React, { useEffect } from 'react';

const AudioPlayer = ({ audioBase64, onEnded }) => {
    useEffect(() => {
        if (!audioBase64) return;

        let audioUrl = '';
        let audioEl = null;

        try {
            // Convert base64 -> Blob sequentially mapping byte blocks safely
            const byteCharacters = atob(audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            // Assume widespread standard payload map from murf AI
            const blob = new Blob([byteArray], { type: 'audio/mp3' });
            
            // Create Object URL structurally mapping reference buffer uniquely
            audioUrl = URL.createObjectURL(blob);
            
            // Auto-play audio immediately firing bounds seamlessly
            audioEl = new Audio(audioUrl);
            audioEl.play().catch(e => console.warn('Browser auto-play strict limits blocked execution:', e));

            // On audio end call parent transitions natively matching workflow spec
            audioEl.onended = () => {
                if (onEnded) onEnded();
            };
        } catch (error) {
            console.error('AudioPlayer parsing resolution issue:', error);
            // Fire callback fallback so machine doesn't stick
            if (onEnded) onEnded();
        }

        // Cleanup: Revoke object URL (prevent memory leaks) and pause dynamically
        return () => {
            if (audioEl) {
                audioEl.pause();
                audioEl.onended = null;
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioBase64, onEnded]);

    // Component must return null (headless)
    return null;
};

export default AudioPlayer;

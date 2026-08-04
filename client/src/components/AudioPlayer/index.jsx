import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioBase64, audioKey, onEnded }) => {
    const audioRef = useRef(null);
    const objectUrlRef = useRef(null);
    const lastPlayedKeyRef = useRef(null);

    const cleanup = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
            } catch (e) {}
            audioRef.current = null;
        }
        if (objectUrlRef.current) {
            try {
                URL.revokeObjectURL(objectUrlRef.current);
            } catch (e) {}
            objectUrlRef.current = null;
        }
    };

    useEffect(() => {
        if (!audioBase64) return;

        const currentKey = audioKey || audioBase64.substring(0, 30);
        if (lastPlayedKeyRef.current === currentKey) {
            return;
        }

        lastPlayedKeyRef.current = currentKey;
        cleanup();

        try {
            const byteCharacters = atob(audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });
            
            const url = URL.createObjectURL(blob);
            objectUrlRef.current = url;
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.play().catch(e => console.warn('Browser auto-play strict limits blocked execution:', e));

            audio.onended = () => {
                if (onEnded) onEnded();
            };
        } catch (error) {
            console.error('AudioPlayer parsing resolution issue:', error);
            if (onEnded) onEnded();
        }

        return () => {
            cleanup();
        };
    }, [audioBase64, audioKey, onEnded]);

    return null;
};

export default AudioPlayer;

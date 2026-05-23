const mongoose = require('mongoose');
const Interview = require('../models/Interview.model');
const { startInterview, submitAnswer, submitCode, endInterview, getInterviewById } = require('../services/interview.service');
const { transcribeAudio } = require('../services/assemblyai.service');
const { streamAudio } = require('../services/murf.service');

const startInterviewController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, resumeText, totalQuestions } = req.body;

        // Debug Logs
        console.log("ID:", id);

        // 1. Validate ObjectId structure natively before database call
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or missing Interview ID in URL parameters' 
            });
        }

        // 2. Fetch safely checking for context existence
        const interview = await Interview.findById(id);
        console.log("Interview:", interview); // Log interview content

        // 3. Handle null record mapping
        if (!interview) {
            return res.status(404).json({ 
                success: false, 
                message: 'Interview session not found. Please re-upload your resume.' 
            });
        }

        if (!role) return res.status(400).json({ success: false, message: 'Role is required' });
        if (!resumeText) return res.status(400).json({ success: false, message: 'Resume text is required' });

        const userId = req.user.userId || req.user._id || req.user.id;
        const userName = req.user.name || 'Candidate';

        // 4. Proceed to AI generation service
        const interviewSession = await startInterview(id, userId, role, resumeText, userName, totalQuestions || 5);
        
        return res.status(200).json({
            success: true,
            data: interviewSession
        });
    } catch (error) {
        console.error('Error in startInterview controller:', error);
        // Include more detail in the message for production debugging
        const message = error.message || 'Internal server error initializing interview';
        return res.status(error.statusCode || 500).json({ 
            success: false, 
            message: message,
            detail: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
};

const submitTextAnswer = async (req, res, next) => {
    try {
        const { answer } = req.body;
        const { id } = req.params;
        const result = await submitAnswer(id, answer);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const submitVoiceAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            console.error('[VoiceSubmit] Missing audio file in request');
            return res.status(400).json({ success: false, message: 'Audio file required to transcribe and submit voice answer' });
        }
        
        console.log(`[VoiceSubmit] Received audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

        // Transcribe using AssemblyAI
        console.log('[VoiceSubmit] Starting transcription...');
        const transcribedText = await transcribeAudio(req.file.buffer, req.file.originalname);
        console.log(`[VoiceSubmit] Transcription result: "${transcribedText}"`);

        if (!transcribedText || transcribedText.trim() === '') {
            console.warn('[VoiceSubmit] Transcription returned empty text, skipping AI submission');
            return res.status(400).json({ success: false, message: 'Could not capture any speech. Please try again.' });
        }
        
        // Pass text to submitAnswer
        console.log('[VoiceSubmit] Sending transcribed text to AI engine...');
        const result = await submitAnswer(id, transcribedText);
        console.log('[VoiceSubmit] AI Response generated successfully');

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('[VoiceSubmit] Pipeline error:', error.message || error);
        next(error);
    }
};

const submitCodeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;
        const result = await submitCode(id, code, language);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const endInterviewController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user._id || req.user.id;
        const result = await endInterview(id, userId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getInterview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user._id || req.user.id;
        const interview = await getInterviewById(id, userId);
        return res.status(200).json({ success: true, data: interview });
    } catch (error) {
        next(error);
    }
};

const transcribeOnly = async (req, res, next) => {
    try {
        if (!req.file) {
            console.error('[TranscribeOnly] Missing audio file');
            return res.status(400).json({ success: false, message: 'Audio file required to transcribe.' });
        }
        
        console.log(`[TranscribeOnly] Received audio: ${req.file.originalname}`);
        const transcribedText = await transcribeAudio(req.file.buffer, req.file.originalname);
        console.log(`[TranscribeOnly] Transcription result: "${transcribedText}"`);

        // Return transcription without submitting
        return res.status(200).json({ 
            success: true, 
            data: { transcription: transcribedText } 
        });
    } catch (error) {
        console.error('[TranscribeOnly] Error:', error.message || error);
        next(error);
    }
};

const speakText = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text needed for Murf stream integration' });
        
        // Stream audio using Murf natively into res
        await streamAudio(text, res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startInterview: startInterviewController,
    submitTextAnswer,
    submitVoiceAnswer,
    submitCode: submitCodeController,
    endInterview: endInterviewController,
    getInterview,
    transcribeOnly,
    speakText
};

const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');

const parseResumePDF = async (pdfBuffer) => {
    try {
        console.log(`[parseResumePDF] Processing buffer of size: ${pdfBuffer.length} bytes`);
        const data = await pdfParse(pdfBuffer);
        const text = data.text ? data.text.trim() : '';
        console.log(`[parseResumePDF] Successfully extracted ${text.length} characters.`);
        if (text) return text;
    } catch (error) {
        console.warn('[parseResumePDF] pdf-parse warning, attempting text extraction fallback:', error.message);
    }

    // Fallback: extract clean text strings from buffer safely
    try {
        const rawString = pdfBuffer.toString('utf8');
        const cleanedText = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanedText.length > 10) {
            return cleanedText;
        }
    } catch (err) {
        console.warn('[parseResumePDF] Raw extraction failed:', err.message);
    }

    return 'Processed Candidate Resume Context';
};

const saveResume = async (userId, fileName, extractedText) => {
    try {
        // Use findOneAndUpdate with upsert: true
        console.log(`[saveResume] Saving resume for user: ${userId}, fileName: ${fileName}`);
        const savedResume = await Resume.findOneAndUpdate(
            { userId },
            { userId, fileName, extractedText },
            { new: true, upsert: true }
        );
        console.log(`[saveResume] Database save successful.`);
        return savedResume;
    } catch (error) {
        console.error('Error saving resume:', error);
        throw error;
    }
};

const getResumeByUserId = async (userId) => {
    try {
        // Retrieve resume for a given user
        return await Resume.findOne({ userId });
    } catch (error) {
        console.error('Error fetching resume by user ID:', error);
        throw error;
    }
};

module.exports = {
    parseResumePDF,
    saveResume,
    getResumeByUserId
};

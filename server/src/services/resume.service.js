const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');

const parseResumePDF = async (pdfBuffer) => {
    try {
        // Use classic pdf-parse function version 1.1.1
        console.log(`[parseResumePDF] Processing buffer of size: ${pdfBuffer.length} bytes`);
        const data = await pdfParse(pdfBuffer);
        
        // Extracted text is available on the .text property
        const text = data.text ? data.text.trim() : '';
        console.log(`[parseResumePDF] Successfully extracted ${text.length} characters.`);
        return text;
    } catch (error) {
        console.error('Error parsing PDF resume:', error);
        throw error;
    }
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

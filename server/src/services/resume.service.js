const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');

const parseResumePDF = async (pdfBuffer) => {
    try {
        // Use classic pdf-parse function version 1.1.1
        const data = await pdfParse(pdfBuffer);
        
        // Extracted text is available on the .text property
        return data.text ? data.text.trim() : '';
    } catch (error) {
        console.error('Error parsing PDF resume:', error);
        throw error;
    }
};

const saveResume = async (userId, fileName, extractedText) => {
    try {
        // Use findOneAndUpdate with upsert: true
        // This ensures each user has only ONE resume and re-upload overwrites existing resume
        const savedResume = await Resume.findOneAndUpdate(
            { userId },
            { userId, fileName, extractedText },
            { new: true, upsert: true }
        );
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

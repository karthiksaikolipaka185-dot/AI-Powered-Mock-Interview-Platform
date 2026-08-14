const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');
const { extractStructuredResumeData } = require('./resumeAnalysis.service');

const parseResumePDF = async (pdfBuffer) => {
    try {
        console.log(`[parseResumePDF] Processing buffer of size: ${pdfBuffer.length} bytes`);
        const data = await pdfParse(pdfBuffer);
        const text = data.text ? data.text.trim() : '';
        console.log(`[parseResumePDF] Successfully extracted ${text.length} characters.`);
        return text || 'No readable text extracted from PDF.';
    } catch (error) {
        console.error('Error parsing PDF resume:', error.message);
        const parseErr = new Error(error.message || 'Invalid or corrupted PDF file structure.');
        parseErr.statusCode = 400;
        throw parseErr;
    }
};

const saveResume = async (userId, fileName, extractedText) => {
    try {
        console.log(`[saveResume] Saving resume version for user: ${userId}, fileName: ${fileName}`);

        const validExtractedText = extractedText && extractedText.trim().length > 0
            ? extractedText.trim()
            : 'No readable text extracted from PDF.';

        // Extract structured resume data (work experience, projects, skills, verifiable claims)
        let parsedData = null;
        try {
            parsedData = await extractStructuredResumeData(validExtractedText);
            console.log(`[saveResume] Structured resume extraction successful. Projects found: ${parsedData?.projects?.length || 0}`);
        } catch (err) {
            console.error('[saveResume] Failed to extract structured resume data:', err.message);
        }

        if (!parsedData) {
            parsedData = {
                workExperience: [],
                projects: [],
                technicalSkills: [],
                verifiableClaims: []
            };
        }

        // Deactivate previous active resumes for this candidate
        await Resume.updateMany({ userId, isActive: true }, { isActive: false });

        // Save new versioned Resume document
        const newResume = new Resume({
            userId,
            fileName,
            extractedText: validExtractedText,
            parsedData,
            isActive: true
        });
        await newResume.save();

        console.log(`[saveResume] Database save successful. New Resume ID: ${newResume._id}`);
        return newResume;
    } catch (error) {
        console.error('Error saving resume:', error);
        throw error;
    }
};

const getResumeByUserId = async (userId) => {
    try {
        return await Resume.findOne({ userId, isActive: true }).sort({ createdAt: -1 }) || await Resume.findOne({ userId }).sort({ createdAt: -1 });
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

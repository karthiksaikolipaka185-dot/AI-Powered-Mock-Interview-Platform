const { parseResumePDF, saveResume, getResumeByUserId } = require('../services/resume.service');
const Interview = require('../models/Interview.model');

const uploadResume = async (req, res, next) => {
    try {
        // Debug Verification
        console.log('--- Upload Progress ---');
        console.log('req.file present:', !!req.file);
        if (req.file) {
            console.log('Original Name:', req.file.originalname);
            console.log('Buffer size:', req.file.buffer ? req.file.buffer.length : 'MISSING');
        }

        // Validate if file exists
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded or buffer is empty. Ensure field name is 'resume'." 
            });
        }

        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ success: false, message: "Target role is required for context." });
        }

        const userId = req.user?.userId || req.user?._id || req.user?.id || req.userId;
        const fileName = req.file.originalname;

        // Extract text from the PDF buffer
        const extractedText = await parseResumePDF(req.file.buffer);

        // Store the extracted text and file details in database
        const savedResume = await saveResume(userId, fileName, extractedText);

        // Create an initial shell for the Interview
        // This generates the interviewId (ObjectId) that we will use in the next step
        const newInterview = await Interview.create({
            userId,
            role,
            questions: [], // Initially empty, populated during /start
            status: 'active' // Set as active to allow updates
        });

        // Send successful response with required format
        return res.status(200).json({
            success: true,
            text: extractedText,
            fileName: savedResume.fileName,
            interviewId: newInterview._id
        });
    } catch (error) {
        console.error('Error in uploadResume controller:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error during PDF parsing',
            detail: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
};

const getResume = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?._id || req.user?.id || req.userId;
        
        // Fetch resume using userId
        const resume = await getResumeByUserId(userId);
        
        if (!resume) {
            return res.status(404).json({ message: "No resume found for this user." });
        }

        // Return stored resume data
        return res.status(200).json(resume);
    } catch (error) {
        console.error('Error in getResume controller:', error);
        next(error);
    }
};

module.exports = {
    uploadResume,
    getResume
};

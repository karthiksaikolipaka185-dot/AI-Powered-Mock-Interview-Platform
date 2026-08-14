const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter to allow PDF (resumes) and Audio (voice answers)
const fileFilter = (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf' || 
                      file.mimetype === 'application/x-pdf' || 
                      file.mimetype === 'application/vnd.pdf' || 
                      file.mimetype === 'application/octet-stream';
    const isPdfExt = file.originalname && file.originalname.toLowerCase().endsWith('.pdf');
    const isAudio = file.mimetype && file.mimetype.startsWith('audio/');

    if (isPdfMime || isPdfExt || isAudio) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type! Only PDF and Audio files are allowed.'), false);
    }
};

// Create multer instance
const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Increased to 10MB for longer audio sessions
    }
});

// Middleware specifically for 'resume' field
const uploadResume = upload.single('resume');

// Middleware specifically for 'file' field in voice sessions
const uploadAudio = upload.single('file'); 

module.exports = {
    upload,
    uploadResume,
    uploadAudio
};

const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const { uploadAudio } = require('../middlewares/multer.middleware');
const {
    startInterview,
    submitTextAnswer,
    submitVoiceAnswer,
    runCode,
    submitCode,
    endInterview,
    getInterview,
    transcribeOnly,
    speakText
} = require('../controllers/interview.controller');

const router = express.Router();

// All routes use authentication middleware
router.use(authenticate);

// 1. POST /transcribe (defined BEFORE ID routes to avoid /transcribe parsed as ID)
// Use uploadAudio for 'file' field parsing
router.post('/transcribe', uploadAudio, transcribeOnly);

// 2. POST /start/:id
router.post('/start/:id', startInterview);

// 8. POST /speak (defined before ID explicitly just in case)
router.post('/speak', speakText);

// 3. POST /:id/answer (text)
router.post('/:id/answer', submitTextAnswer);

// 4. POST /:id/voice-answer
// Use uploadAudio for 'file' field parsing
router.post('/:id/voice-answer', uploadAudio, submitVoiceAnswer);

// 5. POST /:id/code/run (Run code against public test cases)
router.post('/:id/code/run', runCode);

// 6. POST /:id/code/submit (Submit code against public + hidden test cases)
router.post('/:id/code/submit', submitCode);
router.post('/:id/code', submitCode); // Fallback mapping for legacy endpoint

// 7. POST /:id/end
router.post('/:id/end', endInterview);

// 8. GET /:id
router.get('/:id', getInterview);

module.exports = router;

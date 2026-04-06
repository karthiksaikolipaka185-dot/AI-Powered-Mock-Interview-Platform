const { AssemblyAI } = require('assemblyai');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize client: Use ASSEMBLYAI_API_KEY from environment variables
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY
});

const transcribeAudio = async (audioBuffer, originalName) => {
    // Determine file extension
    let ext = path.extname(originalName || '');
    if (!ext) {
        ext = '.webm';
    }

    // Create temporary file path
    const tempFileName = `audio_${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
        // Save buffer to temp file using fs
        await fs.promises.writeFile(tempFilePath, audioBuffer);

        // Send file to AssemblyAI with mandatory speech_models list
        const transcript = await client.transcripts.transcribe({ 
            audio: tempFilePath,
            speech_models: ["universal-3-pro", "universal-2"]
        });

        // Extract transcription text
        return transcript.text;
    } catch (error) {
        // Handle API errors gracefully
        console.error('Application Error: AssemblyAI transcription failed:', error.message || error);
        throw error;
    } finally {
        // Cleanup: Delete temp file after processing (success or failure)
        try {
            if (fs.existsSync(tempFilePath)) {
                await fs.promises.unlink(tempFilePath);
            }
        } catch (cleanupError) {
            console.error('Application Error: Failed to clean up temp audio file:', cleanupError.message || cleanupError);
        }
    }
};

module.exports = {
    transcribeAudio
};

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

        // Send file to AssemblyAI with retry logic
        let transcript;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                transcript = await client.transcripts.transcribe({ 
                    audio: tempFilePath,
                    speech_models: ["universal-3-pro", "universal-2"]
                });
                break; // Success!
            } catch (err) {
                attempts++;
                console.warn(`[AssemblyAI] Attempt ${attempts} failed:`, err.message);
                if (attempts >= maxAttempts) throw err;
                // Wait 1s before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Extract transcription text
        return transcript.text;
    } catch (error) {
        // Handle API errors gracefully
        console.error('Application Error: AssemblyAI transcription failed after retries:', error.message || error);
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

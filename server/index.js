require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./src/config/db.config');
const { validateEnvironmentVariables, checkServicesStatus } = require('./src/services/startup.service');
const { verifyTransporter } = require('./src/services/email.service');
const rootRoutes = require('./src/routes/index');
const { notFoundHandler, errorHandler } = require('./src/middlewares/error.middleware');

const app = express();

// Enable CORS for production & local development
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://ai-powered-mock-interview-platform-ten.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Render health check route to prevent Route not found errors
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: "AI Powered Mock Interview Backend",
    status: "Running"
  });
});

// Register base routes securely mapping /api boundaries implicitly
app.use('/api', rootRoutes);

// 404 Logic & Global Error protection
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Perform startup sequence:
 * 1. Validate environment variables
 * 2. Connect to MongoDB (Do NOT continue if MongoDB connection fails)
 * 3. Audit service statuses and print startup logs
 * 4. Start HTTP Server
 */
const startServer = async () => {
    try {
        // Step 1 & 2: Environment verification
        validateEnvironmentVariables();

        // Step 1: Connect to MongoDB
        await connectDB();

        // Step 8: Check and log service status
        checkServicesStatus();

        // Verify email transporter connection on startup
        await verifyTransporter();

        app.listen(PORT, () => {
            console.log(`Server actively running on port ${PORT}`);
        });
    } catch (error) {
        console.error('\n====================================================');
        console.error('FATAL STARTUP ERROR: Server failed to initialize!');
        console.error('Error Details:', error.message);
        console.error('====================================================\n');
        process.exit(1);
    }
};

startServer();

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import unified routing index logically built in prior steps
const rootRoutes = require('./src/routes/index');

const app = express();

// Enable CORS for production (allowing all origins temporarily)
// TODO: Replace "*" with actual Vercel domain after deployment (e.g., origin: "https://your-frontend.vercel.app")
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://ai-powered-mock-interview-platform-ten.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
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

// Database connection dynamically leveraging environmental overrides
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const { notFoundHandler, errorHandler } = require('./src/middlewares/error.middleware');

// Register base routes securely mapping /api boundaries implicitly
app.use('/api', rootRoutes);

// 404 Logic & Global Error protection
app.use(notFoundHandler);
app.use(errorHandler);

// Port mapping executions
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server actively iterating native commands on port ${PORT}`);
});

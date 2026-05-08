require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import unified routing index logically built in prior steps
const rootRoutes = require('./src/routes/index');

const app = express();

// Enable CORS for production (allowing all origins temporarily)
// TODO: Replace "*" with actual Vercel domain after deployment (e.g., origin: "https://your-frontend.vercel.app")
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
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

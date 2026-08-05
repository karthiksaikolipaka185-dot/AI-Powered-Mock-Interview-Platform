const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Configure DNS servers for Node.js to resolve SRV records on Windows networks reliably
 */
// try {
//     dns.setServers(['8.8.8.8', '1.1.1.1']);
// } catch (err) {
//     console.warn('[DB Config] DNS setServers warning:', err.message);
// }

/**
 * Connect to MongoDB instance safely and return connection state
 */
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        throw new Error('MONGODB_URI is missing from environment variables (.env).');
    }

    mongoose.set('strictQuery', false);

    const options = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    };

    try {
        await mongoose.connect(mongoUri, options);
        return mongoose.connection;
    } catch (error) {
        console.error('CRITICAL ERROR: Failed to connect to MongoDB.');
        console.error('Reason:', error.message);
        throw error;
    }
};

module.exports = { connectDB };

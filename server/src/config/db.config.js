const mongoose = require('mongoose');
const dns = require('dns');

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB instance safely and return connection state
 */
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        throw new Error('MONGODB_URI is missing from environment variables (.env).');
    }

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Set fallback public DNS servers for Windows Node.js querySrv issues
        try {
            dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        } catch (e) {
            console.warn('Could not set custom DNS servers:', e.message);
        }

        mongoose.set('strictQuery', false);

        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        };

        cached.promise = mongoose.connect(mongoUri, options).then((m) => m.connection);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error('CRITICAL ERROR: Failed to connect to MongoDB.');
        console.error('Reason:', error.message);
        throw error;
    }
};

module.exports = { connectDB };

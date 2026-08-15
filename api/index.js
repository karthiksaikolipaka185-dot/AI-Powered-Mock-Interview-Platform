const app = require('../server/index');
const { connectDB } = require('../server/src/config/db.config');

module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (error) {
        console.error('[Vercel Serverless] Database connection error:', error.message);
    }
    return app(req, res);
};

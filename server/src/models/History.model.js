const mongoose = require('mongoose');
const Interview = require('./Interview.model');

// History aliases/uses the Interview schema for session records
const historySchema = Interview.schema;

const History = mongoose.models.History || mongoose.model('History', historySchema);

module.exports = History;

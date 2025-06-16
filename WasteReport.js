const mongoose = require('mongoose');

const wasteReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['reported', 'in_progress', 'resolved'], default: 'reported' }
}, { timestamps: true });

module.exports = mongoose.model('WasteReport', wasteReportSchema);
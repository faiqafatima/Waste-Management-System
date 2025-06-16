const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ['pending', 'scheduled', 'completed'], default: 'pending' },
    scheduledDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
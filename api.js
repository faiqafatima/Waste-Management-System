const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');
const WasteReport = require('../models/WasteReport');

// Request Pickup
router.post('/pickup', authMiddleware, async (req, res) => {
    const { address } = req.body;
    try {
        const pickupRequest = new PickupRequest({
            userId: req.user.id,
            address
        });
        await pickupRequest.save();
        res.json({ message: 'Thank you! Your garbage pickup request has been received.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Report Waste
router.post('/report-waste', authMiddleware, async (req, res) => {
    const { description, location } = req.body;
    try {
        const wasteReport = new WasteReport({
            userId: req.user.id,
            description,
            location
        });
        await wasteReport.save();
        res.json({ message: 'Waste reported successfully! Our team will handle it soon.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
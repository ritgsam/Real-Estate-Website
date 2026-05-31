const express = require('express');
const inquiryController = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { inquirySchema } = require('../validators/inquiry.validator');

const router = express.Router();

// Submit a new inquiry (Public endpoint)
router.post('/', validate(inquirySchema), inquiryController.createInquiry);

// Retrieve leads received (Protected endpoint - only for owners and agents)
router.get('/owner', protect, restrictTo('OWNER', 'AGENT'), inquiryController.getInquiriesForOwner);

module.exports = router;

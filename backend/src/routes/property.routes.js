const express = require('express');
const propertyController = require('../controllers/property.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { propertySchema } = require('../validators/property.validator');

const router = express.Router();

// Public routes
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.get('/:id/similar', propertyController.getSimilarProperties);

// Protected routes (Only owners/agents can create/edit/delete properties)
router.post(
  '/', 
  protect, 
  restrictTo('OWNER', 'AGENT'), 
  validate(propertySchema), 
  propertyController.createProperty
);

router.patch(
  '/:id', 
  protect, 
  restrictTo('OWNER', 'AGENT'), 
  validate(propertySchema.partial()), // Use Zod's partial schema for partial updates
  propertyController.updateProperty
);

router.delete(
  '/:id', 
  protect, 
  restrictTo('OWNER', 'AGENT'), 
  propertyController.deleteProperty
);

module.exports = router;

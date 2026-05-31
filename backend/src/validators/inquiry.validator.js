const { z } = require('zod');

const inquirySchema = z.object({
  propertyId: z.string().uuid('Invalid property ID format'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 characters long'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters long')
});

module.exports = {
  inquirySchema
};

const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters long'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters long'),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be a positive number')),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'PLOT']),
  bedrooms: z.preprocess((val) => Number(val), z.number().int().nonnegative('Bedrooms cannot be negative')),
  bathrooms: z.preprocess((val) => Number(val), z.number().int().nonnegative('Bathrooms cannot be negative')),
  area: z.preprocess((val) => Number(val), z.number().positive('Area must be a positive number')),
  city: z.string().trim().min(2, 'City is required'),
  location: z.string().trim().min(5, 'Detailed location/address is required'),
  images: z.array(z.string().url('Invalid image URL')).optional().default([])
});

module.exports = {
  propertySchema
};

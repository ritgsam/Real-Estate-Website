require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/error');

// Route Imports
const authRouter = require('./routes/auth.routes');
const propertyRouter = require('./routes/property.routes');
const inquiryRouter = require('./routes/inquiry.routes');

const app = express();

// Global Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// General Rate Limiter (Protects server from brute force / DOS)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// Specific Rate Limiter for Inquiries (Spam Prevention)
// Max 5 submissions per hour per IP address
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, 
  message: {
    success: false,
    message: 'Too many inquiries submitted from this IP. Please wait an hour before submitting again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Swagger UI Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate Platform API is running. Documentation is available at /api-docs'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/inquiries', inquiryLimiter, inquiryRouter); // Apply strict rate limit to inquiry submissions

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Swagger] Documentation available at http://localhost:${PORT}/api-docs`);
});
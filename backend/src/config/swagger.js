const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API Documentation',
      version: '1.0.0',
      description: 'REST API documentation for the Fullstack Real Estate listing platform (99acres / NoBroker clone). Includes token-based authentication (JWT + Refresh rotation), properties management (CRUD + fast index search), inquiries, and similarity recommendation algorithms.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your JWT access token (received from login/register) to access protected routes.'
        }
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Your Full name' },
            email: { type: 'string', format: 'email', example: 'yourname@gmail.com' },
            password: { type: 'string', format: 'password', example: 'securePassword123' },
            role: { type: 'string', enum: ['BUYER', 'OWNER', 'AGENT'], default: 'BUYER' }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'owner1@realestate.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        PropertyInput: {
          type: 'object',
          required: ['title', 'description', 'price', 'type', 'bedrooms', 'bathrooms', 'area', 'city', 'location'],
          properties: {
            title: { type: 'string', example: 'Luxurious 3 BHK Penthouse' },
            description: { type: 'string', example: 'Stunning penthouse with panoramic city views, modern kitchen, and private terrace.' },
            price: { type: 'number', example: 7500000 },
            type: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT'], example: 'APARTMENT' },
            bedrooms: { type: 'integer', example: 3 },
            bathrooms: { type: 'integer', example: 3 },
            area: { type: 'number', example: 1800, description: 'Area in square feet' },
            city: { type: 'string', example: 'Bangalore' },
            location: { type: 'string', example: 'Indiranagar, near Metro Station' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
              ]
            }
          }
        },
        InquiryInput: {
          type: 'object',
          required: ['propertyId', 'name', 'email', 'phone', 'message'],
          properties: {
            propertyId: { type: 'string', format: 'uuid', example: 'e4d7a8b6-93d4-4a49-9f7a-8ef0d8a572a1' },
            name: { type: 'string', example: 'Jane Buyer' },
            email: { type: 'string', format: 'email', example: 'jane@buyer.com' },
            phone: { type: 'string', example: '9876543210' },
            message: { type: 'string', example: 'I am interested in this listing. Please let me know when we can schedule a visit.' }
          }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } }
            }
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Email already exists or validation error' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Log in an existing user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } }
            }
          },
          responses: {
            200: { description: 'Login successful, returns token in body and cookie' },
            401: { description: 'Invalid email or password' }
          }
        }
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refresh access token (JWT Rotation)',
          tags: ['Authentication'],
          requestBody: {
            required: false,
            description: 'Can pass refreshToken in body, otherwise cookie is read automatically',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { refreshToken: { type: 'string' } }
                }
              }
            }
          },
          responses: {
            200: { description: 'New access token and refresh token generated' },
            401: { description: 'Invalid or expired refresh token' }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          summary: 'Log out a user and invalidate refresh tokens',
          tags: ['Authentication'],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { refreshToken: { type: 'string' } }
                }
              }
            }
          },
          responses: {
            200: { description: 'Logout successful' }
          }
        }
      },
      '/api/properties': {
        get: {
          summary: 'Search & filter properties (Supports 50k+ records)',
          tags: ['Properties'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Text search on title, description, and location' },
            { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by exact city name' },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT'] }, description: 'Filter by type' },
            { name: 'bedrooms', in: 'query', schema: { type: 'integer' }, description: 'Filter by exact bedroom count' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum price filter' },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum price filter' },
            { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' }, description: 'Field to sort by (price, createdAt, area)' },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sorting order' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 }, description: 'Number of results to return' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for offset pagination' },
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'ID of the last item for scalable keyset cursor pagination' }
          ],
          responses: {
            200: { description: 'List of matching properties' }
          }
        },
        post: {
          summary: 'Create a property listing (Owners/Agents only)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } }
            }
          },
          responses: {
            201: { description: 'Property created' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not OWNER or AGENT)' }
          }
        }
      },
      '/api/properties/{id}': {
        get: {
          summary: 'Get details of a property listing',
          tags: ['Properties'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Property detail data' },
            404: { description: 'Property not found' }
          }
        },
        patch: {
          summary: 'Update a property listing (Owner only)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } // Zod partial validation allows omitting fields
            }
          },
          responses: {
            200: { description: 'Property updated' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not the listing owner)' },
            404: { description: 'Property not found' }
          }
        },
        delete: {
          summary: 'Delete a property listing (Owner only)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Property deleted' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not the listing owner)' },
            404: { description: 'Property not found' }
          }
        }
      },
      '/api/properties/{id}/similar': {
        get: {
          summary: 'Get similar property recommendations (Same City, Type, Price range +/-25% with fallbacks)',
          tags: ['Properties'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'List of similar properties' },
            404: { description: 'Property not found' }
          }
        }
      },
      '/api/inquiries': {
        post: {
          summary: 'Submit an inquiry for a property (Anti-spam rate limited)',
          tags: ['Inquiries'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryInput' } }
            }
          },
          responses: {
            201: { description: 'Inquiry submitted' },
            400: { description: 'Duplicate submission in last 24h or validation failure' },
            429: { description: 'Too many inquiries (rate limited)' }
          }
        }
      },
      '/api/inquiries/owner': {
        get: {
          summary: 'Get inquiries received for properties owned by current user (Owners only)',
          tags: ['Inquiries'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of leads/inquiries' },
            401: { description: 'Unauthorized' }
          }
        }
      }
    }
  },
  apis: [] // Explicitly predefined in paths above for robustness
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;

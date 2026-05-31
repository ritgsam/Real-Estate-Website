const prisma = require('../config/db');

// Create Property
const createProperty = async (req, res, next) => {
  try {
    const { title, description, price, type, bedrooms, bathrooms, area, city, location, images } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price,
        type,
        bedrooms,
        bathrooms,
        area,
        city,
        location,
        images,
        ownerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully',
      property
    });
  } catch (err) {
    next(err);
  }
};

// Get All Properties (Search, Filter, Paginate, Sort)
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      type,
      bedrooms,
      minPrice,
      maxPrice,
      ownerId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 12,
      page = 1,
      cursor
    } = req.query;

    const limitNumber = Math.min(100, parseInt(limit) || 12);
    const queryConditions = {};

    if (ownerId) {
      queryConditions.ownerId = ownerId;
    }

    // 1. Text Search Filter (on title/description/location)
    if (search) {
      queryConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 2. Exact City Filter (Indexed)
    if (city) {
      queryConditions.city = { equals: city, mode: 'insensitive' };
    }

    // 3. Property Type Filter (Indexed)
    if (type) {
      queryConditions.type = type;
    }

    // 4. Bedrooms Filter (Indexed)
    if (bedrooms) {
      queryConditions.bedrooms = parseInt(bedrooms);
    }

    // 5. Budget Range Filter (Indexed)
    if (minPrice || maxPrice) {
      queryConditions.price = {};
      if (minPrice) {
        queryConditions.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        queryConditions.price.lte = parseFloat(maxPrice);
      }
    }

    // Pagination Strategy
    let properties;
    let totalCount = 0;
    let nextCursor = null;

    if (cursor) {
      // Keyset / Cursor Pagination (Highly scalable for 50,000+ records)
      properties = await prisma.property.findMany({
        where: queryConditions,
        take: limitNumber + 1, // Get 1 extra item to check if there is a next page
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
        orderBy: { id: 'asc' } // Stable cursor sorting
      });

      const hasNextPage = properties.length > limitNumber;
      if (hasNextPage) {
        properties.pop(); // Remove the extra item
        nextCursor = properties[properties.length - 1].id;
      }
    } else {
      // Offset-based pagination with total count (good for standard search results)
      const pageNumber = parseInt(page) || 1;
      const skip = (pageNumber - 1) * limitNumber;

      // Count total matches (using indexes)
      totalCount = await prisma.property.count({ where: queryConditions });

      properties = await prisma.property.findMany({
        where: queryConditions,
        take: limitNumber,
        skip,
        orderBy: { [sortBy]: sortOrder }
      });
    }

    res.status(200).json({
      success: true,
      data: properties,
      pagination: cursor 
        ? { nextCursor }
        : {
            total: totalCount,
            page: parseInt(page) || 1,
            limit: limitNumber,
            totalPages: Math.ceil(totalCount / limitNumber)
          }
    });
  } catch (err) {
    next(err);
  }
};

// Get Property Details
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (err) {
    next(err);
  }
};

// Update Property (Ownership verification required)
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, type, bedrooms, bathrooms, area, city, location, images } = req.body;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Verify ownership (or allow Admin)
    if (property.ownerId !== req.user.id && req.user.role !== 'AGENT') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        price,
        type,
        bedrooms,
        bathrooms,
        area,
        city,
        location,
        images
      }
    });

    res.status(200).json({
      success: true,
      message: 'Property listing updated successfully',
      property: updatedProperty
    });
  } catch (err) {
    next(err);
  }
};

// Delete Property (Ownership verification required)
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Verify ownership
    if (property.ownerId !== req.user.id && req.user.role !== 'AGENT') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing'
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get Similar Properties
const getSimilarProperties = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Algorithm parameters: Same city, same type, +/- 25% price range
    const minPrice = property.price * 0.75;
    const maxPrice = property.price * 1.25;

    let similarProperties = await prisma.property.findMany({
      where: {
        id: { not: id },
        city: { equals: property.city, mode: 'insensitive' },
        type: property.type,
        price: { gte: minPrice, lte: maxPrice }
      },
      take: 6,
      orderBy: { price: 'asc' }
    });

    // Smart Backfill Strategy: If not enough matches, relax criteria (remove price range restriction)
    if (similarProperties.length < 4) {
      const existingIds = [property.id, ...similarProperties.map(p => p.id)];
      const backfill = await prisma.property.findMany({
        where: {
          id: { notIn: existingIds },
          city: { equals: property.city, mode: 'insensitive' },
          type: property.type
        },
        take: 6 - similarProperties.length,
        orderBy: { createdAt: 'desc' }
      });
      similarProperties = [...similarProperties, ...backfill];
    }

    // If still not enough, relax type restriction (just same city)
    if (similarProperties.length < 4) {
      const existingIds = [property.id, ...similarProperties.map(p => p.id)];
      const backfillCity = await prisma.property.findMany({
        where: {
          id: { notIn: existingIds },
          city: { equals: property.city, mode: 'insensitive' }
        },
        take: 6 - similarProperties.length,
        orderBy: { createdAt: 'desc' }
      });
      similarProperties = [...similarProperties, ...backfillCity];
    }

    res.status(200).json({
      success: true,
      data: similarProperties
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getSimilarProperties
};

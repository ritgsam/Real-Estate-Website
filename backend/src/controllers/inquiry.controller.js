const prisma = require('../config/db');

const createInquiry = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Prevent duplicate inquiries: check if same email has sent an inquiry on this property in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const duplicateCheck = await prisma.inquiry.findFirst({
      where: {
        propertyId,
        email: { equals: email, mode: 'insensitive' },
        createdAt: { gte: oneDayAgo }
      }
    });

    if (duplicateCheck) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an inquiry for this property within the last 24 hours.'
      });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        buyerId: req.user ? req.user.id : null, // Link user account if authenticated
        name,
        email,
        phone,
        message,
        ipAddress
      }
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. The property owner will contact you shortly.',
      inquiry
    });
  } catch (err) {
    next(err);
  }
};

const getInquiriesForOwner = async (req, res, next) => {
  try {
    // Only return inquiries for properties that belong to the logged-in owner
    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          ownerId: req.user.id
        }
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInquiry,
  getInquiriesForOwner
};

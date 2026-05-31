const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

const NEIGHBORHOODS = {
  Mumbai: ['Bandra', 'Andheri West', 'Juhu', 'Colaba', 'Powai', 'Worli'],
  Bangalore: ['Whitefield', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Jayanagar', 'Yelahanka'],
  Delhi: ['Connaught Place', 'Saket', 'Vasant Kunj', 'Greater Kailash', 'Dwarka', 'Rohini'],
  Pune: ['Koregaon Park', 'Kothrud', 'Baner', 'Viman Nagar', 'Hadapsar', 'Wakadi'],
  Hyderabad: ['Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kondapur', 'Begumpet'],
  Chennai: ['Adyar', 'T. Nagar', 'Velachery', 'Mylapore', 'Anna Nagar', 'OMR']
};

const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT'];

const TITLES = {
  APARTMENT: [
    'Modern Luxury Apartment', 'Spacious 2BHK Flat near Metro', 'Sun-drenched Penthouse', 
    'Cozy Studio in City Center', 'Premium High-rise Apartment', 'Scenic View 3BHK Apartment'
  ],
  HOUSE: [
    'Elegant Family House', 'Spacious Independent House', 'Beautiful House with Garden', 
    'Charming Duplex Home', 'Contemporary 3 BHK Row House', 'Traditional Style House'
  ],
  VILLA: [
    'Ultra-Luxury Villa with Pool', 'Spacious 4BHK Private Villa', 'Exquisite Mediterranean Villa', 
    'Gated Community Villa', 'Modern Smart Villa', 'Serene Heritage Villa'
  ],
  PLOT: [
    'Prime Residential Plot', 'Corner Plot in Gated Layout', 'Industrial Plot near Highway', 
    'Scenic Hill View Land', 'Premium Investment Plot', 'Spacious Commercial Plot'
  ]
};

const IMAGES = {
  APARTMENT: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'
  ],
  HOUSE: [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60'
  ],
  VILLA: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60'
  ],
  PLOT: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60'
  ]
};

async function main() {
  console.log('Starting Database Seeding...');

  // Clean old data
  console.log('Cleaning old records...');
  await prisma.inquiry.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  console.log('Seeding users (owners and buyers)...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const owners = [];
  for (let i = 1; i <= 5; i++) {
    const owner = await prisma.user.create({
      data: {
        email: `owner${i}@realestate.com`,
        name: `Owner Name ${i}`,
        password: passwordHash,
        role: 'OWNER'
      }
    });
    owners.push(owner);
  }

  const buyers = [];
  for (let i = 1; i <= 5; i++) {
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@realestate.com`,
        name: `Buyer Name ${i}`,
        password: passwordHash,
        role: 'BUYER'
      }
    });
    buyers.push(buyer);
  }

  console.log(`Successfully seeded ${owners.length} owners and ${buyers.length} buyers.`);

  // Seed Properties (50,000 records)
  const TOTAL_PROPERTIES = 50050;
  const BATCH_SIZE = 10000;
  console.log(`Generating and inserting ${TOTAL_PROPERTIES} property records in batches of ${BATCH_SIZE}...`);

  let insertedCount = 0;
  
  while (insertedCount < TOTAL_PROPERTIES) {
    const propertiesToInsert = [];
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_PROPERTIES - insertedCount);

    for (let i = 0; i < currentBatchSize; i++) {
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const neighborhoods = NEIGHBORHOODS[city];
      const location = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      const owner = owners[Math.floor(Math.random() * owners.length)];
      
      const titleTemplate = TITLES[type][Math.floor(Math.random() * TITLES[type].length)];
      const title = `${titleTemplate} in ${location}, ${city}`;

      let price = 0;
      let bedrooms = 0;
      let bathrooms = 0;
      let area = 0;

      if (type === 'PLOT') {
        price = Math.floor(Math.random() * 50 + 10) * 100000; // 10L to 60L
        area = Math.floor(Math.random() * 4000 + 800); // 800 to 4800 sqft
      } else if (type === 'APARTMENT') {
        bedrooms = Math.floor(Math.random() * 4) + 1; // 1 to 4 BHK
        bathrooms = Math.max(1, bedrooms - (Math.random() > 0.7 ? 1 : 0));
        area = bedrooms * 600 + Math.floor(Math.random() * 300); // 600 to 2700 sqft
        price = bedrooms * (Math.floor(Math.random() * 30 + 15) * 100000); // 15L to 45L per bedroom
      } else if (type === 'HOUSE' || type === 'VILLA') {
        bedrooms = Math.floor(Math.random() * 3) + 3; // 3 to 5 BHK
        bathrooms = bedrooms - (Math.random() > 0.5 ? 1 : 0);
        area = bedrooms * 800 + Math.floor(Math.random() * 500); // 2400 to 4500 sqft
        const baseMultiplier = type === 'VILLA' ? 400000 : 250000;
        price = bedrooms * (Math.floor(Math.random() * 50 + 30) * baseMultiplier); 
      }

      // Generate a date within the last 12 months
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
      date.setDate(date.getDate() - Math.floor(Math.random() * 28));

      propertiesToInsert.push({
        id: crypto.randomUUID(),
        title,
        description: `This is a premium ${type.toLowerCase()} located at the heart of ${location}, ${city}. Excellent connectivity, standard amenities, and robust architecture make this an ideal choice for buyers looking for comfort and luxury. Features include close proximity to supermarkets, hospitals, and schools.`,
        price,
        type,
        bedrooms,
        bathrooms,
        area,
        city,
        location: `${location}, near main market, ${city}`,
        images: IMAGES[type],
        ownerId: owner.id,
        createdAt: date,
        updatedAt: date
      });
    }

    await prisma.property.createMany({
      data: propertiesToInsert
    });

    insertedCount += currentBatchSize;
    console.log(`Inserted ${insertedCount}/${TOTAL_PROPERTIES} properties...`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

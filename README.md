 Backend Setup

cd backend

npm install

Create .env:

DATABASE_URL=postgresql://username:password@localhost:5432/db-name
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

Then run:

npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev


| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner** | `owner1@realestate.com` | `password123` |
| **Owner** | `owner2@realestate.com` | `password123` |
| **Buyer** | `buyer1@realestate.com` | `password123` |


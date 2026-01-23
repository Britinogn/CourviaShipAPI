# CourviaShip Server (CourviaShip API)

Backend API service for the CourviaShip / NovaSend platform, built with Node.js, Express, and TypeScript. This service handles user authentication, shipment management, and courier tracking.

## Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Caching**: [Redis](https://redis.io/) (via ioredis and Upstash)
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Cloudinary (via multer-storage-cloudinary) for file uploads
- **Email**: Nodemailer for email notifications
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or MongoDB Atlas)
- Redis instance (local or hosted)
- Cloudinary account for file storage
- Email service configuration

## Installation & Setup

1. **Clone the repository** (if not already done).

2. **Navigate to the server directory**:

   ```bash
   cd server
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Create a `.env` file** in the server directory with your configuration values.

5. **Start MongoDB and Redis** (or use Docker Compose).

## Running the Application

### Development Mode

Runs the server with hot-reloading using `nodemon` and `ts-node`.

```bash
npm run dev
```

### Production Build

Transpile TypeScript to JavaScript in the `dist` folder.

```bash
npm run build
```

### Start Production Server

Runs the compiled JavaScript entry file.

```bash
npm start
```

### Docker

Run the application using Docker Compose:

```bash
docker-compose up
```

## API Endpoints

### Health Check

- `GET /` - API running message
- `GET /health` - Check API status, timestamp, and DB connection
- `GET /api/health` - API status check
- `GET /ping` - Simple ping endpoint

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and receive JWT token

### Shipments (`/api/shipments`)

- `POST /api/shipments` - Create a new shipment (public)
- `GET /api/shipments` - Get all shipments (requires authentication)
- `GET /api/shipments/:trackingId` - Get a specific shipment by tracking ID (requires authentication)
- `PATCH /api/shipments/:trackingId` - Update a shipment (requires authentication)
- `DELETE /api/shipments/:trackingId` - Delete a shipment

### Tracking (`/api/tracking`)

- `GET /api/tracking/:trackingId` - Track a shipment by tracking ID (public)

## Project Structure

```
server/
├── src/
│   ├── config/          # Database and other configurations
│   ├── controller/       # Request handlers for routes
│   │   ├── authController.ts
│   │   ├── shipmentController.ts
│   │   └── trackingController.ts
│   ├── middleware/       # Express middlewares (Auth, etc.)
│   │   └── authMiddleware.ts
│   ├── models/          # Mongoose data models
│   │   ├── Users.ts
│   │   ├── Shipment.ts
│   │   └── TrackingShipment.ts
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── shipmentRoutes.ts
│   │   └── trackRoutes.ts
│   ├── services/        # Business logic layer
│   │   ├── authService.ts
│   │   ├── shipmentService.ts
│   │   └── trackingService.ts
│   ├── seeds/           # Database seed scripts
│   │   └── seed-admin.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── index.ts
│   │   └── receipt.ts
│   ├── utils/           # Utility functions
│   │   ├── countries.ts
│   │   ├── emailConfig.ts
│   │   ├── emailService.ts
│   │   ├── emailTemplates/
│   │   ├── generateReceipt.ts
│   │   ├── logger.ts
│   │   ├── redis.ts
│   │   └── trackingId.ts
│   └── server.ts        # Entry point
├── dist/                # Compiled JavaScript (after build)
├── dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Features

- User authentication with JWT
- Shipment creation and management
- Public shipment tracking
- Email notifications
- Receipt generation (PDF)
- File uploads to Cloudinary
- Redis caching
- TypeScript for type safety

## Future Roadmap

- Notifications on status change
- Rider assignment
- Proof of delivery
- Pricing and billing
- Admin dashboard
- Refresh token endpoint
- Logout endpoint
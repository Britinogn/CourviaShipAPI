# CourviaShip Server (CourviaShip  API)

Backend API service for the CourviaShip / NovaSend platform, built with Node.js, Express, and TypeScript. This service handles user authentication, shipment management, and courier tracking.

## Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Caching**: [Redis](https://redis.io/) (via ioredis)
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Cloudinary (via multer-storage-cloudinary) for file uploads

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or MongoDB Atlas)
- Redis instance (local or hosted)

## Installation & Setup

1.  **Clone the repository** (if not already done).

2.  **Navigate to the server directory**:

    ```bash
    cd server
    ```

3.  **Install dependencies**:

    ```bash
    npm install
    ```

## Running the Application

### Development Mode

Runs the server with hot-reloading using `nodemon` and `ts-node`.

```bash
npm run dev
```

### Production Build

transpile TypeScript to JavaScript in the `dist` folder.

```bash
npm run build
```

### Start Production Server

Runs the compiled JavaScript key file.

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Check API status, timestamp, and DB connection.
- `GET /` - Simple running message.

### Authentication (`/api/auth`)

- `POST /register` - Register a new user.
- `POST /login` - Login user.
- `POST /refresh` - Refresh access token.
- `POST /logout` - Logout user.

## Project Structure

```
server/
├── src/
│   ├── config/       # Database and other configurations
│   ├── controller/   # Request handlers for routes
│   ├── middleware/   # Express middlewares (Auth, etc.)
│   ├── models/       # Mongoose data models (User, Shipment, etc.)
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic layer
│   └── server.ts     # Entry point
├── dist/             # Compiled JavaScript (after build)
└── ...
```

## Future Roadmap

8. What You Would Build Next (Later)

Not now, just awareness:

- Notifications on status change
- Rider assignment
- Proof of delivery
- Pricing and billing
- Admin dashboard

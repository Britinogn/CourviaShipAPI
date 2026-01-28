# Start from a lightweight Node.js base image
# node:18-alpine is a smaller version of Node.js (alpine = minimal Linux)
#FROM node:18-alpine
FROM node:20

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./


# Copy tsconfig.json
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE $PORT

# Run the application
CMD ["node", "dist/server.js"]


# docker starter 
# docker compose --build -b 
# docker compose up --build -d

# Start Docker Desktop (if installed)
# On Mac/Linux:
# open -a Docker

# Or just start Docker service:
# sudo systemctl start docker

# Check if Docker is running:
# docker --version
# docker ps

# If you have a docker-compose file:
# docker-compose up

# Or to run in background:
# docker-compose up -d

# To build and start:
# docker-compose up --build

# # Stage 1: Build (compile TypeScript)
# FROM node:20 AS builder

# WORKDIR /app

# # Copy package files first → better caching
# COPY package*.json ./
# RUN npm install

# # Copy tsconfig + source
# # ← adjust if your source is not in /src
# COPY tsconfig.json ./
# COPY src ./src  

# # Build → creates dist/
# RUN npm run build

# # Stage 2: Runtime (slim production image)
# #or node:20-alpine for even smaller
# FROM node:20-slim   
# WORKDIR /app

# # Copy package files + install ONLY production deps
# COPY --from=builder /app/package*.json ./
# RUN npm ci --omit=dev && npm cache clean --force

# # Copy the compiled output
# COPY --from=builder /app/dist ./dist

# # Optional: copy other needed files (e.g. views, public, .env.example if any)
# # COPY --from=builder /app/public ./public
# # COPY --from=builder /app/views ./views

# # Production settings
# ENV NODE_ENV=production
# # Render injects PORT automatically, but explicit is fine
# EXPOSE ${PORT:-10000}

# # Start the app (use .js!)
# CMD ["node", "dist/server.js"]
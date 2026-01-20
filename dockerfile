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
CMD ["node", "dist/server.ts"]
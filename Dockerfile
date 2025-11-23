# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage - expose built files as volume
FROM alpine:latest

# Copy built files
COPY --from=builder /app/dist /dist

# Set working directory
WORKDIR /dist

# Keep container running so volume remains accessible
CMD ["tail", "-f", "/dev/null"]


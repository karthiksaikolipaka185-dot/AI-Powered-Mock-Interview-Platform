# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Accept build arguments for Vite environment variables
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy remaining source code
COPY . .

# Build static production assets
RUN npm run build

# Stage 2: Serve the built static assets with Nginx
FROM nginx:1.25-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for build caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source files
COPY index.js ./
COPY src/ ./src/

# Expose backend application port
EXPOSE 5000

# Set default NODE_ENV to production
ENV NODE_ENV=production

# Start backend server
CMD ["node", "index.js"]

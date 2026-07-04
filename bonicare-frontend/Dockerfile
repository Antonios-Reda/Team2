# Base image
FROM node:18-bullseye 

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 4200

# Start app in development mode, binding to 0.0.0.0 for external access
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]

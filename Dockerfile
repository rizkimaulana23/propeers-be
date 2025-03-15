# Development stage
FROM node:20-bullseye AS development

WORKDIR /usr/src/app

# Required for the crypto module to work correctly
ENV NODE_OPTIONS=--experimental-vm-modules

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including development dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
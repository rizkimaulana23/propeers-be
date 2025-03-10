# Development stage
FROM node:18-bullseye AS development

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
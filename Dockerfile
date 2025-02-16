# Use official Node.js image as a base
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production
RUN npm install
RUN npm install -g @nestjs/cli

# Copy the rest of the application
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

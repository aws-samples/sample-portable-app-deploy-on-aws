FROM node:22-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source maintaining directory structure
COPY dist/ ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

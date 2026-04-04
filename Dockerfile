# Use official Node.js lightweight image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files first (layer caching — faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the server
CMD ["node", "src/index.js"]
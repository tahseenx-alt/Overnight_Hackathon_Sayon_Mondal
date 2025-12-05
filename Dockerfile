FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of backend code
COPY . .

# Expose the port your Express app runs on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
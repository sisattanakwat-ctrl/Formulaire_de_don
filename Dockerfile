# Use Node.js 20 LTS (required for Next.js 16)
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package.json AND prisma schema (needed for postinstall)
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies (this will run postinstall script)
RUN bun install

# Copy the rest of the application files
COPY . .

# Build Next.js
RUN bun run build

# Expose port 3000
EXPOSE 3000

# Start application
CMD ["bun", "run", "start"]
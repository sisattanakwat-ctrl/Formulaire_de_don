# Use Node.js 20 LTS (required for Next.js 16)
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Install ALL dependencies (including devDependencies for build)
COPY package.json ./
RUN bun install

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN bun run build

# Expose port 3000
EXPOSE 3000

# Start application
CMD ["bun", "run", "start"]
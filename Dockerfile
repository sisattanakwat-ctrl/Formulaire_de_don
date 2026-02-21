# Use Node.js 18 LTS
FROM node:18-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install --production

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
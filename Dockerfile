# Stage 1: Build (Native Architecture)
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime (Target Architecture)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install dependencies for target architecture
RUN npm ci

# Copy built assets and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./

ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]

# UI Development Container (docker-compose)

FROM node:22
WORKDIR /app

# Copy package files first (separate layer for caching)
# Cached layer: only invalidates if package*.json changes
COPY package*.json ./

# Install dependencies (cached layer)
# This layer stays cached if only source code changes
RUN npm install

# Copy source code (invalidates cache if any files change)
COPY . .

# Verify TypeScript types and imports (catch errors early)
# This runs before the dev server starts
RUN npm run type-check

# Expose dev server ports
EXPOSE 5173
EXPOSE 3000

# Run development server with external access (--host 0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


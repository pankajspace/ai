# Use official Node.js Alpine image for a lightweight, minimal container footprint
FROM node:20-alpine

# Set working directory inside the container
# Subsequent instructions (COPY, RUN, CMD) will execute inside this directory
WORKDIR /app

# Copy package manifests (package.json and package-lock.json if available) first.
# By copying dependencies separately, Docker can cache the 'npm install' layer
# so it only reruns when package files change.
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all remaining project files into the container
COPY . .

# Build the optimized production bundle (minified, tree-shaken, one hashed JS file).
# Serving the Vite dev server in production made browsers download ~45 unbundled
# modules plus the 3 MB development build of react-dom, which took 15-20 s.
# The base path is baked in at build time; defaults match production
# (https://app.techtoday.click/ai-pocs/). Override with --build-arg for other paths.
ARG VITE_BASE_PATH=/ai-pocs/
ARG VITE_SERVER_URL=/ai-pocs
ENV VITE_BASE_PATH=$VITE_BASE_PATH \
    VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build

# Inform Docker that the container listens on port 5173 at runtime.
# Note: EXPOSE serves as documentation; you still need to publish ports (e.g., -p 5173:5173) when running.
EXPOSE 5173

# Serve the prebuilt dist/ with `vite preview`. It reuses the /api and /health
# proxy from vite.config.ts, so BACKEND_URL is still read at runtime.
# Local docker-compose.yml overrides this with `npm run dev` for hot reload.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

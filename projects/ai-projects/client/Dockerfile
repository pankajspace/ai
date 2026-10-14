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

# Inform Docker that the container listens on port 5173 at runtime (default Vite dev server port).
# Note: EXPOSE serves as documentation; you still need to publish ports (e.g., -p 5173:5173) when running.
EXPOSE 5173

# Launch the development server
# - "npm", "run", "dev": Executes the dev script defined in package.json (Vite)
# - "--", "--host", "0.0.0.0": Passes the host flag to Vite so it binds to all network interfaces,
#   allowing access from outside the Docker container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

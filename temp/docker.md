# Docker Guide

## Docker Common Commands
```bash
# Check Docker Version
docker --version

# Check Docker Info
docker info

# Delete everything (all containers, images)
docker system prune

# Delete everything including volumes
docker system prune -a --volumes
```

## Docker Images Management
```bash
# List Docker Images
docker images

# Remove Unused Images
docker image prune
```

## Docker Container Management
```bash
# List Running Containers
docker ps

# List All Containers (Running and Stopped)
docker ps -a

# Stop a Running Container
docker stop <container_id>

# Start a Stopped Container
docker start <container_id>
## Attach to the container's output after starting it
docker start -a <container_id>

# Remove All Stopped Containers
docker container prune
```

## Dockerfile example
```dockerfile
# Use the official Ubuntu base image
FROM ubuntu:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json to the working directory inside the container
COPY package.json /app/

# Install dependencies specified in package.json
RUN npm install

# Copy the rest of the application code to the working directory inside the container
COPY . /app

ENV NODE_ENV=production

# Document that the container will listen on port 3000 for incoming connections
EXPOSE 3000

# Specify the command to run when the container starts
CMD ["npm", "start"]
```

## Building and Running Docker Images from Dockerfile
```bash
# Build and run Docker images from the Dockerfile
## We need to do this in a directory containing the Dockerfile
## A unique image ID will be generated after building the image
docker build .

# Tag the Docker Image with a specific name
docker tag <image_id> <image_name>

# Build a Docker Image with a specific name
docker build -t <image_name> <path_to_dockerfile>
docker build -t pankajspace/mern .

# Run a Docker Container from the Built Image
docker run -it <image_name>
docker run -it pankajspace/mern
docker run hello-world

# Running Containers in Different Modes

## Interactive Mode
docker run -it <image_name> sh
docker run -it ubuntu sh

## Detached Mode
docker run -d <image_name>
docker run -d ubuntu

# Running a container with port mapping
## Port Mapping: Redirect traffic from the host port to the container port
docker run -p <host_port>:<container_port> <image_name>
docker run -p 3000:3000 pankajspace/mern

# Execute a Command in a Running Container
docker exec -it <container_id> <command>
docker exec -it ubuntu sh

# Getting all logs from a running container
docker logs <container_id>

# Follow logs from a running container in real-time
docker logs -f <container_id>

# Stop a Running Container
docker stop <container_id>

# Kill a Running Container
docker kill <container_id>
```

## Docker Compose
```bash
# Check Docker Compose version
docker-compose --version

# Build and run services defined in docker-compose.yml
docker-compose up --build

# Run services defined in docker-compose.yml without rebuilding
docker-compose up

# List the status of all services defined in docker-compose.yml
docker-compose ps

# Stop services defined in docker-compose.yml
docker-compose down
```
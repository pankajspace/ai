# Docker Guide

## Docker Common Commands
```bash
# Check Docker Version
docker --version

# Check Docker Info
docker info
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

# Remove All Stopped Containers
docker container prune
```

## Dockerfile example
```dockerfile
FROM ubuntu:latest

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . /app

ENV NODE_ENV=production

# Documents that the container will listen on port 3000 for incoming connections
EXPOSE 3000

CMD ["npm", "start"]
```

## Building and Running Docker Images from Dockerfile
```bash
# Build a Docker Image with a specific name
docker build -t <image_name> <path_to_dockerfile>
docker build -t pankajspace/mern .

# Run a Docker Container from the Built Image
docker run -it <image_name>
docker run -it pankajspace/mern
docker run hello-world

# Run a Container in Interactive Mode
# After this you will be inside the container's shell
docker run -it <image_name> sh
docker run -it ubuntu sh

# Execute a Command in a Running Container
docker exec -it <container_id> <command>
docker exec -it ubuntu sh
```


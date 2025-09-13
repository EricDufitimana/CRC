#!/bin/bash

# Docker Build and Push Script for CRC Testing Application
# Usage: ./docker-build.sh [registry] [tag]
# Example: ./docker-build.sh your-username latest

set -e

# Configuration
REGISTRY="${1:-your-username}"
TAG="${2:-latest}"
IMAGE_NAME="crc-testing"
FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"

echo "🏗️  Building Docker image: $FULL_IMAGE_NAME"

# Build the image
docker build -t $FULL_IMAGE_NAME .

echo "✅ Successfully built: $FULL_IMAGE_NAME"

# Ask if user wants to push to registry
read -p "Do you want to push to registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to registry..."
    
    # Check if user is logged in to Docker
    if ! docker info | grep -q "Username:"; then
        echo "📝 Please log in to Docker registry first:"
        docker login
    fi
    
    # Push the image
    docker push $FULL_IMAGE_NAME
    echo "✅ Successfully pushed: $FULL_IMAGE_NAME"
    
    # Also create and push a latest tag if using a version tag
    if [[ $TAG != "latest" && $TAG != "dev" ]]; then
        LATEST_IMAGE="$REGISTRY/$IMAGE_NAME:latest"
        docker tag $FULL_IMAGE_NAME $LATEST_IMAGE
        docker push $LATEST_IMAGE
        echo "✅ Also pushed as: $LATEST_IMAGE"
    fi
else
    echo "⏭️  Skipping push to registry"
fi

echo "🎉 Build complete!"
echo "📋 Image: $FULL_IMAGE_NAME"
echo "🔧 To run locally: docker run -p 3000:3000 --env-file .env.local $FULL_IMAGE_NAME"
echo "🐳 To run with compose: docker-compose up -d"

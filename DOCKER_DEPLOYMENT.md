# Docker Deployment Guide

This guide explains how to build, run, and deploy the CRC Testing application using Docker.

## Prerequisites

- Docker installed and running
- Docker Compose (optional, for development)
- Docker Hub account (for pushing to registry)

## Building the Docker Image

### Local Build
```bash
# Build the image locally
docker build -t crc-testing:latest .

# Build with a specific tag
docker build -t your-username/crc-testing:v1.0.0 .
```

### Multi-platform Build (for deployment)
```bash
# Build for multiple platforms (required for deployment to different architectures)
docker buildx build --platform linux/amd64,linux/arm64 -t your-username/crc-testing:latest .
```

## Running the Container

### Using Docker Run
```bash
# Basic run (you'll need to set environment variables)
docker run -p 3000:3000 crc-testing:latest

# Run with environment file
docker run -p 3000:3000 --env-file .env.local crc-testing:latest

# Run in detached mode with restart policy
docker run -d -p 3000:3000 --env-file .env.local --restart unless-stopped --name crc-app crc-testing:latest
```

### Using Docker Compose (Recommended)
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Add other environment variables as needed
```

## Deploying to Docker Registry

### Docker Hub
```bash
# Tag your image
docker tag crc-testing:latest your-username/crc-testing:latest

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push your-username/crc-testing:latest

# Push with specific version
docker tag crc-testing:latest your-username/crc-testing:v1.0.0
docker push your-username/crc-testing:v1.0.0
```

### Other Registries

#### AWS ECR
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag crc-testing:latest <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/crc-testing:latest
docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/crc-testing:latest
```

#### Google Container Registry
```bash
# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Tag and push
docker tag crc-testing:latest gcr.io/your-project-id/crc-testing:latest
docker push gcr.io/your-project-id/crc-testing:latest
```

## Production Deployment

### Cloud Platforms

#### Railway
1. Connect your repository to Railway
2. Railway will automatically detect the Dockerfile
3. Set environment variables in Railway dashboard
4. Deploy

#### Vercel (using Docker)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --docker
```

#### DigitalOcean App Platform
1. Connect your repository
2. Select Docker as the source type
3. Configure environment variables
4. Deploy

#### Heroku (using container registry)
```bash
# Login to Heroku container registry
heroku container:login

# Build and push
heroku container:push web -a your-app-name

# Release
heroku container:release web -a your-app-name
```

## Docker Image Optimization

The Dockerfile uses multi-stage builds and Next.js standalone output for optimization:

- **Multi-stage build**: Reduces final image size by excluding build dependencies
- **Standalone output**: Uses Next.js built-in optimization to include only necessary files
- **Non-root user**: Runs container as non-root user for security
- **Health check**: Includes health check endpoint for monitoring

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` file exists and contains all required variables
   - Check that environment variables are properly set in your deployment platform

2. **Database connection issues**
   - Verify DATABASE_URL and DIRECT_URL are correctly configured
   - Ensure database is accessible from the container

3. **Build failures**
   - Check that all dependencies are properly installed
   - Verify Prisma schema is valid
   - Ensure Node.js version compatibility

### Debugging
```bash
# Run container interactively for debugging
docker run -it --entrypoint /bin/sh crc-testing:latest

# Check container logs
docker logs <container-id>

# Execute commands in running container
docker exec -it <container-id> /bin/sh
```

## Security Considerations

1. Never include sensitive environment variables in the Dockerfile
2. Use `.dockerignore` to exclude sensitive files
3. Run containers as non-root users (already configured)
4. Regularly update base images for security patches
5. Use specific version tags instead of `latest` in production

## Monitoring

The application includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ"
}
```

Use this endpoint for:
- Load balancer health checks
- Container orchestration health monitoring
- Application monitoring services

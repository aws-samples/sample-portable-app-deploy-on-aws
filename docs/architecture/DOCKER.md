# Docker Deployment Strategy

## Overview

The project uses an optimized containerization strategy with multi-stage builds to reduce the final image size and improve security. The Docker image is built in two stages:

1. **Build Stage**: Compiles TypeScript code
2. **Production Stage**: Contains only production dependencies and compiled code

## Dockerfile

The Dockerfile uses the following optimizations:

```dockerfile
# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/infrastructure/local/server.js"]
```

## Docker Scripts

The following scripts have been added to `package.json` to manage the container lifecycle:

### Build and Local Execution

```bash
# Build Docker image
npm run docker:build

# Run container locally
npm run docker:run

# Run tests inside container (uses builder stage with dev dependencies)
npm run docker:test
```


The test script uses the builder stage which includes development dependencies required for testing, while the production image remains optimized with only production dependencies.

### ECS/EKS Integration

The deployment scripts for ECS and EKS have been updated to use the Docker image:

```bash
# ECS
npm run container:ecs:deploy:all  # Build, push and deploy to ECS

# EKS
npm run container:eks:deploy:all  # Build, push and deploy to EKS
```

## Health Check

The image includes a health check that verifies the `/health` endpoint every 30 seconds. This ensures the container is healthy and responding correctly.

## Implemented Best Practices

1. **Multi-stage Build**
   - Reduces final image size
   - Separates development dependencies from production
   - Improves security by removing build tools from final container

2. **Base Image**
   - Uses `node:20-slim` for minimal footprint
   - Maintains only essential packages

3. **Security**
   - Removes unnecessary files after package installation
   - Uses non-root user execution (implemented via ECS/EKS task definition)
   - Minimizes attack surface

4. **Health Check**
   - Integrated application monitoring
   - Facilitates orchestration and automatic recovery

5. **Versioning**
   - Support for latest and version-specific tags
   - Facilitates rollbacks and version tracking

## CI/CD Integration

To integrate with CI/CD pipelines, use the scripts in the following order:

1. `npm run docker:build`
2. `npm run docker:test`
3. `npm run docker:push:version`
4. Environment-specific deployment (ECS/EKS)

## Troubleshooting

### Check Health Status
```bash
# Manual check
curl http://localhost:3000/health

# View container health check status
docker inspect portable-app | grep Health

# 6. Generic Dockerfile Strategy

Date: 2024-02-20

## Status

Accepted

## Context

The project supports multiple deployment targets that use containers (Lambda Container, ECS, EKS). Each deployment target could potentially require its own Dockerfile, leading to maintenance overhead and potential inconsistencies.

## Decision

Implement a single, generic Dockerfile that can be reused across different deployment targets through build arguments and multi-stage builds.

### Implementation Strategy

1. **Multi-stage Build**
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Runtime stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY package*.json ./
   RUN npm install --production
   ```

2. **Configurable Entry Points**
   - Use environment variables or build arguments to determine the entry point
   - Support different runtime configurations based on deployment target

3. **Shared Base Configuration**
   - Common dependencies
   - Shared security configurations
   - Standard Node.js runtime settings

## Consequences

### Positive
- Single source of truth for container configuration
- Reduced maintenance overhead
- Consistent base image across deployments
- Easier testing and validation
- Simplified CI/CD pipelines
- Better resource utilization through layer caching

### Negative
- May require additional configuration at build time
- Potential compromise on deployment-specific optimizations
- Need to ensure compatibility across all deployment targets
- Slightly larger image size to accommodate all scenarios

## Compliance

- All container deployments must use the generic Dockerfile
- Custom Dockerfiles only allowed for specific, documented requirements
- Build arguments must be used for deployment-specific configurations
- Multi-stage builds must be used to optimize final image size
- Regular security scanning of base images required

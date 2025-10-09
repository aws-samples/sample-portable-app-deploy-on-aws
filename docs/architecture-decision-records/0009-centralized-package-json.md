# 9. Centralized Package.json Strategy

Date: 2024-02-20

## Status

Accepted

## Context

The project implements multiple architectural patterns and deployment strategies, which could potentially lead to multiple package.json files and fragmented dependency management. This could result in version conflicts, maintenance overhead, and complicated build processes.

## Decision

Implement a single, centralized package.json at the root level to manage all dependencies and scripts for the entire project.

### Implementation Strategy

1. **Unified Dependencies**
   ```json
   {
     "dependencies": {
       "express": "^4.18.2",
       "@aws-sdk/client-lambda": "^3.x",
       "winston": "^3.x"
     },
     "devDependencies": {
       "typescript": "^5.x",
       "jest": "^29.x",
       "@types/node": "^18.x",
       "@types/express": "^4.x"
     }
   }
   ```

2. **Organized Scripts**
   ```json
   {
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "test": "jest",
       "test:watch": "jest --watch",
       "deploy:lambda:zip": "scripts/deploy-lambda-zip.sh",
       "deploy:lambda:container": "scripts/deploy-lambda-container.sh",
       "deploy:ecs": "scripts/deploy-ecs.sh",
       "deploy:eks": "scripts/deploy-eks.sh"
     }
   }
   ```

3. **Workspace Configuration**
   - Single node_modules directory
   - Shared TypeScript configuration
   - Common build and test scripts

## Consequences

### Positive
- Single source of truth for dependencies
- Consistent versions across all architectures
- Simplified dependency updates
- Easier CI/CD configuration
- Reduced disk space usage
- Better dependency conflict resolution
- Simplified script management

### Negative
- Larger node_modules directory
- All architectures share same dependency versions
- May include unused dependencies in some contexts
- Need careful script naming to avoid conflicts

## Compliance

- All dependencies must be declared in root package.json
- No nested package.json files allowed
- Scripts must use consistent naming conventions
- Version updates must consider all architectures
- Dependencies must be clearly categorized
- Build scripts must handle all architecture variants

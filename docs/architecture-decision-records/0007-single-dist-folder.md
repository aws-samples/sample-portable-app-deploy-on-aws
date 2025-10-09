# 7. Single Dist Folder Strategy

Date: 2024-02-20

## Status

Accepted

## Context

With multiple deployment strategies and architectural patterns in the project, managing compiled code and build artifacts can become complex. Each architecture pattern and deployment target could potentially have its own build output location, leading to confusion and maintenance overhead.

## Decision

Implement a single './dist' folder strategy where all TypeScript compilation and build outputs are centralized, regardless of the deployment target or architectural pattern being used.

### Implementation Strategy

1. **Centralized Build Output**
   ```
   dist/
   ├── monolith/
   ├── layered/
   ├── hexagonal/
   └── clean/
   ```

2. **Unified Build Process**
   ```json
   {
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "build:all": "npm run build:monolith && npm run build:layered && npm run build:hexagonal && npm run build:clean"
     }
   }
   ```

3. **Shared TypeScript Configuration**
   ```json
   {
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     }
   }
   ```

## Consequences

### Positive
- Single source of truth for compiled code
- Simplified deployment processes
- Easier integration with CI/CD pipelines
- Clear separation between source and compiled code
- Consistent build output structure
- Simplified .gitignore configuration
- Easier cleanup and maintenance

### Negative
- Need to manage multiple architecture outputs in one location
- Potential for larger dist folder size
- Need for careful organization to avoid conflicts
- May require additional build configuration

## Compliance

- All TypeScript compilation must output to ./dist
- Build scripts must maintain the established folder structure
- No compiled code should exist outside the dist folder
- Each architecture pattern must have its own subfolder
- Clean builds must remove entire dist folder
- Deployment scripts must reference correct dist subfolder

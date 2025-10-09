# 13. Single Repository Structure

Date: 2024-02-20

## Status

Accepted

## Context

When implementing multiple architectural patterns and deployment strategies, there's a choice between using separate repositories for each pattern/deployment or maintaining everything in a single repository. For a learning-focused project, the organization of code and resources significantly impacts the ability to demonstrate and compare different approaches.

## Decision

Implement a monorepo-style single repository structure that contains all project components:
- Multiple architectural implementations
- Deployment configurations
- Documentation
- Shared utilities
- Test suites

### Repository Structure
```
/
├── src/
│   ├── 01-Monolith/
│   ├── 02-Layered/
│   ├── 03-HexagonalArchitecture/
│   └── 04-CleanArchitecture/
├── deployment/
│   ├── lambda/
│   ├── ecs/
│   └── eks/
├── docs/
│   ├── architecture/
│   └── architecture-decision-records/
├── scripts/
├── tests/
└── package.json
```

### Implementation Strategy

1. **Centralized Configuration**
   - Single package.json
   - Shared TypeScript configuration
   - Common build scripts
   - Unified testing setup

2. **Clear Directory Structure**
   - Separate folders for each architecture
   - Organized deployment scripts
   - Centralized documentation
   - Shared utilities

3. **Version Control**
   - Single main branch
   - Feature branches as needed
   - Consistent commit messages
   - Clear PR process

## Consequences

### Positive
- Simplified dependency management
- Easy code sharing between implementations
- Clear comparison between patterns
- Unified versioning
- Centralized documentation
- Easier maintenance
- Better learning experience
- Simplified local development

### Negative
- Repository size grows with each pattern
- More complex branching strategy
- Potential for merge conflicts
- Need for clear organization
- Higher initial setup effort

## Implementation Notes

### Best Practices
1. Maintain clear separation between patterns
2. Use consistent naming conventions
3. Share common utilities
4. Document folder structure
5. Keep related files together

### Code Organization
```typescript
// Example of shared utility
// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Used across different architectures
import { validateEmail } from '../../../utils/validation';
```

### Build Process
```json
{
  "scripts": {
    "build:all": "npm run build:monolith && npm run build:layered && npm run build:hexagonal && npm run build:clean",
    "test:all": "jest --projects src/**/jest.config.js",
    "deploy:all": "scripts/deploy-all.sh"
  }
}
```

## Learning Benefits

1. **Pattern Comparison**
   - Side-by-side implementation review
   - Clear architectural differences
   - Evolution of patterns
   - Shared components analysis

2. **Deployment Strategy**
   - Unified deployment approach
   - Common infrastructure code
   - Consistent configuration
   - Simplified testing

3. **Code Organization**
   - Clear folder structure
   - Logical grouping
   - Easy navigation
   - Pattern isolation

## Compliance

- Follow repository structure
- Maintain separation of concerns
- Document new patterns clearly
- Use shared utilities appropriately
- Keep related files together
- Follow naming conventions

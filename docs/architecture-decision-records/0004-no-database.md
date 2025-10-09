# 4. No Database Implementation

Date: 2024-02-20

## Status

Accepted

## Context

When building a project focused on demonstrating modern software architecture patterns and AWS deployment strategies, the choice of data persistence can significantly impact the project's complexity and learning curve.

## Decision

Implement the application without a database system, using in-memory storage instead. This decision is specifically made to:

1. Keep the focus on architectural patterns and deployment strategies
2. Reduce complexity in the learning process
3. Eliminate the need for database setup and management across different deployment platforms
4. Simplify the deployment process across multiple AWS services

### Implementation Details

- Use in-memory data structures for data storage
- Implement repository patterns that could be easily swapped with real database implementations
- Focus on clean interfaces that abstract the storage implementation

```typescript
// Example of in-memory repository implementation
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  
  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}
```

## Consequences

### Positive
- Simplified learning curve for architecture patterns
- Easier deployment across different AWS services
- Faster local development and testing
- No need for database configuration in different environments
- Clear focus on architectural concepts without database complexity

### Negative
- Not representative of real-world persistence requirements
- Data is not persistent across application restarts
- Limited ability to demonstrate database-specific patterns
- May need significant changes if adding a database later

## Compliance

- All data storage should use the repository pattern
- No direct database dependencies should be added to the project
- Storage interfaces should be designed to be database-agnostic
- Unit tests should not depend on external storage systems

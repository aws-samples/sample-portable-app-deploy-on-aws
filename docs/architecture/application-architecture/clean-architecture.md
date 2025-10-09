# Clean Architecture

[← Back to Hexagonal](hexagonal-architecture.md) | [Back to Main ↑](main-architecture.md)

Clean Architecture, introduced by Robert C. Martin (Uncle Bob), represents a comprehensive approach to software architecture that emphasizes the separation of concerns through concentric circles. Each circle represents a different layer of the software, with the innermost circles containing the business logic and domain entities, while the outer circles contain implementation details and frameworks.

The fundamental rule of Clean Architecture is the Dependency Rule: source code dependencies must point only inward, toward higher-level policies. Nothing in an inner circle can know anything about something in an outer circle. This means that the business rules can be tested without any concern for the user interface, database, web server, or any other external element.

This architecture style takes the principles of Hexagonal Architecture even further by explicitly defining the layers and their responsibilities, making it particularly well-suited for complex enterprise applications where business rules need to be clearly separated from technical implementations. The result is a highly maintainable, testable, and framework-independent application structure.

## Architecture Diagram
```
┌────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Express App  │  │Lambda Handler│  │   In-Memory  │   │
│  │  Adapter    │  │   Adapter    │  │  Repository  │   │
│  └─────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│        │                 │                 │           │
└────────┼─────────────────┼─────────────────┼───────────┘
         │                 │                 │
┌────────▼─────────────────▼─────────────────▼──────────┐
│                  Application Layer                    │
│                                                       │
│    ┌─────────────────────────────────────────┐        │
│    │              Use Cases                  │        │
│    │  ┌────────────┐  ┌────────────────┐     │        │
│    │  │Create User │  │   Get User     │     │        │
│    │  └────────────┘  └────────────────┘     │        │
│    │  ┌────────────┐  ┌────────────────┐     │        │
│    │  │Delete User │  │   List Users   │     │        │
│    │  └────────────┘  └────────────────┘     │        │
│    └─────────────────────┬───────────────────┘        │
│                          │                            │
└──────────────────────────┼────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────┐
│                   Domain Layer                        │
│                                                       │
│              ┌─────────────────┐                      │
│              │   User Entity   │                      │
│              │                 │                      │
│              │  - Validation   │                      │
│              │  - Business     │                      │
│              │    Rules        │                      │
│              └─────────────────┘                      │
│                                                       │
└───────────────────────────────────────────────────────┘

Dependencies point inward toward the domain layer
```

## Structure
```
src/04-CleanArchitecture/
├── application/          # Use cases and ports
│   ├── ports/            # Interface definitions
│   └── use-cases/        # Business operations
├── domain/               # Enterprise business rules
├── infrastructure/       # Framework and drivers
│   ├── http/             # Express application
│   ├── lambda/           # AWS Lambda handlers
│   └── repositories/     # Data access implementations
└── tests/                # Comprehensive tests
```

## Development Scripts
```bash
# Build the application
npm run clean:build

# Run unit tests
npm run clean:test

# Run locally
npm run clean:local

# Run end-to-end tests
npm run clean:test:e2e

# Build and run (all-in-one)
npm run clean:all
```

## Key Concepts

### Dependency Injection in Clean Architecture
Clean Architecture takes dependency injection to the next level by enforcing the Dependency Rule through use cases. Dependencies flow inward, with interfaces defined in inner layers and implementations in outer layers.

```
                    Dependency Flow
                          ↓
┌────────────────────────────────────────────────┐
│              Infrastructure Layer              │
│                                                │
│ infrastructure/repositories/                   │
│   in-memory-user-repository.ts                 │
│ class InMemoryUserRepository                   │
│   implements UserRepository {                  │
│   private users: Map<string, User>             │
│ }                                              │
└───────────────────────┬────────────────────────┘
                        │
                        │ implements
                        ↑
┌────────────────────────────────────────────────┐
│              Application Layer                 │
│                                                │
│ application/ports/user-repository.ts           │
│ interface UserRepository {                     │
│   save(user: User): Promise<void>              │
│   findById(id: string): Promise<User>          │
│ }                                              │
│                                                │
│ application/use-cases/create-user.ts           │
│ class CreateUserUseCase {                      │
│   constructor(                                 │
│     private userRepository: UserRepository     │
│   ) {}                                         │
│                                                │
│   execute(userData: UserData): Promise<User>   │
│ }                                              │
└───────────────────────┬────────────────────────┘
                        │
                        │ uses
                        ↑
┌────────────────────────────────────────────────┐
│                Domain Layer                    │
│                                                │
│ domain/user.ts                                 │
│ class User {                                   │
│   constructor(                                 │
│     private id: string,                        │
│     private name: string,                      │
│     private email: string                      │
│   ) {}                                         │
│ }                                              │
└────────────────────────────────────────────────┘
```

In our implementation:
1. Domain layer contains pure business entities (`User`)
2. Application layer:
   - Defines interfaces (`UserRepository`)
   - Contains use cases (`CreateUserUseCase`)
   - Depends on domain entities
3. Infrastructure layer:
   - Implements interfaces (`InMemoryUserRepository`)
   - Depends on application interfaces
4. Dependencies are injected through constructors
5. All dependencies point inward

### Use Case Design Pattern
Clean Architecture organizes business logic into use cases, each representing a specific operation the system can perform. Here's a real example from our codebase:

```typescript
// From: application/use-cases/create-user.ts
export interface CreateUserInput {
  name: string;
  email: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    try {
      // Generate UUID
      const id = randomUUID();
      
      // Create and validate domain entity
      const user = new User(id, input.name, input.email);
      
      // Persist using repository
      await this.userRepository.create(user);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}
```

Key patterns:
- Single responsibility per use case
- Input/Output boundaries defined by interfaces
- Dependencies injected through constructor
- Error handling at use case level

### Entity Design and Business Rules
Entities in Clean Architecture encapsulate business rules and validation:

```typescript
// From: domain/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('User ID is required');
    }
    
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (!this.isValidEmail()) {
      throw new Error('Invalid email format');
    }
  }

  public isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
```

Key patterns:
- Self-validating entities
- Immutable properties
- Business rules encapsulated
- No external dependencies

### Domain Layer
- Core business entities
- Enterprise-wide business rules
- No external dependencies
- Pure domain logic

### Application Layer
- Application-specific business rules
- Use case implementations
- Orchestration of domain entities
- Port definitions

### Infrastructure Layer
- Framework implementations
- Database adapters
- External interfaces
- Technical details

## Implementation Details

### Business Rules
The clean architecture implementation maintains the same business rules:

1. **User Entity Rules**
   - User must have a non-empty ID
   - User name must be at least 3 characters long
   - User name cannot be empty or only spaces
   - User email must be in a valid format

2. **User Management Operations**
   - Create a new user with validation
   - List all existing users
   - Get a specific user by ID
   - Delete a user by ID

## Test Results

### Unit Tests
```
🔍 Debug Information:
Deployment Type: local
🔍 API URL: http://127.0.0.1:8080
✅ Local server is running and responding

🧪 Testing local API at http://127.0.0.1:8080

Testing health endpoint...✅
Testing users creation...✅
Testing get users...✅
Testing get user by ID...✅
Testing get non-existent user...✅
Testing delete users...✅
Testing delete non-existent user...✅

✅ All tests executed for local! 🎉

----------------------------|--------------|-----------|---------|
Test Scenario               | # Test Cases | % success | % errors|
----------------------------|--------------|-----------|---------|
Health Check                |     1        |     100%  |      0% |
Create User                 |     2        |     100%  |      0% |
Get Users                   |     1        |     100%  |      0% |
Get User by ID              |     1        |     100%  |      0% |
Get Non-existent User       |     1        |     100%  |      0% |
Delete Users                |     2        |     100%  |      0% |
Delete Non-existent User    |     1        |     100%  |      0% |
```

### Coverage Metrics
- 100% domain layer coverage
- High use case coverage
- Thorough adapter testing
- Complete interface testing

### Test Types
- Domain entity tests
- Use case tests
- Interface adapter tests
- Infrastructure tests
- End-to-end tests

## Advantages
- Maximum independence
- Ultimate flexibility
- Framework independence
- Highly testable
- Clear boundaries
- Use case focused
- Easy to maintain

## Disadvantages
- Complex initial setup
- More boilerplate code
- Steep learning curve
- Can be overkill for simple apps
- Requires strict discipline

## When to Use
- Enterprise applications
- Complex business rules
- Long-term projects
- Large development teams
- High reliability requirements

## Best Practices
1. Dependency rule: dependencies point inward
2. Isolate use cases
3. Keep entities pure
4. Use dependency injection
5. Create clear boundaries
6. Test each layer independently
7. Document architecture decisions

## Migration from Hexagonal
1. Identify use cases
2. Separate application rules
3. Create clean interfaces
4. Implement adapters
5. Enforce dependency rule
6. Add comprehensive tests

## Key Differences from Hexagonal
- More explicit use cases
- Stricter dependency rules
- Clearer separation of concerns
- Better support for business rules
- More focused on enterprise architecture

## Conclusion
Clean Architecture represents the pinnacle of separation of concerns and flexibility in software design. While it requires more initial investment, it provides the highest level of maintainability and testability for complex enterprise applications.

Remember that architecture should serve your needs - Clean Architecture might be overkill for simple applications, but it's invaluable for complex enterprise systems with strict requirements for maintainability and flexibility.

[← Back to Hexagonal](hexagonal-architecture.md) | [Go to Deployment →](../deployment-architecture/deployment.md)

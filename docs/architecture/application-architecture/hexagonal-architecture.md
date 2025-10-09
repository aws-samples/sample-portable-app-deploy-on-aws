# Hexagonal Architecture

[← Back to Layered](layered-architecture.md) | [Next: Clean Architecture →](clean-architecture.md)

Hexagonal Architecture, also known as Ports and Adapters pattern, is an architectural pattern that aims to create loosely coupled application components that can be easily connected to their software environment through ports and adapters. This architecture enables a system to be equally driven by users, programs, automated tests, or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases.

The core principle is to define the structure of an application so that it could be run by different kinds of clients and could be tested in isolation from external dependencies. The business logic, or domain, sits at the core of the application, completely isolated from the outside world. Any interaction with the core happens through ports (interfaces), which are implemented by adapters that convert the interface of external systems into the specific port's interface.

This architecture gets its name from the visually hexagonal shape that appears when drawing the different adapters around the application core. The pattern emphasizes the separation between the domain logic and the infrastructure concerns, making the application more maintainable, testable, and flexible to change.

## Architecture Diagram
```
                  ┌────────────────────────────────────┐
                  │        Primary Adapters (Driver)   │
                  │                                    │
┌─────────────┐   │   ┌────────────────────────┐       │
│             │   │   │    Express API Adapter │       │
│   External  ├───┼───►                        │       │
│   Clients   │   │   │  HTTP Request/Response │       │
│             │   │   └─────────────┬──────────┘       │
└─────────────┘   │                 │                  │
                  └─────────────────┼──────────────────┘
                                    │
                  ┌─────────────────▼──────────────────┐
                  │           Domain Core              │
                  │                                    │
                  │    ┌─────────────────────┐         │
                  │    │   User Management   │         │
                  │    │      Service        │         │
                  │    └─────────┬───────────┘         │
                  │              │                     │
                  │    ┌─────────▼───────────┐         │
                  │    │     User Entity     │         │
                  │    └─────────┬───────────┘         │
                  │              │                     │
                  └──────────────┼─────────────────────┘
                                 │
                  ┌──────────────▼─────────────────────┐
                  │     Secondary Adapters (Driven)    │
                  │                                    │
                  │   ┌─────────────────────┐          │
                  │   │  In-Memory User     │          │
                  │   │    Repository       │          │
                  │   └─────────────────────┘          │
                  └────────────────────────────────────┘

Dependencies point inward toward the domain core
```

## Structure
```
src/03-HexagonalArchitecture/
├── application/           # Application services
├── domain/               # Business logic and entities
│   └── ports/            # Interface definitions
│       ├── driven/       # Outgoing interfaces
│       └── driver/       # Incoming interfaces
└── infrastructure/       # External adapters
    └── adapters/         # Implementation of ports
```

## Development Scripts
```bash
# Build the application
npm run hexagonal:build

# Run unit tests
npm run hexagonal:test

# Run locally
npm run hexagonal:local

# Run end-to-end tests
npm run hexagonal:test:e2e

# Build and run (all-in-one)
npm run hexagonal:all
```

## Key Concepts

### Dependency Injection in Hexagonal Architecture
In hexagonal architecture, dependency injection is crucial for maintaining the separation between the domain core and its adapters. The domain core defines ports (interfaces) that are implemented by adapters, and these implementations are injected into the core at runtime.

```
                      Dependency Flow
                           ↓
┌─────────────────────────────────────────────────┐
│                  Domain Core                    │
│                                                 │
│ domain/ports/driver/user-management.port.ts     │
│ interface UserManagementPort {                  │
│   createUser(): Promise<User>                   │
│   getUser(): Promise<User>                      │
│ }                                               │
│                                                 │
│ domain/ports/driven/user-repository.port.ts     │
│ interface UserRepositoryPort {                  │
│   save(): Promise<void>                         │
│   findById(): Promise<User>                     │
│ }                                               │
└─────────────────────────────────────────────────┘
                           ↑
                    Implements Ports
                           ↑
┌─────────────────────────────────────────────────┐
│                   Adapters                      │
│                                                 │
│ infrastructure/adapters/                        │
│   express-api.adapter.ts                        │
│   in-memory-user-repository.adapter.ts          │
│                                                 │
│ class ExpressApiAdapter                         │
│   implements UserManagementPort {               │
│   constructor(                                  │
│     private userService: UserManagementService  │
│   ) {}                                          │
│ }                                               │
│                                                 │
│ class InMemoryUserRepository                    │
│   implements UserRepositoryPort {               │
│   private users: Map<string, User>              │
│ }                                               │
└─────────────────────────────────────────────────┘
```

In our implementation:
1. The domain core defines `UserManagementPort` and `UserRepositoryPort`
2. Adapters implement these ports:
   - `ExpressApiAdapter` implements the driver port
   - `InMemoryUserRepository` implements the driven port
3. Dependencies are injected through constructors
4. The domain core remains isolated and framework-independent

### Ports
- Define interfaces for the domain
- Driver (incoming) ports define application API
- Driven (outgoing) ports define external dependencies
- Independent of technical details

### Adapters
- Implement ports for specific technologies
- Primary adapters drive the application
- Secondary adapters are driven by the application
- Easily replaceable

### Port Types and Patterns
```typescript
// Driver (Primary) Port - Used by external actors
// From: domain/ports/driver/user-management.port.ts
export interface UserManagementPort {
  createUser(userData: { name: string; email: string }): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
}

// Driven (Secondary) Port - Used by the domain
// From: domain/ports/driven/user-repository.port.ts
export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  remove(id: string): Promise<void>;
}
```

Key patterns:
- Driver ports define application API (what the app can do)
- Driven ports define infrastructure needs (what the app needs)
- All ports use domain types (User)
- Async operations return Promises

### Adapter Implementation Patterns
```typescript
// Primary Adapter - Implements driver port
// From: infrastructure/adapters/express-api.adapter.ts
export class ExpressApiAdapter {
  constructor(private readonly userManagement: UserManagementPort) {
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.post('/users', async (req: Request, res: Response) => {
      try {
        const user = await this.userManagement.createUser({
          name: req.body.name,
          email: req.body.email
        });
        res.status(201).json(user);
      } catch (error) {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });
  }
}

// Secondary Adapter - Implements driven port
// From: infrastructure/adapters/in-memory-user-repository.adapter.ts
export class InMemoryUserRepositoryAdapter implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}
```

Key patterns:
- Primary adapters translate external requests to port calls
- Secondary adapters implement infrastructure concerns
- Error handling and logging in adapters
- Clean separation of concerns

### Error Handling and Validation
1. Domain Errors
   - Business rule violations thrown by domain entities
   - Captured and translated by adapters

2. Infrastructure Errors
   - Handled in adapters (e.g., HTTP 404, 500)
   - Never exposed to domain

3. Validation
   - Input validation in primary adapters
   - Business validation in domain
   - Technical validation in secondary adapters

### Domain Core
- Contains business logic
- Independent of external concerns
- Defines ports for communication
- Pure business rules

## Implementation Details

### Business Rules
The hexagonal implementation maintains the same business rules:

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
All 41 tests passed successfully across 5 test suites:

1. Express API Adapter Tests (15 tests)
   - Health check endpoint
   - Request logging
   - User operations (POST, GET, DELETE)
   - Error handling scenarios
   - Server startup

2. Server Tests (6 tests)
   - Port configuration
   - Environment variable handling
   - Server startup scenarios
   - Error handling

3. Domain Tests (7 tests)
   - User entity validation
   - Property validation
   - JSON conversion

4. In-Memory Repository Tests (8 tests)
   - CRUD operations
   - Data persistence
   - Error scenarios

5. User Management Service Tests (5 tests)
   - Business logic operations
   - Service layer functionality

### Coverage Report
```
--------------------------------------------------|---------|----------|---------|---------|-------------------
File                                              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------------------------|---------|----------|---------|---------|-------------------
All files                                         |   94.53 |     87.5 |     100 |   94.53 |                   
 03-HexagonalArchitecture                         |   97.05 |    85.71 |     100 |   97.05 |                   
  server.ts                                       |   97.05 |    85.71 |     100 |   97.05 | 63                
 03-HexagonalArchitecture/application             |     100 |      100 |     100 |     100 |                   
  user-management.service.ts                      |     100 |      100 |     100 |     100 |                   
 03-HexagonalArchitecture/domain                  |     100 |      100 |     100 |     100 |                   
  user.ts                                         |     100 |      100 |     100 |     100 |                   
 03-HexagonalArchitecture/infrastructure/adapters |   91.04 |       80 |     100 |   91.04 |                   
  express-api.adapter.ts                          |      90 |    76.92 |     100 |      90 | 86-92             
  in-memory-user-repository.adapter.ts            |     100 |      100 |     100 |     100 |                   
```

The test suite achieves:
- 94.53% statement coverage
- 87.5% branch coverage
- 100% function coverage
- 94.53% line coverage

### Server Output
```
🛠️  Development mode enabled
Starting local development server...
Creating Express application instance
Initializing Express application dependencies
Using port: 8080

 _   _                                        _ 
| | | | _____  ____ _  __ _  ___  _ __   __ _| |
| |_| |/ _ \ \/ / _` |/ _` |/ _ \| '_ \ / _` | |
|  _  |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_| |_|\___/_/\_\__,_|\__, |\___/|_| |_|\__,_|_|
                      |___/                      

🚀 Server successfully started!
📡 Server running at http://localhost:8080

📍 Available endpoints:
  GET    /health    - Health check endpoint
  POST   /users     - Create a new user
  GET    /users     - List all users
  GET    /users/:id - Get user by ID
  DELETE /users/:id - Delete user by ID
```

## Advantages
- Complete isolation of domain logic
- Easy to change implementations
- Highly testable components
- Framework independence
- Multiple interface support

## Disadvantages
- More initial complexity
- Additional abstraction layers
- Steeper learning curve
- More initial setup required
- Can be overengineered for simple apps

## When to Use
- Complex domain logic
- Multiple interfaces needed
- Frequent technology changes
- High testability required
- Long-term maintainability needed

## Best Practices
1. Keep domain logic pure
2. Define clear port interfaces
3. Use dependency injection
4. Test in isolation
5. Maintain adapter independence
6. Document port contracts
7. Follow single responsibility

## Migration from Layered
1. Identify domain core
2. Define ports
3. Create adapters
4. Invert dependencies
5. Implement interfaces
6. Add isolation tests

## Next Steps
Consider moving to [Clean Architecture](clean-architecture.md) when:
- Need even stricter separation
- Want use-case driven design
- Require maximum flexibility
- Plan for complex business rules
- Need enterprise-level architecture

[← Back to Layered](layered-architecture.md) | [Next: Clean Architecture →](clean-architecture.md)

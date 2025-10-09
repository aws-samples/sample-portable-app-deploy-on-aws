# Monolithic Architecture

[← Back to Main](main-architecture.md) | [Next: Layered Architecture →](layered-architecture.md)

The monolithic architecture is the simplest and most traditional approach to building applications. In this pattern, all components of the application are tightly integrated into a single codebase and deployed as a single unit. Think of it as a large, self-contained application where all the functionality - from user interface to business logic to data access - exists within one program.

This architecture style is often the natural starting point for many applications due to its simplicity and straightforward development process. Like a single block of stone (hence "monolithic"), the application is built as one cohesive unit where all components are interconnected and share the same resources, memory space, and database.

While monolithic applications can become complex and harder to maintain as they grow, they offer significant advantages for smaller applications or initial MVPs: faster development, simpler deployment, and easier debugging since all code is in one place. Many successful companies started with a monolithic architecture and only moved to more complex architectures as their needs evolved.

## Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                    server.ts                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           HTTP Server Setup                 │    │
│  │  - Port configuration                       │    │
│  │  - Express initialization                   │    │
│  │  - Middleware setup                         │    │
│  └───────────────────────┬─────────────────────┘    │
│                          │                          │
│                          ▼                          │
│  ┌─────────────────────────────────────────────┐    │
│  │              app.ts                         │    │
│  │                                             │    │
│  │  ┌─────────────────┐   ┌────────────────┐   │    │
│  │  │   User Model    │   │  API Routes    │   │    │
│  │  │  - Validation   │   │  - CRUD ops    │   │    │
│  │  │  - Data struct  │   │  - Endpoints   │   │    │
│  │  └─────────────────┘   └────────────────┘   │    │
│  │                                             │    │
│  │  ┌─────────────────┐   ┌────────────────┐   │    │
│  │  │  Data Storage   │   │   Middleware   │   │    │
│  │  │  - In-memory    │   │  - Logging     │   │    │
│  │  │  - User data    │   │  - Validation  │   │    │
│  │  └─────────────────┘   └────────────────┘   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘

All components are tightly coupled within the monolithic structure
```

## Structure
```
src/01-Monolith/
├── app.ts         # Application logic
├── server.ts      # HTTP server
└── tests/         # Basic test files
```

## Development Scripts
```bash
# Build the application
npm run monolith:build

# Run unit tests
npm run monolith:test

# Run locally
npm run monolith:local

# Run end-to-end tests
npm run monolith:test:e2e

# Build and run (all-in-one)
npm run monolith:all
```

## Characteristics
- Single, unified codebase
- Direct dependencies between components
- Simple but limited flexibility
- All code in one place
- Tightly coupled components

## Implementation Details

### Business Rules
The monolithic implementation includes:

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

### Class Diagram
```
┌────────────────────────────────┐
│             User               │
├────────────────────────────────┤
│ - id: string                   │
│ - name: string                 │
│ - email: string                │
├────────────────────────────────┤
│ + constructor(id, name, email) │
|                                |
│ - isValidEmail(email): boolean │
│                                │
└────────────────────────────────┘
```

## Test Results

### Unit Tests
All 31 tests passed successfully across 3 test suites:

1. Server Tests (3 tests)
   ```
   Server
     ✓ should start server on default port 8080 when PORT env is not set
     ✓ should start server on specified PORT from environment variable
     ✓ should log all available endpoints
   ```

2. Application Tests (22 tests)
   ```
   User class
     ✓ should convert to JSON correctly
   Health Check
     ✓ should return healthy status
   Logging Middleware
     ✓ should handle raw request before body parsing
     ✓ should handle parsed request with non-empty body
     ✓ should handle parsed request with empty body
     ✓ should handle request with empty JSON body on successful endpoint
     ✓ should handle request with undefined body
     ✓ should handle request with body that throws on Object.keys
     ✓ should handle request with non-enumerable body properties
     ✓ should log request body when present
   User API
     POST /users
       ✓ should create a new user with valid data
       ✓ should return 400 with invalid name
       ✓ should return 400 with invalid email
     GET /users
       ✓ should return empty array when no users exist
       ✓ should return array of users when users exist
     GET /users/:id
       ✓ should return user when it exists
       ✓ should return 404 when user does not exist
     DELETE /users/:id
       ✓ should delete user when it exists
       ✓ should return 404 when trying to delete non-existent user
   ```

3. User Model Tests (6 tests)
   ```
   User
     constructor
       ✓ should create a valid user
       ✓ should throw error when id is empty
       ✓ should throw error when name is too short
       ✓ should throw error when name is empty
       ✓ should throw error when name is only spaces
       ✓ should throw error when email is invalid
     isValidEmail
       ✓ should return true for valid email
       ✓ should return false for invalid email formats
     toJSON
       ✓ should return correct JSON representation
   ```

### Coverage Report
```
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |    88.88 |     100 |     100 |                   
 app.ts    |     100 |     87.5 |     100 |     100 | 119-120           
 server.ts |     100 |      100 |     100 |     100 |                   
```

The test suite achieves:
- 100% statement coverage
- 88.88% branch coverage
- 100% function coverage
- 100% line coverage

### Server Output
```
🛠️  Development mode enabled
Starting local development server...
Creating Express application instance
Initializing Express application dependencies
Using port: 8080

 __  __                    _ _ _   _     
|  \/  | ___  _ __   ___ | (_) |_| |__  
| |\/| |/ _ \| '_ \ / _ \| | | __| '_ \ 
| |  | | (_) | | | | (_) | | | |_| | | |
|_|  |_|\___/|_| |_|\___/|_|_|\__|_| |_|

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
- Simple to understand and implement
- Quick to develop initially
- Easy deployment (single unit)
- Good for small applications
- Lower initial complexity

## Disadvantages
- Becomes complex as it grows
- Hard to maintain
- Difficult to scale
- Limited reusability
- High coupling between components

## Challenges
- Hard to test individual components
- Difficult to change infrastructure
- High risk of regression
- Limited scalability
- Complex maintenance as application grows

## When to Use
- Small applications
- Proof of concepts
- MVPs
- Simple domains
- Small teams

## Best Practices
1. Keep the codebase organized
2. Use clear naming conventions
3. Implement proper error handling
4. Add comprehensive logging
5. Maintain good test coverage

## Next Steps
Consider moving to a [Layered Architecture](layered-architecture.md) when:
- The codebase grows significantly
- Multiple developers need to work simultaneously
- Better separation of concerns is needed
- More structured testing is required

[← Back to Main](main-architecture.md) | [Next: Layered Architecture →](layered-architecture.md)

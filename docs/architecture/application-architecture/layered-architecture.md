# Layered Architecture

[← Back to Monolithic](monolithic-architecture.md) | [Next: Hexagonal Architecture →](hexagonal-architecture.md)

The layered architecture pattern is a classic approach to organizing software applications into distinct layers, each with its own specific responsibilities. This pattern promotes separation of concerns by dividing the application into horizontal layers that perform different roles, such as presentation, business logic, and data access.

In this architecture, each layer has a specific purpose and can only communicate with adjacent layers through well-defined interfaces. This hierarchical organization creates a clean separation between different aspects of the application, making it easier to understand, maintain, and modify individual components without affecting the entire system.

The key principle of layered architecture is the direction of dependencies: each layer depends only on the layer directly beneath it. This unidirectional dependency flow helps manage complexity and makes the system more maintainable by preventing changes in one layer from cascading throughout the entire application.

## Architecture Diagram
```
┌──────────────────────────────────────────────────────┐
│                     Controllers Layer                │
│                                                      │
│ ┌─────────────────┐                                  │
│ │ UserController  │ HTTP Request/Response Handling   │
│ └────────┬────────┘                                  │
│          │                                           │
├──────────▼───────────────────────────────────────────┤
│                      Services Layer                  │
│                                                      │
│ ┌─────────────────┐                                  │
│ │  UserService    │ Business Logic                   │
│ └────────┬────────┘                                  │
│          │                                           │
├──────────▼───────────────────────────────────────────┤
│                    Repository Layer                  │
│                                                      │
│ ┌─────────────────┐                                  │
│ │ UserRepository  │ Data Access                      │
│ └────────┬────────┘                                  │
│          │                                           │
├──────────▼───────────────────────────────────────────┤
│                      Models Layer                    │
│                                                      │
│ ┌─────────────────┐                                  │
│ │    User Model   │ Data Structure                   │
│ └─────────────────┘                                  │
└──────────────────────────────────────────────────────┘

Dependencies flow downward:
Controllers → Services → Repositories → Models
```

## Structure
```
src/02-Layered/
├── controllers/        # Request handling
├── services/          # Business logic
├── repositories/      # Data access
├── models/           # Data structures
└── tests/            # Layer-specific tests
```

## Development Scripts
```bash
# Build the application
npm run layered:build

# Run unit tests
npm run layered:test

# Run locally
npm run layered:local

# Run end-to-end tests
npm run layered:test:e2e

# Build and run (all-in-one)
npm run layered:all
```

## Layer Responsibilities

### Controllers Layer
- Handles HTTP requests and responses
- Input validation
- Route management
- No business logic

### Services Layer
- Contains business logic
- Orchestrates operations
- Independent of HTTP/persistence
- Implements use cases

### Repository Layer
- Data access logic
- CRUD operations
- Storage implementation
- Data persistence

### Models Layer
- Data structures
- Entity definitions
- Basic validation
- Business rules

## Implementation Details

### Business Rules
The layered implementation maintains the same business rules as the monolithic version:

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

### End-to-End Tests
```
🔍 Debug Information:
Deployment Type: local
Converted Type: local

🔍 Getting API endpoint...
🔍 API URL: http://127.0.0.1:8080
🔍 Checking if local server is running...
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

### Unit Tests
All 28 tests passed successfully across 2 test suites:

1. Server Tests (3 tests)
   ```
   Server
     ✓ should start server on default port 8080 when PORT env is not set
     ✓ should start server on specified PORT from environment variable
     ✓ should log all available endpoints
   ```

2. API Tests (25 tests)
   ```
   API
     Health Check
       ✓ should return healthy status
     Logging Middleware
       ✓ should handle raw request before body parsing
       ✓ should handle parsed request with empty body
       ✓ should handle requests with undefined body
       ✓ should log requests with body
       ✓ should log requests with non-user body format
     User Model Validation
       ✓ should throw error when ID is empty
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
     Error Handling
       ✓ should handle non-Error in listUsers
       ✓ should handle non-Error in createUser service
       ✓ should handle validation errors
       ✓ should handle system errors
       ✓ should handle non-Error objects as unknown errors
       ✓ should handle not found errors in getUser
       ✓ should handle not found errors in deleteUser
     Repository Delete Operations
       ✓ should handle concurrent deletion attempts
       ✓ should handle user not found during deletion attempt
     DELETE /users/:id
       ✓ should delete user when it exists
       ✓ should return 404 when trying to delete non-existent user
   ```

### Coverage Report
```
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |   99.33 |    93.75 |     100 |   99.32 |                   
 02-Layered              |     100 |      100 |     100 |     100 |                   
  app.ts                 |     100 |      100 |     100 |     100 |                   
  server.ts              |     100 |      100 |     100 |     100 |                   
 02-Layered/controllers  |     100 |    91.66 |     100 |     100 |                   
  user-controller.ts     |     100 |    91.66 |     100 |     100 | 45                
 02-Layered/models       |     100 |      100 |     100 |     100 |                   
  user.ts                |     100 |      100 |     100 |     100 |                   
 02-Layered/repositories |   96.29 |    83.33 |     100 |      96 |                   
  user-repository.ts     |   96.29 |    83.33 |     100 |      96 | 46                
 02-Layered/services     |     100 |      100 |     100 |     100 |                   
  user-service.ts        |     100 |      100 |     100 |     100 |                   
```

The test suite achieves:
- 99.33% statement coverage
- 93.75% branch coverage
- 100% function coverage
- 99.32% line coverage

### Server Output
```
🛠️  Development mode enabled
Starting local development server...
Creating Express application instance
Initializing Express application dependencies
Using port: 8080

 _                              _ 
| |    __ _ _   _  ___ _ __ __| |
| |   / _` | | | |/ _ \ '__/ _` |
| |__| (_| | |_| |  __/ | | (_| |
|_____\__,_|\__, |\___|_|  \__,_|
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
- Clear separation of concerns
- Easier to understand responsibilities
- Better maintainability
- Improved testability
- Organized codebase

## Disadvantages
- Still some coupling between layers
- Changes can affect multiple layers
- Limited flexibility for infrastructure
- Potential for large service layers
- Risk of anemic domain model

## When to Use
- Enterprise applications
- Complex business logic
- Multiple developers
- Need for clear structure
- Traditional web applications

## Best Practices
1. Keep layers independent
2. Avoid skipping layers
3. Maintain single responsibility
4. Use proper dependency injection
5. Implement comprehensive testing
6. Document layer boundaries
7. Use clear interfaces between layers

## Migration from Monolithic
1. Identify clear boundaries
2. Extract layers gradually
3. Implement proper interfaces
4. Add layer-specific tests
5. Refactor dependencies

## Next Steps
Consider moving to a [Hexagonal Architecture](hexagonal-architecture.md) when:
- Need more flexibility in infrastructure
- Want better isolation of business logic
- Require easier testing of components
- Plan to support multiple interfaces
- Need to swap implementations easily

[← Back to Monolithic](monolithic-architecture.md) | [Next: Hexagonal Architecture →](hexagonal-architecture.md)

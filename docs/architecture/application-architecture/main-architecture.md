# 1. Software Architecture Evolution

This documentation explains the evolution of software architecture patterns demonstrated in this project, from a basic monolithic approach to a sophisticated clean architecture implementation.

<div align="center">
    <img src="/docs/images/Disclaimer.jpg" width="50%" height="50%" alt="Disclaimer">
</div>

> **Important Note**: There is no universally "best" architecture. Each architectural pattern has its place and purpose. Monolithic architectures are not inherently bad - many successful companies started with this approach due to its simplicity and quick development cycle. The choice of architecture should be based on your specific context, team size, and project requirements.

While hexagonal or clean architectures might seem overly complex for small teams or simple applications, they offer significant advantages in terms of maintainability, testability, and scalability. These patterns create clear boundaries and make the codebase more adaptable to change, which becomes increasingly valuable as your application grows.

# 2. Architecture Historyline

```
           _____________________________________________________________________________
          /                                                                             \
         /                               S O F T W A R E                                 \
         |                             A R C H I T E C T U R E                            |
         |                                E V O L U T I O N                               |
         |________________________________________________________________________________|
                     |                   |                        |                  |
               (1970s-80s)           (1990s)                  (2005)              (2012)
                     v                   v                        v                  v

         ┌───────────────────────────────────────────────────────────────────────────────┐
         │                         1) MONOLITHIC ARCHITECTURE                            │
         │                             (1970s - 1980s)                                   │
         │  ┌─────────────────────────────────────────────────────────────────────────┐  │
         │  │               ____________   ____________   ____________                │  │
         │  │               |          |   |          |   |          |                │  │
         │  │               |  APP     |   |   DATA   |   |  LOGIC   |  <--- All in   │  │
         │  │               |__________|   |__________|   |__________|       one big  │  │
         │  │                                                                         │  │
         │  │  A single, massive codebase where all components and features           │  │
         │  │  are tightly coupled. Hard to scale and maintain over time.             │  │
         │  └─────────────────────────────────────────────────────────────────────────┘  │
         └───────────────────────────────────────────────────────────────────────────────┘
                                       |
                                       v
         ┌───────────────────────────────────────────────────────────────────────────────┐
         │                           2) LAYERED ARCHITECTURE                             │
         │                                 (1990s)                                       │
         │  ┌─────────────────────────────────────────────────────────────────────────┐  │
         │  │                         [  PRESENTATION  ]                              │  │
         │  │                          /            \                                 │  │
         │  │                  [  BUSINESS / DOMAIN LOGIC  ]                          │  │
         │  │                           /          \                                  │  │
         │  │                   [  DATA / PERSISTENCE  ]                              │  │
         │  │                                                                         │  │
         │  │  Organized in layers (Presentation, Business, Data). Emphasizes         │  │
         │  │  separation of concerns. Easier to maintain than monoliths but          │  │
         │  │  can grow complex as the system evolves.                                │  │
         │  └─────────────────────────────────────────────────────────────────────────┘  │
         └───────────────────────────────────────────────────────────────────────────────┘
                                       |
                                       v
         ┌───────────────────────────────────────────────────────────────────────────────┐
         │                           3) HEXAGONAL ARCHITECTURE                           │
         │                                  (2005)                                       │
         │  ┌─────────────────────────────────────────────────────────────────────────┐  │
         │  │                      ( A.K.A. PORTS AND ADAPTERS )                      │  │
         │  │            ________________      ________________                       │  │
         │  │           |                |    |                |                      │  │
         │  │   Adapters|     DOMAIN     |----|  Adapters      |                      │  │
         │  │           |  (Core Logic)  |    | (External Sys) |                      │  │
         │  │           |________________|    |________________|                      │  │
         │  │                                                                         │  │
         │  │  Centers on a core domain isolated from external concerns via Ports     │  │
         │  │  and Adapters. Promotes testability, clear boundaries, and flexibility. │  │
         │  └─────────────────────────────────────────────────────────────────────────┘  │
         └───────────────────────────────────────────────────────────────────────────────┘
                                       |
                                       v
         ┌───────────────────────────────────────────────────────────────────────────────┐
         │                               4) CLEAN ARCHITECTURE                           │
         │                                  (2012)                                       │
         │  ┌─────────────────────────────────────────────────────────────────────────┐  │
         │  │     ENTITIES      USE CASES     INTERFACE ADAPTERS      FRAMEWORKS      │  │
         │  │         ┌─────────────┐               ┌─────────────┐                   │  │
         │  │         │   Entities  │               │  Controllers │                  │  │
         │  │         └─────────────┘               └─────────────┘                   │  │
         │  │                    Business Rules & Use Cases in the center             │  │
         │  │                   remain independent from frameworks/UI.                │  │
         │  │  Ensures high maintainability, testability, and minimal coupling.       │  │
         │  └─────────────────────────────────────────────────────────────────────────┘  │
         └───────────────────────────────────────────────────────────────────────────────┘

                              ____________________
                             /                    \
                            /   T I M E L I N E    \
                           |________________________|

                    1970s-80s -> 1990s -> 2005 -> 2012  --->  Future...
```

The success of any architecture heavily depends on the team's skills and understanding. A well-implemented monolith is better than a poorly implemented clean architecture. Consider your team's expertise, learning curve, and development velocity when choosing an architectural pattern. Sometimes, starting with a simpler architecture and evolving it as your needs grow is the most practical approach.

Remember that architecture should serve your business needs:
- For small teams or MVPs: A well-organized monolith might be the most efficient choice
- For growing applications: Layered architecture provides a good balance of structure and simplicity
- For complex domains: Hexagonal or clean architecture offers better isolation and flexibility

# 3. Choosing the "Right" Architecture

When selecting an architecture pattern, consider the following key factors:

## 3.1 Team Considerations

### 3.1.1 Team Size and Expertise
- Small teams might benefit from simpler architectures
- Larger teams need clearer boundaries and separation
- Consider the learning curve for your team

### 3.1.2 Development Velocity
- Monolithic is faster for initial development
- Layered provides balance of speed and structure
- Hexagonal/Clean pay off in long-term maintenance

## 3.2 Technical Considerations

### 3.2.1 Project Complexity
- Simple applications can thrive with monolithic architecture
- Growing complexity benefits from better separation
- Complex domains need strong boundaries

### 3.2.2 Business Requirements
- Consider current and future scalability needs
- Evaluate maintenance requirements
- Account for team growth plans

### 3.2.3 Infrastructure Requirements
- Consider deployment options
- Evaluate scaling needs
- Assess monitoring and observability needs

## 3.3 Decision Factors

### 3.3.1 Short-term Considerations
- Time to market
- Initial development speed
- Team's current expertise
- Immediate business needs

### 3.3.2 Long-term Considerations
- Maintainability
- Scalability
- Team growth
- Future integrations

## 3.4 Proposed Evolution Path for this project

This project demonstrates a carefully planned progression through different architectural patterns, each building upon the lessons and limitations of the previous one:

1. **Starting with Monolithic**
   - Begin with a simple, single-unit application
   - All components tightly integrated
   - Perfect for initial rapid development and small teams
   - Helps identify natural boundaries as complexity grows

2. **Evolving to Layered**
   - Introduce clear separation of concerns
   - Organize code into distinct layers (presentation, business logic, data)
   - Improve maintainability while keeping reasonable complexity
   - Set foundation for further architectural improvements

3. **Advancing to Hexagonal**
   - Establish clear boundaries between core business logic and external concerns
   - Implement ports and adapters pattern
   - Gain flexibility in swapping external dependencies
   - Enhance testability and isolation

4. **Culminating in Clean Architecture**
   - Achieve complete separation of concerns
   - Center everything around the domain and use cases
   - Maximize independence from frameworks and external tools
   - Enable true plug-and-play architecture

```
Monolithic → Layered → Hexagonal → Clean Architecture
```

This evolution path reflects real-world application growth, where architectures often need to evolve as applications scale and requirements become more complex. Each step in this progression introduces new concepts while building upon the understanding gained from the previous architecture.

## 3.5 Architecture Comparison

| Feature | Monolithic | Layered | Hexagonal | Clean |
|---------|------------|---------|-----------|--------|
| Structure | Single unified application | Hierarchical layers | Core with ports and adapters | Concentric circles with domain at center |
| Dependency Direction | No strict direction; tightly coupled | Top-down from presentation to data access | Inward through ports; core independent | Inward; dependencies point towards domain |
| Separation of Concerns | Minimal separation | Clear separation between layers | Strong separation between core and adapters | Strong separation focused on domain and use cases |
| Flexibility | Low flexibility | Moderate flexibility | High flexibility | High flexibility |
| Testability | Low for individual components | Moderate | High | High |
| Scalability | Limited | Moderate | High | High |
| Development Time | Short Initial, Longer as complexity grows | Moderate Initial, Consistent thereafter | Longer Initial, Efficient ongoing | Long Initial, Smoother ongoing |
| Maintenance | Challenging, High risk of regression | Easier than Monolith, Moderate cross-layer impact | Facilitates Easier Maintenance, Low impact on core | Highly Maintainable, Low risk of side effects |
| Implementation Complexity | Low to moderate | Low to moderate | Moderate to high | High |
| Primary Use Case | Simple applications | Enterprise applications | Highly decoupled systems | Large, maintainable applications |

# 4. Project Implementation

## 4.1 Common Business Rules

All implementations share the same core business rules:

### 4.1.1 User Entity Rules
- User must have a non-empty ID
- User name must be at least 3 characters long
- User name cannot be empty or only spaces
- User email must be in a valid format

### 4.1.2 User Management Operations
- Create a new user with validation
- List all existing users
- Get a specific user by ID
- Delete a user by ID

## 4.2 Getting Started

This project contains multiple implementations of the same application, each using a different architectural pattern. To get started:

1. Clone the repository:
```bash
git clone git@ssh.gitlab.aws.dev:daniabib/Portable-App
cd Portable-App
```

2. Install dependencies:
```bash
npm install
```

All necessary scripts for building, testing, and running each architectural implementation are available in the root `package.json` file. Each implementation follows the same business rules but demonstrates different architectural approaches to solving the same problems.

We recommend starting with the monolithic implementation and progressively moving through each architecture to understand how the same functionality can be structured in different ways, each with its own advantages and trade-offs.

# 5. Learning Path

## 5.1 Architectural Implementations

> **Critical Learning Path**: To fully understand this project and the evolution of software architecture, it is essential to explore each implementation in sequence. We strongly recommend following these steps:

1. Start with the [Monolithic Architecture](monolithic-architecture.md) implementation
   - Examine the code structure and organization
   - Build and run the application locally
   - Understand its characteristics and trade-offs

2. Progress to the [Layered Architecture](layered-architecture.md) implementation
   - Notice how concerns are separated into distinct layers
   - Compare the improved organization with the monolithic approach
   - Run the application and observe the differences

3. Advance to the [Hexagonal Architecture](hexagonal-architecture.md) implementation
   - Study how ports and adapters create clear boundaries
   - See how the domain core remains isolated
   - Experience the benefits of this separation in practice

4. Finally, explore the [Clean Architecture](clean-architecture.md) implementation
   - Understand how use cases drive the application
   - Observe how dependencies point inward
   - Experience the full evolution of architectural patterns

Each implementation contains working code that you can run locally. By following this progression, you'll gain practical insights into how each architecture handles the same business requirements differently. This hands-on experience is crucial for understanding when and why you might choose one architecture over another.

## 5.2 Next Steps

After exploring each architecture implementation, refer to the [deployment strategy](../deployment-architecture/deployment.md) document to understand how these different architectures can be deployed to various AWS services like Lambda (ZIP, Container, Web Adapter), ECS, and EKS.

# 6. Architecture Decisions

Throughout this project's evolution, we've made numerous architectural decisions that have shaped our implementation approach. These decisions are documented in our [Architecture Decision Records (ADRs)](../../architecture-decision-records/README.md), which provide valuable context about why certain technical choices were made.

Key architecture-related ADRs include:
- [Architectural Evolution](../../architecture-decision-records/0001-architectural-evolution.md)
- [Deployment Strategy](../../architecture-decision-records/0003-deployment-strategy.md)
- [Modern Deployment Approach](../../architecture-decision-records/0005-modern-deployment-approach.md)
- [AWS SAM and CloudFormation for IaC](../../architecture-decision-records/0014-aws-sam-cloudformation.md)

We encourage reviewing these ADRs to understand the reasoning behind our architectural choices and how they support our goals of demonstrating software architecture evolution while maintaining deployment flexibility.

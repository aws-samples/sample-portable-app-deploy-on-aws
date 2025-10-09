# Software Architectural Evolution And Portable Application Deployment on AWS

This project is your practical guide to mastering modern software architecture patterns. Through a hands-on journey of evolving a simple user management application, you'll learn how to transform a basic monolithic codebase into a sophisticated clean architecture implementation. But that's not all – you'll also discover how to maintain deployment flexibility across various AWS compute services, a critical skill in today's cloud-native world.

Whether you're a developer wanting to understand architectural patterns, a tech lead making architectural decisions, or an architect looking for practical examples, this project offers valuable insights into:
- The natural evolution of software architecture
- Real-world implementation of popular architectural patterns
- Practical trade-offs between different architectural approaches
- Cloud-native deployment strategies
- Modern development best practices

<div align="center">
    <img src="./docs/images/ArchitecturalEvolution.png" width="800" height="480" alt="Architectural Evolution">
    <br>
    <i>Software Architectural Evolution Journey</i>
</div>



This project demonstrates various deployment options on AWS compute services, including [AWS Lambda](https://aws.amazon.com/lambda/), [Amazon ECS](https://aws.amazon.com/ecs/), and [Amazon EKS](https://aws.amazon.com/eks/). By implementing best architecture principles, the application remains portable and deployment-agnostic, mitigating vendor or even service lock-in concerns. You'll discover how well-architected software can be efficiently deployed across different technologies and AWS services while maintaining its core functionality and structure.

<div align="center">
    <img src="./docs/images/No-Lock-in.png" width="20%" height="20%" alt="No Lock-in">
    <br>
</div>

AWS provides a comprehensive suite of services and technologies that act as building blocks, empowering customers to architect solutions that best fit their specific needs. Rather than enforcing a one-size-fits-all approach, AWS offers flexibility through modular components that can be mixed and matched. This allows organizations to select and combine services based on their unique requirements, whether it's compute ([EC2](https://aws.amazon.com/ec2/), [Lambda](https://aws.amazon.com/lambda/), [ECS](https://aws.amazon.com/ecs/), [EKS](https://aws.amazon.com/eks/)), storage ([S3](https://aws.amazon.com/s3/), [EBS](https://aws.amazon.com/ebs/), [EFS](https://aws.amazon.com/efs/)), databases ([RDS](https://aws.amazon.com/rds/), [DynamoDB](https://aws.amazon.com/dynamodb/), [Aurora](https://aws.amazon.com/rds/aurora/)), or any other cloud capability. This building block approach ensures customers maintain control over their architecture while leveraging AWS's robust infrastructure and services.


<div align="center">
    <img src="./docs/images/PortableDeployment.png" width="800" height="480" alt="Deployment Models">
    <br>
    <i>Deployment Evolution Path</i>
</div>

## 1. Project Goals

<div align="center">
<table>
<tr>
<th>Software Architectural Evolution</th>
<th>Deployment Flexibility</th>
</tr>
<tr>
<td>• Transform a monolithic application into clean architecture through step-by-step refactoring, demonstrating how each architectural pattern solves specific challenges and introduces new capabilities</td>
<td>• Implement infrastructure flexibility by deploying the same business logic across different AWS compute services (Lambda, ECS and EKS), showcasing the power of well-architected applications</td>
</tr>
<tr>
<td>• Evolve from tightly coupled code to well-organized modules with clear responsibilities, improving maintainability and reducing technical debt</td>
<td>• Start with simple AWS Lambda ZIP deployments, perfect for quick iterations and minimal operational overhead</td>
</tr>
<tr>
<td>• Progress from mixed concerns to clear boundaries between business logic, infrastructure, and external interfaces through strategic patterns</td>
<td>• Advance to containerized Lambda deployments, gaining better dependency management and runtime consistency</td>
</tr>
<tr>
<td>• Implement comprehensive testing strategies enabled by clean architecture's separation of concerns, from unit to integration tests</td>
<td>• Leverage Lambda Web Adapters to maintain HTTP compatibility while benefiting from serverless scalability</td>
</tr>
<tr>
<td>• Develop testing approaches that evolve with the architecture, ensuring robust code at every stage of the transformation</td>
<td>• Scale to container orchestration with ECS, adding advanced deployment patterns and service discovery</td>
</tr>
<tr>
<td>• Achieve a final architecture that embodies SOLID principles, clean code practices, and enterprise-grade patterns</td>
<td>• Graduate to full Kubernetes on EKS for maximum control over scaling, deployment, and service management</td>
</tr>
</table>
</div>

<div align="center">
<i>Each goal complements the other - as the architecture evolves, the codebase becomes more flexible and easier to deploy across different services, while maintaining its core functionality regardless of the deployment platform.</i>
</div>

## 2. Project Overview

The project demonstrates the progressive evolution of software architecture through four key stages, each building upon the lessons and limitations of the previous:

2.1. **Monolithic Architecture**
   - Single, unified codebase where all components are tightly integrated
   - Direct dependencies between business logic, data access, and presentation
   - Simple to understand and quick to develop initially
   - Becomes challenging to maintain and modify as application grows

2.2. **Layered Architecture**
   - First step towards better organization through separation into distinct layers
   - Clear hierarchical structure: Presentation → Business → Data layers
   - Each layer has specific responsibilities and concerns
   - Improved maintainability through reduced coupling between components
   - Still maintains some dependencies between layers

2.3. **Hexagonal Architecture**
   - Introduces ports and adapters to isolate core business logic
   - Domain logic becomes independent of external concerns
   - Better adaptability to changing requirements
   - Easier to swap implementations (e.g., switching databases)
   - Enhanced testability through clear boundaries

2.4. **Clean Architecture**
   - Culmination of architectural evolution with complete separation of concerns
   - Domain entities at the core, surrounded by use cases
   - Independent of frameworks, UI, and databases
   - Maximum flexibility for changes and testing
   - Dependency rule ensures stability: dependencies point inward
   - Clear separation between business rules and implementation details

The software architecture evolves through increasing sophistication and separation of concerns, following this progression:

```
Monolithic → Layered → Hexagonal → Clean Architecture
```

This sequence demonstrates how the architecture matures to achieve:
- Better separation of concerns
- Increased modularity and flexibility
- Improved testability and maintainability
- Enhanced deployment options

## 3. Recommended Path for running this Project

1. Start with [Software Architecture Evolution](./docs/architecture/application-architecture/main-architecture.md) to understand the architectural patterns and their progression:
   - Study each architectural implementation (Monolithic → Layered → Hexagonal → Clean)
   - Deploy and run each version locally to see the differences in action
   - Execute unit tests to understand how testing improves with better architecture
   - Run end-to-end tests to verify consistent behavior across implementations

2. Follow the [Deployment Architecture Guide](./docs/architecture/deployment-architecture/deployment.md) to explore cloud deployment options:
   - Learn how the same codebase can be deployed to different AWS compute services
   - Progress through deployment options from simple to advanced:
     * Start with serverless using AWS Lambda (ZIP, Container, Web Adapter)
     * Move to container orchestration with Amazon ECS
     * Graduate to full Kubernetes with Amazon EKS
   - Experience how clean architecture enables flexible deployment choices

## 4. Deployment Strategy

The following deployment options are presented in order of increasing complexity and infrastructure requirements:

```
Local → Docker → Lambda ZIP → Lambda Container → Lambda Web Adapter → ECS → EKS
```

This sequence provides a comprehensible learning path that allows you to:
- Gradually understand each layer of complexity
- Build upon previous knowledge
- Test and validate in smaller increments
- Understand trade-offs between different deployment options

### 4.1 Deployment Options

1. **Local Development**
   - Direct Node.js execution
   - Docker container
   - Docker Compose

2. **AWS Lambda**
   - ZIP package deployment
   - Container image deployment
   - Web Adapter deployment

3. **Container Orchestration**
   - Amazon ECS (Elastic Container Service)
   - Amazon EKS (Elastic Kubernetes Service)

## 5. Project Structure

```
.
├── src/                              # Source code for all implementations
│   │
│   ├── 01-Monolith/                  # Initial monolithic implementation
│   ├── 02-Layered/                   # Layered architecture refactoring
│   ├── 03-HexagonalArchitecture/     # Hexagonal architecture implementation
│   ├── 04-CleanArchitecture/         # Final clean architecture version
│   └── e2e-tests/                    # End-to-end tests for all implementations
│
└── deployment/                       # Deployment configurations
    │
    ├── lambda/                       # AWS Lambda deployments
    │   ├── zip/                      # Basic ZIP deployment
    │   ├── container/                # Container-based deployment
    │   └── web-adapter/              # Web Adapter deployment
    │
    ├── ecs/                          # Amazon ECS deployment
    │
    └── eks/                          # Amazon EKS deployment
```

## 6. Prerequisites

Required software and minimum versions:

- Node.js 20.x or later
- npm 10.x or later
- AWS CLI v2.x configured with appropriate credentials
- AWS SAM CLI 1.x or later (for Lambda deployments)
- Docker 24.x or later (for container builds)
- kubectl 1.28 or later (for EKS deployments)
- eksctl 1.32.0 or later (for PODs deployments)

## 7. Final Implementation Matrix

By completing this project, you'll gain the ability to implement and deploy any combination of architectural pattern and AWS compute service. This creates a powerful matrix of possibilities:

<div align="center">
    <img src="./docs/images/FinalPossibleImplementation.png" width="800" height="480" alt="Final Implementation Matrix">
    <br>
    <i>Matrix of Possible Implementations</i>
</div>

This implementation matrix demonstrates the true power of well-architected applications. Each architectural style (Monolithic, Layered, Hexagonal, and Clean) can be successfully deployed to any of the target compute services (Lambda ZIP, Lambda Container, Lambda Web Adapter, ECS, and EKS). This flexibility is achieved through:

1. **Architecture Independence**
   - Each architectural pattern maintains its core functionality regardless of deployment platform
   - Business logic remains consistent across all deployment options
   - Different architectural approaches can coexist in the same organization

2. **Deployment Flexibility**
   - Start with simpler deployments and evolve as needed
   - Mix and match architectures and deployment platforms based on specific requirements
   - Migrate between compute services without rewriting application logic

3. **Learning Opportunities**
   - Understand the trade-offs between different architectural patterns in real-world scenarios
   - Experience how each architecture behaves in different deployment environments
   - Gain practical insights into cloud-native application development

This comprehensive approach ensures you're well-equipped to make informed decisions about both architecture and deployment strategies in your own projects.

## 8. Software Architecture Evolution Document

<div align="center">
    <img src="./docs/images/StartHere.jpg" width="20%" height="20%" alt="Start Here">
</div>

For a comprehensive understanding of the architectural evolution in this project, it is highly recommended to read the [Software Architecture Evolution](./docs/architecture/application-architecture/main-architecture.md) document. This document provides detailed insights into:
- The progression from monolithic to clean architecture
- Implementation details of each architectural pattern
- Trade-offs and benefits of each approach
- Best practices and lessons learned

## 9. Architecture Decisions

Architecture Decision Records (ADRs) are crucial documents that capture important architectural decisions made throughout the project's lifecycle. They provide essential context about why certain technical choices were made, considering the requirements, constraints, and trade-offs at the time of the decision.

These records serve as a historical reference and knowledge base, helping team members understand the evolution of the system's architecture and the reasoning behind key decisions. This is particularly important in a project that demonstrates various architectural patterns and deployment strategies, as it helps others understand why certain approaches were chosen over alternatives.

For detailed information about our architectural decisions and their rationale, please refer to our [Architecture Decision Records](./docs/architecture-decision-records/README.md).

## 10. Author
- Daniel ABIB - Specialist Solutions Architect for Startups - Bedrock & Serverless
- Email: daniabib@amazon.com


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.


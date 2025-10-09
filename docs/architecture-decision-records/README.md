# Architecture Decision Records (ADRs)

## Overview

Architecture Decision Records (ADRs) are documents that capture important architectural decisions made along with their context and consequences. Each ADR describes the architectural decision, its context, and its implications, providing a record of how the architecture has evolved and why certain choices were made.

## Why ADRs?

ADRs are crucial for several reasons:

1. **Historical Context**: They provide a historical record of significant decisions, helping team members understand why certain architectural choices were made.

2. **Knowledge Transfer**: New team members can quickly understand the project's architecture evolution and the reasoning behind key decisions.

3. **Decision Making Process**: ADRs document not just the decision but also the context, alternatives considered, and the reasoning process, which can inform future decisions.

4. **Impact Analysis**: Understanding the implications and trade-offs of each decision helps in assessing the impact of potential changes.

5. **Communication**: ADRs serve as a communication tool between team members, stakeholders, and future maintainers of the system.

## ADR Structure

Each ADR typically includes:

1. **Title**: A descriptive name that reflects the decision
2. **Status**: Current state (proposed, accepted, deprecated, superseded)
3. **Context**: Background information and the forces at play
4. **Decision**: The change being proposed or made
5. **Consequences**: The resulting context after applying the decision
6. **Compliance**: How to verify that the architecture complies with the decision

## Current Architecture Decisions

1. [Multiple Architecture Patterns Implementation](./0001-architectural-evolution.md)
   - Documents the decision to implement multiple architectural patterns (Monolith, Layered, Hexagonal, Clean)
   - Demonstrates how different architectures can be deployed using the same modern deployment strategies

2. [Deployment Strategy](./0003-deployment-strategy.md)
   - Describes the multi-deployment approach using various AWS services
   - Explains how the architecture supports deployment flexibility

3. [No Database Implementation](./0004-no-database.md)
   - Documents the decision to use in-memory storage
   - Explains how this simplifies the learning experience

4. [Modern Deployment Approach](./0005-modern-deployment-approach.md)
   - Details the focus on modern deployment services
   - Explains why traditional deployment methods were excluded

5. [Generic Dockerfile Strategy](./0006-generic-dockerfile.md)
   - Documents the approach to container configuration reuse
   - Explains the benefits of a unified container build process

6. [Single Dist Folder Strategy](./0007-single-dist-folder.md)
   - Details the centralized build output approach
   - Explains how this simplifies deployment across architectures

7. [Simple HTTP Requests Implementation](./0008-simple-http-requests.md)
   - Documents the decision to use basic REST endpoints
   - Explains how this maintains focus on core concepts

8. [Centralized Package.json Strategy](./0009-centralized-package-json.md)
   - Details the unified dependency management approach
   - Explains the benefits of centralized script management

9. [Not Using Elastic Beanstalk or EC2](./0010-no-elastic-beanstalk-ec2.md)
    - Documents the decision to exclude traditional deployment approaches
    - Explains the focus on modern serverless and container services

10. [Jest Testing Framework Adoption](./0011-jest-testing.md)
    - Documents the decision to use Jest for all testing levels
    - Details testing strategies and best practices across architectures

11. [Console-Based Logging Strategy](./0012-console-logging.md)
    - Documents the decision to use simple console logging for learning purposes
    - Explains considerations for production-grade logging solutions

12. [Single Repository Structure](./0013-single-repository.md)
    - Documents the decision to use a monorepo-style structure
    - Explains how this supports learning and pattern comparison

13. [Using AWS SAM and CloudFormation for IaC](./0014-aws-sam-cloudformation.md)
    - Documents the adoption of AWS SAM and CloudFormation for infrastructure as code
    - Explains the benefits of automated and repeatable infrastructure provisioning

14. [Learning Project Focus](./0015-learning-project-focus.md)
    - Documents the decision to exclude production concerns like security, CI/CD, and performance
    - Explains how this focus enhances the learning experience and simplifies understanding

15. [TypeScript as Primary Language](./0016-typescript.md)
    - Details the selection of TypeScript for the project
    - Outlines the advantages of static typing and modern JavaScript features

## Creating New ADRs

When creating new ADRs:
1. Use the format: `NNNN-title.md` where NNNN is a sequential number
2. Follow the established template structure
3. Keep the content clear, concise, and focused on the architectural decision
4. Include relevant context and consequences
5. Update this index when adding new ADRs

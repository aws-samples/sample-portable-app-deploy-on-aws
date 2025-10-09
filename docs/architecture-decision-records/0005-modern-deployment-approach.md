# 5. Modern Deployment Approach

Date: 2024-02-20

## Status

Accepted

## Context

When deploying applications to AWS, there are multiple approaches available, from traditional EC2 instances to modern serverless and container-based solutions. The choice of deployment strategy significantly impacts the application's scalability, maintainability, and operational costs.

## Decision

Focus on modern deployment approaches, specifically excluding traditional EC2 and Elastic Beanstalk deployments in favor of:

1. AWS Lambda (multiple formats)
   - ZIP deployment
   - Container deployment
   - Lambda Web Adapter
2. Container orchestration platforms
   - Amazon ECS (Elastic Container Service)
   - Amazon EKS (Elastic Kubernetes Service)

### Rationale

1. **Serverless First**
   - Automatic scaling
   - Pay-per-use pricing
   - Zero infrastructure management
   - Multiple deployment options (ZIP, container, web adapter)

2. **Container Orchestration**
   - Modern container management
   - Automated scaling and deployment
   - Industry-standard practices
   - Portable across cloud providers

### Excluded Traditional Approaches

- EC2 instances (requires manual scaling and maintenance)
- Elastic Beanstalk (abstraction layer that hides modern deployment practices)

## Consequences

### Positive
- Reduced operational overhead
- Modern, scalable architecture
- Better cost optimization
- Focus on current industry practices
- Easier adoption of DevOps practices
- Better alignment with microservices architecture

### Negative
- Steeper learning curve for container orchestration
- More complex initial setup
- Need to understand multiple deployment models
- Potential cold starts with serverless

## Compliance

- No direct EC2 instance management
- No Elastic Beanstalk deployments
- All deployments must use either Lambda or container orchestration
- Infrastructure as Code (IaC) must be used for all deployments
- Deployment processes must be automated

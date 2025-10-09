# 3. Multi-Platform Deployment Strategy

Date: 2024-02-20

## Status

Accepted

## Context

The application needs to be deployable across different AWS compute services:
- AWS Lambda (ZIP and Container)
- Amazon ECS
- Amazon EKS

Each service has its own characteristics, limitations, and benefits.

## Decision

Implement a flexible deployment strategy using:

1. **AWS SAM** for Lambda deployments
   - Template for ZIP deployment
   - Template for Container deployment

2. **CloudFormation** for ECS
   - Task definitions
   - Service configurations
   - Load balancer setup

3. **Kubernetes Manifests** for EKS
   - Deployments
   - Services
   - ConfigMaps

### Deployment Structure
```
deployment/
├── ecs/
│   └── ecs-template.yaml
├── eks/
│   ├── eks-template.yaml
│   └── k8s-deployment.yaml
└── lambda/
    ├── container/
    │   ├── samconfig.toml
    │   └── template.yaml
    └── zip/
        ├── samconfig.toml
        └── template.yaml
```

## Consequences

### Positive
- Flexibility in compute service choice
- Cost optimization based on usage
- Possibility of service migration
- Code reuse across platforms
- Easy local testing

### Negative
- Higher configuration complexity
- Need to maintain multiple templates
- Different deployment processes
- Learning curve for each platform
- Maintenance overhead

## Implementation Notes

### Lambda (ZIP)
```bash
npm run lambda:zip:build
npm run lambda:zip:deploy
```

### Lambda (Container)
```bash
npm run lambda:container:all
```

### ECS
```bash
aws cloudformation deploy \
  --template-file deployment/ecs/ecs-template.yaml \
  --stack-name portable-ecs
```

### EKS
```bash
kubectl apply -f deployment/eks/k8s-deployment.yaml

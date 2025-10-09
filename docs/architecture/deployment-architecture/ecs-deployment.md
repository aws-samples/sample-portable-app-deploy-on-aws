# ECS Deployment

[← Back to Lambda Web Adapter](./lambda-web-adapter-deployment.md) | [Next: EKS Deployment →](./eks-deployment.md)

ECS (Elastic Container Service) deployment provides a fully managed container orchestration service. This approach offers more control over your container infrastructure while maintaining the benefits of AWS managed services. It's ideal for applications that require consistent performance, predictable workloads, and container-native features.

## Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│      ALB        │ ──► │  ECS Cluster    │ ──► │  ECS Service    │ ──► │ In-Memory Store │
│                 │     │   (Fargate)     │     │    (Tasks)      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Structure
```
deployment/ecs/
├── ecs-base-template.yaml      # Base infrastructure CloudFormation template
├── ecs-service-template.yaml   # Service-specific CloudFormation template
├── deploy-base.sh             # Script to deploy base infrastructure
├── deploy-service.sh          # Script to deploy service
└── container-delete.sh        # Script to clean up resources
```

## Deployment Process

### 1. Deploy Base Infrastructure
```bash
npm run container:ecs:deploy:infrastructure

# Example output:
📋 Using AWS Account: 496714466045
📍 Region: us-east-1
🚀 Starting ECS base infrastructure deployment...

🏗️  Checking ECR repository...

⚠️  IMPORTANT: This deployment may take several minutes as it creates VPC, subnets, route tables
   Internet Gateway, and ECS cluster. ⚠️

🚀 Deploying CloudFormation stack...

Stack outputs:
• TargetGroupArn: arn:aws:elasticloadbalancing:us-east-1:496714466045:targetgroup/portab-Targe-5RAOVCC3GJTK/7cb9263f89c41892
• ExecutionRoleArn: arn:aws:iam::496714466045:role/portable-ecs-ExecutionRole-EJPtrlDdyDJF
• TaskRoleArn: arn:aws:iam::496714466045:role/portable-ecs-TaskRole-9VFwXOze73OK
• VpcId: vpc-0a8388169860e4d7d
• LogGroup: /ecs/portable-ecs
• LoadBalancerDNS: portab-LoadB-GxLdjGDMu454-1788541768.us-east-1.elb.amazonaws.com
• PublicSubnet2: subnet-0b952b48e69e7af31
• ClusterName: portable-ecs-cluster
• ServiceSecurityGroup: sg-087907837fecb936f
• PublicSubnet1: subnet-0e6b1b36ab3bf5182

✅ Base infrastructure deployment completed!
```

### 2. Deploy Service
```bash
npm run container:ecs:deploy:service

# Example output:
📋 Using AWS Account: 496714XXXXXXX
📍 Region: us-east-1
🚀 Starting ECS service deployment...

📦 Logging into ECR...
Login Succeeded

🔨 Building Docker image for x86_64 architecture...
[+] Building 42.4s (14/14) FINISHED
...
=> importing to docker                                                                 0.8s

📤 Pushing image to ECR...
The push refers to repository [496714XXXXXXX.dkr.ecr.us-east-1.amazonaws.com/portable-container-ecs]
...
20250107055756: digest: sha256:bd4e47cfef31515cab49bbd3ec5a662b319499632da30a400a17390f924ef27f size: 2415

🚀 Deploying service stack...
Service stack outputs:
• ServiceName: portable-ecs-service-service
• TaskDefinitionArn: arn:aws:ecs:us-east-1:496714466045:task-definition/portable-ecs-service-task:17

✅ Service deployment completed!
🌐 Service URL: http://portab-LoadB-GxLXXXXXXX-1788541768.us-east-1.elb.amazonaws.com:8080
```

### 3. End-to-End Testing
```bash
npm run test:e2e ecs

# Example output:
🔍 Debug Information:
Deployment Type: ecs
🔍 API URL: http://portab-LoadB-GxLXXXXXXX-1788541768.us-east-1.elb.amazonaws.com:8080

Testing health endpoint...
Health check response: 200

Testing version endpoint...
Version check response: 200
Version check verified: hexagonal-architecture

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201

Testing get users...
Get users response: 200
Users returned: [
  {
    id: '8172aacc-256e-4e13-8bfa-8b9affe45d46',
    name: 'Test User 1',
    email: 'user1@example.com'
  },
  {
    id: '69195023-b616-421c-b124-d03363402c4e',
    name: 'Test User 2',
    email: 'user2@example.com'
  }
]

Testing get user by ID...
Get user response: 200
User returned: {
  id: '8172aacc-256e-4e13-8bfa-8b9affe45d46',
  name: 'Test User 1',
  email: 'user1@example.com'
}

Testing delete users...
✅ All users were successfully deleted

✅ All tests executed for ecs! 🎉

----------------------------|--------------|-----------|---------|
Test Scenario               | # Test Cases | % success | % errors|
----------------------------|--------------|-----------|---------|
Health Check                |     1        |     100%  |      0% |
Version Check               |     1        |     100%  |      0% |
Create User                 |     2        |     100%  |      0% |
Get Users                   |     1        |     100%  |      0% |
Get User by ID              |     1        |     100%  |      0% |
Get Non-existent User       |     1        |     100%  |      0% |
Delete Users                |     2        |     100%  |      0% |
Delete Non-existent User    |     1        |     100%  |      0% |
----------------------------|--------------|-----------|---------|
```

## Characteristics
- Managed container orchestration
- Predictable performance
- Configurable auto-scaling
- Load balancing
- Service discovery
- Task scheduling
- Container management

## Implementation Details

### Infrastructure Components
1. VPC with public subnets
2. Application Load Balancer
3. ECS Fargate cluster
4. CloudWatch logs
5. IAM roles and policies
6. Security groups

### CloudFormation Template Structure
The templates define:
1. Network infrastructure
2. Container definitions
3. Service configuration
4. Auto-scaling rules
5. Load balancer settings
6. Security configurations

### Deployment Process Overview
1. Create base infrastructure (VPC, subnets, security groups)
2. Build container image with Node.js application
3. Push image to Amazon ECR
4. Deploy ECS service with task definition
5. Configure auto-scaling and load balancing
6. Set up monitoring and logging
7. Run end-to-end tests to verify deployment

## Advantages
- Full container orchestration
- Predictable performance
- Managed infrastructure
- Auto-scaling capabilities
- Load balancing
- Service discovery
- AWS integration

## Disadvantages
- Higher base cost
- More complex setup
- Infrastructure overhead
- Less flexibility than EKS
- AWS-specific
- Learning curve

## Next Steps
Consider moving to [EKS Deployment](./eks-deployment.md) when:
- You need Kubernetes features
- Multi-cloud strategy is required
- More complex orchestration is needed
- Team has Kubernetes expertise
- Advanced deployment patterns are required

[← Back to Lambda Web Adapter](./lambda-web-adapter-deployment.md) | [Next: EKS Deployment →](./eks-deployment.md)

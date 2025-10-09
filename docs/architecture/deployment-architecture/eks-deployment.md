# EKS Deployment

[← Back to ECS](./ecs-deployment.md) | [Back to Main](./deployment.md)

EKS (Elastic Kubernetes Service) deployment represents the most sophisticated container orchestration option. This approach provides a fully managed Kubernetes service that gives you maximum flexibility and control over your container infrastructure. It's ideal for complex applications that require advanced orchestration features, multi-cloud compatibility, or specific Kubernetes capabilities.

## Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│      ALB        │ ──► │  EKS Cluster    │ ──► │     Pods        │ ──► │ In-Memory Store │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Structure
```
deployment/eks/
├── k8s-deployment.yaml    # Kubernetes deployment manifest
├── deploy-base.sh         # Script to deploy cluster infrastructure
├── deploy-service.sh      # Script to deploy application
└── container-delete.sh    # Script to clean up resources
```

## Deployment Process

### 1. Deploy Base Infrastructure
```bash
npm run container:eks:deploy:infrastructure

# Example output:
📋 Using AWS Account: 4967144XXXXXXX
📍 Region: us-east-1
🚀 Starting EKS infrastructure deployment...

🏗️  Checking ECR repository...

⚠️  IMPORTANT: This deployment may take 15-20 minutes as it creates VPC, subnets,
   NAT Gateways, and EKS cluster with managed node group. ⚠️

🚀 Creating EKS cluster...
2025-01-07 06:17:45 [ℹ]  eksctl version 0.199.0-dev+228a27121.2024-12-13T23:02:44Z
2025-01-07 06:17:45 [ℹ]  using region us-east-1
2025-01-07 06:17:46 [ℹ]  setting availability zones to [us-east-1d us-east-1a]
2025-01-07 06:17:46 [ℹ]  subnets for us-east-1d - public:192.168.0.0/19 private:192.168.64.0/19
2025-01-07 06:17:46 [ℹ]  subnets for us-east-1a - public:192.168.32.0/19 private:192.168.96.0/19
2025-01-07 06:17:46 [ℹ]  nodegroup "portable-workers" will use "" [AmazonLinux2/1.31]
2025-01-07 06:17:46 [ℹ]  using Kubernetes version 1.31
2025-01-07 06:17:46 [ℹ]  creating EKS cluster "portable-eks" in "us-east-1" region with managed nodes

# ... cluster creation process ...

🔍 Getting infrastructure details...
Cluster details:
• Kubernetes control plane is running at https://35849C471135567FD1B66AE957A8BC89.gr7.us-east-1.eks.amazonaws.com
• CoreDNS is running at https://35849C471135567FD1B66AE957A8BC89.gr7.us-east-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

Node details:
• NAME                             STATUS   ROLES    AGE    VERSION               INTERNAL-IP      EXTERNAL-IP     OS-IMAGE         KERNEL-VERSION                  CONTAINER-RUNTIME
• ip-192-168-50-203.ec2.internal   Ready    <none>   114s   v1.31.3-eks-59bf375   192.168.50.203   34.227.48.108   Amazon Linux 2   5.10.230-223.885.amzn2.x86_64   containerd://1.7.23

✅ Base infrastructure deployment completed!
```

### 2. Deploy Service
```bash
npm run container:eks:deploy:service

# Example output:
📋 Using AWS Account: 4967144XXXXXXX
📍 Region: us-east-1
🚀 Starting EKS service deployment...

📦 Logging into ECR...
Login Succeeded

🔨 Building Docker image for x86_64 architecture...
[+] Building 33.2s (13/13) FINISHED
...
=> importing to docker                                                                 0.6s

📤 Pushing image to ECR...
The push refers to repository [4967144XXXXXXX.dkr.ecr.us-east-1.amazonaws.com/portable-container-eks]
...
20250107063456: digest: sha256:a1b82965d79a27028d2786751186777956ea7145931998242d340fa6fc4f8550 size: 2415

🚀 Deploying to Kubernetes...
service/portable-service created
deployment.apps/portable-app created

⏳ Waiting for deployment to complete...
Waiting for deployment "portable-app" rollout to finish: 0 of 1 updated replicas are available...
deployment "portable-app" successfully rolled out

✅ Service deployment completed!
🌐 Service URL: http://XXXXXXXXXX9c46829e18e2caf870c0e-1898970209.us-east-1.elb.amazonaws.com:8080
```

### 3. End-to-End Testing
```bash
npm run test:e2e eks

# Example output:
🔍 Debug Information:
Deployment Type: eks
🔍 API URL: http://XXXXXXXXXX9c46829e18e2caf870c0e-1898970209.us-east-1.elb.amazonaws.com:8080

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
    id: '2aa926e8-c19a-4af0-8a71-85c065fca315',
    name: 'Test User 1',
    email: 'user1@example.com'
  },
  {
    id: '0a2da8ea-8cb6-4225-8bb6-aa052d15ea1b',
    name: 'Test User 2',
    email: 'user2@example.com'
  }
]

Testing get user by ID...
Get user response: 200
User returned: {
  id: '2aa926e8-c19a-4af0-8a71-85c065fca315',
  name: 'Test User 1',
  email: 'user1@example.com'
}

Testing delete users...
✅ All users were successfully deleted

✅ All tests executed for eks! 🎉

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

## Implementation Details

### Infrastructure Components
1. EKS cluster
2. Managed node groups
3. VPC and networking
   - Public subnets: 192.168.0.0/19, 192.168.32.0/19
   - Private subnets: 192.168.64.0/19, 192.168.96.0/19
4. IAM roles and RBAC
5. CloudWatch integration
6. Load balancers
7. Auto-scaling groups

### Kubernetes Manifest Structure
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portable-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodejs-app
  template:
    metadata:
      labels:
        app: nodejs-app
    spec:
      containers:
      - name: nodejs-app
        image: [ECR_REPO_URL]:latest
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: portable-service
spec:
  type: LoadBalancer
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: nodejs-app
```

### Deployment Process Overview
1. Create EKS cluster with eksctl
2. Configure managed node groups
3. Set up OIDC provider for service accounts
4. Build and push container image to ECR
5. Deploy application using Kubernetes manifests
6. Configure load balancer and networking
7. Run end-to-end tests to verify deployment

## Advantages
- Maximum flexibility
- Cloud-agnostic
- Advanced orchestration
- Rich ecosystem
- Strong community
- Extensive tooling
- Standardized practices

## Disadvantages
- Highest complexity
- Steeper learning curve
- Higher operational overhead
- More resources needed
- Complex troubleshooting
- Higher initial cost

## When to Use
- Complex microservices
- Multi-cloud strategies
- Advanced orchestration needs
- Large-scale applications
- Team has K8s expertise
- Need for standardization

## Best Practices
1. Use namespaces
2. Implement RBAC
3. Configure resource limits
4. Use health probes
5. Implement monitoring
6. Set up logging
7. Use helm charts
8. Configure auto-scaling

## Monitoring and Logging
- CloudWatch Container Insights
- Prometheus integration
- Grafana dashboards
- EFK/PLG stack
- Kubernetes metrics
- Custom metrics
- Tracing with Jaeger

## Security Considerations
1. Pod security policies
2. Network policies
3. RBAC configuration
4. Secret management
5. Container security
6. Image scanning
7. Admission controllers
8. Service mesh security

## Cost Optimization
- Right-size nodes
- Use spot instances
- Implement auto-scaling
- Monitor utilization
- Use resource quotas
- Regular cost analysis
- Cluster autoscaler

## When to Consider Alternatives
Consider simpler deployment options when:
- Team lacks Kubernetes expertise
- Application is relatively simple
- Quick deployment is priority
- Cost is a major concern
- Operational overhead is limited

[← Back to ECS](./ecs-deployment.md) | [Back to Main](./deployment.md)

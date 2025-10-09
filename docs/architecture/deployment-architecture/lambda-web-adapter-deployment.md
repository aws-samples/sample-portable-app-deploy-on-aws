# Lambda Web Adapter Deployment

[← Back to Lambda Container](./lambda-container-deployment.md) | [Next: ECS Deployment →](./ecs-deployment.md)

Lambda Web Adapter deployment enhances AWS Lambda's HTTP capabilities by introducing a compatibility layer between your web application and Lambda. This approach allows you to run traditional web applications on Lambda with full HTTP protocol support, making it ideal for web frameworks and applications that require advanced HTTP features.

## Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│   API Gateway   │ ──► │   Web Adapter   │ ──► │     Lambda      │ ──► │ In-Memory Store │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Structure
```
deployment/lambda/web-adapter/
├── template.yaml           # SAM template for Web Adapter deployment
├── samconfig.toml         # SAM configuration file
└── prepare-adapter.sh     # Script to prepare web adapter
```

## Deployment Process
To deploy the application, use the scripts defined in package.json:

```bash
# Build and deploy
npm run lambda:web-adapter:build    # Build the Lambda web adapter
npm run lambda:web-adapter:deploy   # Deploy to AWS
```

## Characteristics
- Enhanced HTTP support
- Web framework compatibility
- Request/response manipulation
- Local testing matches production
- Middleware capabilities
- Full HTTP protocol support
- Framework agnostic

## Implementation Details

### SAM Template Structure
The template.yaml file defines the AWS resources and their configurations. Here's a high-level overview of the template structure:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  Environment:
    Type: String
    Default: dev

Globals:
  Function:
    Runtime: nodejs22.x
    MemorySize: 256
    Timeout: 30
    Environment:
      Variables:
        NODE_ENV: production
        PORT: 8080

Resources:
  UserApi:
    Type: AWS::Serverless::Function
    Properties:
      PackageType: Image
      ImageConfig:
        Command: ["infrastructure/lambda/handler.handler"]
      Layers:
        - !Sub arn:aws:lambda:${AWS::Region}:753240598075:layer:LambdaAdapterLayerX86:17
      Environment:
        Variables:
          AWS_LAMBDA_EXEC_WRAPPER: /opt/bootstrap
      Events:
        ProxyApiRoot:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
    Metadata:
      DockerTag: nodejs22.x-v1
      DockerContext: ./
      Dockerfile: Dockerfile

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com/
```

### Local Development and Testing
SAM CLI provides powerful local development capabilities:

1. Local API Testing:
```bash
# Start local API (after building)
npm run lambda:web-adapter:local  # runs: sam local start-api -p 8080

# Example output:
Mounting UserApi at http://127.0.0.1:8080/{proxy+} [ANY]
Web Adapter initialized with Express application
Mounting routes:
- GET    /users
- POST   /users
- GET    /users/:id
- DELETE /users/:id
- GET    /health
- GET    /version

# Example local request logs:
START RequestId: ffa8bab1-8e6d-4a75-9fd3-0f086ccd29cc Version: $LATEST
Web Adapter: Forwarding request to Express application
Lambda handler initialization completed
Lambda invocation: {
  requestId: 'a6ea284c-b253-4d56-b1a3-57380833d9b6',
  path: '/health',
  method: 'GET',
  sourceIp: '127.0.0.1'
}
```

2. Deployment Output:
```bash
npm run lambda:web-adapter:build && npm run lambda:web-adapter:deploy

# Build output:
Building codeuri: /Users/daniabib/Desktop/tmp3/Portable-App/deployment/lambda/web-adapter runtime: None architecture: x86_64 functions: WebAdapter
Building image for WebAdapter function
Setting DockerBuildArgs for WebAdapter function
Successfully built c0607eafc04f
Successfully tagged webadapter:v1

Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

# Deploy output:
Deploying with following values
===============================
Stack name                   : portable-lambda-web-adapter
Region                       : us-east-1
Confirm changeset            : False
Disable rollback             : False
Deployment image repository  : {
    "WebAdapter": "496714466045.dkr.ecr.us-east-1.amazonaws.com/portablelambdawebadapter145fe635/webadaptere752dc5arepo"
}
Deployment s3 bucket         : aws-sam-cli-managed-default-samclisourcebucket-5jjqfq5strar
Capabilities                 : ["CAPABILITY_IAM"]
Parameter overrides          : {}

CloudFormation outputs from deployed stack
--------------------------------------------------------------------------------------------------------------------------------------------
Outputs                                                                                                                                    
--------------------------------------------------------------------------------------------------------------------------------------------
Key                 ApiEndpoint                                                                                                            
Description         API Gateway endpoint URL for Prod stage for Express function                                                           
Value               https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/                                                                

Key                 TestCommands                                                                                                           
Description         Test commands for the API endpoints                                                                                    
Value               \
# Health check:
curl -X GET https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/health

# Create a new user:
curl -X POST https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User 1",
    "email": "user1@example.com"
  }'

# Get all users:
curl -X GET https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/users

# Get user by ID (replace {id} with the actual user ID):
curl -X GET https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/users/{id}

# Delete user by ID (replace {id} with the actual user ID):
curl -X DELETE https://9yuoz2alhk.execute-api.us-east-1.amazonaws.com/users/{id}
```

3. End-to-End Testing:
```bash
# Test locally
npm run test:e2e local

# Example output:
🔍 API URL: http://127.0.0.1:8080
✅ Local server is running and responding

Testing health endpoint...
Health check response: 200

Testing version endpoint...
Version check response: 200
Version check verified: monolith

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201
✅ All users were created and retrieved successfully
✅ All tests executed for local! 🎉

# Test deployed API
npm run test:e2e web-adapter

# Example output:
🔍 API URL: https://xyz789.execute-api.us-east-1.amazonaws.com/

Testing health endpoint...
Health check response: 200

Testing version endpoint...
Version check response: 200
\u001b[34mVersion check verified: clean-architecture\u001b[0m

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201
✅ All tests executed for lambda-web-adapter! 🎉

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

The end-to-end test script accepts different deployment options to test various deployment architectures:

```bash
npm run test:e2e [deployment-type]

# Available deployment types:
- local        # Tests against localhost:8080
- zip          # Tests Lambda ZIP deployment
- container    # Tests Lambda Container deployment
- web-adapter  # Tests Lambda Web Adapter deployment
- ecs          # Tests ECS deployment
- eks          # Tests EKS deployment
```

The script automatically determines the correct API endpoint:
- For local testing, it uses `http://localhost:8080`
- For cloud deployments (zip, container, web-adapter, ecs, eks), it retrieves the endpoint from the respective CloudFormation stack output
- The same test suite runs against all deployment types, ensuring consistent behavior across different architectures

**Important Note**: The end-to-end test cases are identical across all architectures and deployment options, ensuring consistent testing methodology. However, the version check endpoint (`/version`) will return different values depending on the deployment type you choose before the deployment of the solution. So:
- Lambda ZIP maybe returns: `hexagonal-architecture`
- Lambda Container maybe returns: `monolith`
- Lambda Web Adapter maybe returns: `clean-architecture`
- etc.

```bash
... 
Testing health endpoint...
Health check response: 200

Testing version endpoint...
Version check response: 200
Version check verified: ******monolith*****

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
...
```

This variation in version response is by design and reflects the build architecture during the deployment process.

Benefits of Local Testing:
- Test API without AWS deployment
- Fast development iterations
- Debug with local logs
- Verify endpoints locally
- Save on AWS costs during development
- Identical behavior between local and cloud environments
- Comprehensive test coverage reporting

### Build Process
Example build output:
```bash
# Build monolithic architecture (you can choose monolith, layered, hexagonal or clean)
npm run monolith:build

> portable-aws-app@1.0.0 monolith:build
> npm run remove && tsc -p src/01-Monolith/tsconfig.json && echo 'Monolithic Architecture' > dist/ARCHITECTURE-MONOLITH

# Build Lambda Web Adapter package
npm run lambda:web-adapter:build

> portable-aws-app@1.0.0 lambda:web-adapter:build
> npm run remember && ./deployment/lambda/web-adapter/prepare-adapter.sh && cd deployment/lambda/web-adapter && sam build

Preparing Web Adapter...
Downloading Lambda Web Adapter Layer...
Setting up Express application...
Building SAM application...
Build completed
```

### Deployment Process
1. Prepare web adapter layer
2. Configure application settings
3. Deploy Lambda function
4. Set up API Gateway
5. Configure HTTP routes

## Advantages
- Better HTTP support
- Framework compatibility
- Enhanced request handling
- Local testing accuracy
- Middleware support
- Easy framework migration
- Full HTTP protocol support

## Disadvantages
- Additional complexity
- Slightly higher latency
- More configuration needed
- Additional layer overhead
- Learning curve
- Resource overhead

## Next Steps
Consider moving to [ECS Deployment](./ecs-deployment.md) when:
- You need full container orchestration
- Consistent workload patterns emerge
- More complex scaling is required
- Container-native features are needed

[← Back to Lambda Container](./lambda-container-deployment.md) | [Next: ECS Deployment →](./ecs-deployment.md)

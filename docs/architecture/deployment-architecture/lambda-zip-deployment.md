# Lambda ZIP Deployment

[← Back to Main](./deployment.md) | [Next: Lambda Container →](./lambda-container-deployment.md)

The Lambda ZIP deployment is the simplest and most straightforward serverless deployment option. In this pattern, your application code and dependencies are packaged into a ZIP file and deployed directly to AWS Lambda. This approach is perfect for small to medium-sized applications where simplicity and quick deployment are priorities.

## Architecture Diagram
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   API Gateway       │ ──► │   Lambda (ZIP)      │ ──► │   In-Memory Store   │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Structure
```
deployment/lambda/zip/
├── template.yaml     # SAM template for Lambda ZIP deployment
└── samconfig.toml   # SAM configuration file
```

## Deployment Process
To deploy the application, use the scripts defined in package.json:

```bash
# Build and deploy
npm run lambda:zip:build    # Build the Lambda package
npm run lambda:zip:deploy   # Deploy to AWS
```

## Characteristics
- Minimal infrastructure requirements
- Fast cold starts (compared to container options)
- Simple deployment process
- Automatic scaling
- Pay-per-use pricing model
- Package size limit of 50MB (compressed)
- Limited runtime customization

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

Resources:
  UserApi:
    Type: AWS::Serverless::Function
    Properties:
      Handler: infrastructure/lambda/handler.handler
      Events:
        CreateUser:
          Type: Api
          Properties:
            Path: /users
            Method: post
        GetUsers:
          Type: Api
          Properties:
            Path: /users
            Method: get
        # ... other API endpoints

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Stage/
```

### Local Development and Testing
SAM CLI provides powerful local development capabilities:

1. Local API Testing:
```bash
# Start local API (after building)
npm run lambda:zip:local  # runs: sam local start-api -p 8080

# Example output:
Mounting UserApi at http://127.0.0.1:8080/users [GET, POST, OPTIONS]
Mounting UserApi at http://127.0.0.1:8080/users/{id} [DELETE, GET, OPTIONS]
Mounting UserApi at http://127.0.0.1:8080/health [GET, OPTIONS]
Mounting UserApi at http://127.0.0.1:8080/version [GET, OPTIONS]

# Example local request logs:
START RequestId: ffa8bab1-8e6d-4a75-9fd3-0f086ccd29cc Version: $LATEST
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
npm run lambda:zip:deploy

# Example output:
Deploying with following values
===============================
Stack name                   : portable-lambda-zip
Region                       : us-east-1
Confirm changeset            : False
Disable rollback             : False
Deployment s3 bucket         : aws-sam-cli-managed-default-samclisourcebucket-xxx
Capabilities                 : ["CAPABILITY_IAM"]
Parameter overrides          : {"Environment": "dev"}

CloudFormation outputs from deployed stack
----------------------------------------
Outputs                                                                                                                                    
--------------------------------------------------------------------------------------------------------------------------------------------
Key                 ApiEndpoint                                                                                                            
Description         API Gateway endpoint URL                                                                                               
Value               https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Stage/                                                          

Key                 TestCommands                                                                                                           
Description         Test commands for the API endpoints                                                                                    
Value               \
# Health check:
curl -X GET https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/health

# Create a new user: 
curl -X POST https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User 1",
    "email": "user1@example.com"
  }'

# Get all users:
curl -X GET https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/users

# Get user by ID (replace {id} with the actual user ID):
curl -X GET https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/users/{id}

# Delete user by ID (replace {id} with the actual user ID):
curl -X DELETE https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/users/{id}

# Get version:
curl -X GET https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Prod/version
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
Version check verified: hexagonal-architecture

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201
✅ All users were created and retrieved successfully
✅ All tests executed for local! 🎉

# Test deployed API
npm run test:e2e zip

# Example output:
🔍 API URL: https://bt464pxjj0.execute-api.us-east-1.amazonaws.com/Stage/

Testing health endpoint...
Health check response: 200

Testing version endpoint...
Version check response: 200
\u001b[34mVersion check verified: hexagonal-architecture\u001b[0m

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201
✅ All tests executed for lambda-zip! 🎉

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

# Build Lambda ZIP package
npm run lambda:zip:build

> portable-aws-app@1.0.0 lambda:zip:build
> npm run remember && cp package.json dist/ && cd dist && npm install --production && cd ../deployment/lambda/zip && sam build
```

### Deployment Process
1. Code is packaged with dependencies
2. ZIP file is created
3. Package is uploaded to S3
4. Lambda function is updated
5. API Gateway is configured

## Advantages
- Simplest deployment option
- Fastest cold start times
- Minimal operational overhead
- Easy to maintain
- Cost-effective for low traffic
- Quick updates and rollbacks

## Disadvantages
- Limited package size (50MB)
- Restricted runtime environments
- Basic HTTP capabilities
- Limited local testing options
- No container benefits

## Next Steps
Consider moving to [Lambda Container Deployment](./lambda-container-deployment.md) when:
- You need custom runtime dependencies
- Package size exceeds 50MB
- More complex deployment requirements emerge
- Container-based workflow is preferred

[← Back to Main](./deployment.md) | [Next: Lambda Container →](./lambda-container-deployment.md)

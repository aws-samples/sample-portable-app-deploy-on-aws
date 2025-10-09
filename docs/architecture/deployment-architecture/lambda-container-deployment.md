# Lambda Container Deployment

[← Back to Lambda ZIP](./lambda-zip-deployment.md) | [Next: Lambda Web Adapter →](./lambda-web-adapter-deployment.md)

Lambda Container deployment enables you to package and deploy your application as a container image, combining the benefits of containerization with serverless architecture. This approach provides more flexibility in terms of runtime environment and dependencies while maintaining the serverless benefits of AWS Lambda.

## Architecture Diagram
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   API Gateway       │ ──► │ Lambda (Container)  │ ──► │   In-Memory Store   │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Structure
```
deployment/lambda/container/
├── Dockerfile       # Container image definition
├── template.yaml    # SAM template for Lambda Container
└── samconfig.toml  # SAM configuration file
```

## Deployment Process
To deploy the application, use the scripts defined in package.json:

```bash
# Build and deploy
npm run lambda:container:build    # Build the Lambda container
npm run lambda:container:deploy   # Deploy to AWS
```

## Characteristics
- Container-based deployment
- Custom runtime environment
- Larger deployment size (10GB)
- Consistent environments
- Familiar container workflow
- Slightly slower cold starts
- Full dependency control

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
    PackageType: Image
    MemorySize: 256
    Timeout: 30

Resources:
  UserApi:
    Type: AWS::Serverless::Function
    Properties:
      ImageConfig:
        Command: ["infrastructure/lambda/handler.handler"]
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
    Metadata:
      DockerTag: nodejs22.x-v1
      DockerContext: ./
      Dockerfile: Dockerfile

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
npm run lambda:container:local  # runs: sam local start-api -p 8080

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
npm run lambda:container:deploy

# Example output:
> portable-aws-app@1.0.0 lambda:container:deploy
> cd deployment/lambda/container && sam deploy --resolve-image-repos

Managed S3 bucket: aws-sam-cli-managed-default-samclisourcebucket-5jjqfq5strar
File with same data already exists at portable-lambda-container/56d17a399b5408dcd7e9c5b13122769d.template, skipping upload                     
a88c4f5db83f: Pushed 
e22d5bc7381d: Pushed 
d1633bce12a6: Pushed 
8b86f3b4c277: Pushed 
114c259845c5: Pushed 
acebdd2ba131: Pushed 
0091b0f618e4: Pushed 
8e2ccc516273: Pushed 
66d94c697bb5: Pushed 
9823f5057de7: Pushed 
userapifunction-d172c75ff0db-nodejs22.x-v1: digest: sha256:e11ae5fb2629ab3cadfa9003c76dea06734103bc4d4b80c54cc37836923caa1c size: 2418

Deploying with following values
===============================
Stack name                   : portable-lambda-container
Region                       : us-east-1
Confirm changeset            : False
Disable rollback             : False
Deployment image repository  : 
                               {
                                   "UserApiFunction": "496714466045.dkr.ecr.us-east-1.amazonaws.com/portablelambdacontainer7c93b509/userapifunction8320d96frepo"
                               }
Deployment s3 bucket         : aws-sam-cli-managed-default-samclisourcebucket-5jjqfq5strar
Capabilities                 : ["CAPABILITY_IAM"]
Parameter overrides          : {}

CloudFormation outputs from deployed stack
----------------------------------------
Outputs                                                                                                                                    
--------------------------------------------------------------------------------------------------------------------------------------------
Key                 ApiEndpoint                                                                                                            
Description         API Gateway endpoint URL                                                                                               
Value               https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Stage/                                                          

Key                 TestCommands                                                                                                           
Description         Test commands for the API endpoints                                                                                    
Value               \
# Health check:
curl -X GET https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Prod/health

# Create a new user: 
curl -X POST https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Prod/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User 1",
    "email": "user1@example.com"
  }'

# Get all users:
curl -X GET https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Prod/users

# Get user by ID (replace {id} with the actual user ID):
curl -X GET https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Prod/users/{id}

# Delete user by ID (replace {id} with the actual user ID):
curl -X DELETE https://wayz44yesi.execute-api.us-east-1.amazonaws.com/Prod/users/{id}

Successfully created/updated stack - portable-lambda-container in us-east-1
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
\u001b[34mVersion check verified: monolith\u001b[0m

Testing users creation...
Creating user: Test User 1
Create user response for Test User 1: 201
Creating user: Test User 2
Create user response for Test User 2: 201
✅ All users were created and retrieved successfully
✅ All tests executed for local! 🎉

# Test deployed API
npm run test:e2e container

# Example output:
🔍 API URL: https://abcdef123.execute-api.us-east-1.amazonaws.com/Stage/

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
✅ All tests executed for lambda-container! 🎉

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

# Build Lambda Container package
npm run lambda:container:build

> portable-aws-app@1.0.0 lambda:container:build
> npm run remember&& cd deployment/lambda/container && sam build


> portable-aws-app@1.0.0 remember
> ./scripts/remember.sh

🚨 REMINDER: Build your code before deployment!

⚠️  IMPORTANT: The content of ./dist folder may vary depending on the target architecture of your build.

📋 Available build commands for each architecture:
- Monolith: npm run monolith:build
- Layered: npm run layered:build
- Hexagonal: npm run hexagonal:build
- Clean: npm run clean:build


Building codeuri: /Users/daniabib/Desktop/tmp3/Portable-App/deployment/lambda/container runtime: None architecture: x86_64 functions:          
UserApiFunction                                                                                                                                
Building image for UserApiFunction function                                                                                                    
Setting DockerBuildArgs for UserApiFunction function                                                                                           
Step 1/8 : FROM public.ecr.aws/lambda/nodejs:20
20: Pulling from lambda/nodejs 
d901b662bda6: Already exists 
c6614439cc55: Already exists 
21a7de104823: Already exists 
35e8cd243a50: Already exists 
dd662c58583c: Already exists 
3935dc3d8b97: Already exists 
Status: Downloaded newer image for public.ecr.aws/lambda/nodejs:20 ---> 00067a82a8ba
Step 2/8 : ENV NODE_PATH=${LAMBDA_TASK_ROOT}/node_modules
 ---> [Warning] The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
 ---> Running in d13265ebf3c4
 ---> Removed intermediate container d13265ebf3c4
 ---> 1c61b32e1f82
Step 3/8 : ENV PATH=${PATH}:${LAMBDA_TASK_ROOT}/node_modules/.bin
 ---> [Warning] The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
 ---> Running in eccd0ed4cb1c
 ---> Removed intermediate container eccd0ed4cb1c
 ---> 57ed06cc731d
Step 4/8 : COPY package*.json ${LAMBDA_TASK_ROOT}/
 ---> b1c2c05bd233
Step 5/8 : RUN npm install --production
 ---> [Warning] The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
 ---> Running in 6c2022aed336
npm warn config production Use `--omit=dev` instead.

added 85 packages, and audited 86 packages in 3s

13 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.0.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.0.0
npm notice To update run: npm install -g npm@11.0.0
npm notice
 ---> Removed intermediate container 6c2022aed336
 ---> 18fb981a58c3
Step 6/8 : COPY dist/ ${LAMBDA_TASK_ROOT}/
 ---> 0d20229aafff
Step 7/8 : RUN if [ "$(uname -m)" != "x86_64" ]; then echo "Error: x86_64 architecture required" && exit 1; fi &&     echo "System architecture: $(uname -m)" &&     echo "Node.js version: $(node -v)" &&     echo "NPM version: $(npm -v)" &&     echo "NODE_PATH: ${NODE_PATH}" &&     echo "Lambda Task Root contents:" &&     ls -la ${LAMBDA_TASK_ROOT} &&     echo "Handler location:" &&     ls -la ${LAMBDA_TASK_ROOT}/infrastructure/lambda/handler.js &&     chmod 755 /lambda-entrypoint.sh
 ---> [Warning] The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
 ---> Running in fc7f0d268d24
System architecture: x86_64
Node.js version: v20.18.0
NPM version: 10.8.2
NODE_PATH: /var/task/node_modules
Lambda Task Root contents:
total 240
drwxr-xr-x 1 root root   4096 Jan  6 21:59 .
drwxr-xr-x 1 root root   4096 Dec 31 19:53 ..
-rw-r--r-- 1 root root     24 Jan  6 21:37 ARCHITECTURE-MONOLITH
-rw-r--r-- 1 root root   5919 Jan  6 21:37 app.js
drwxr-xr-x 3 root root   4096 Jan  6 21:37 infrastructure
drwxr-xr-x 1 root root   4096 Jan  6 21:37 node_modules
-rw-r--r-- 1 root root 196923 Jan  6 21:37 package-lock.json
-rw-r--r-- 1 root root   8166 Jan  6 21:37 package.json
-rw-r--r-- 1 root root   1763 Jan  6 21:37 server.js
drwxr-xr-x 3 root root   4096 Jan  6 21:37 tests
Handler location:
-rw-r--r-- 1 root root 1581 Jan  6 21:37 /var/task/infrastructure/lambda/handler.js
 ---> Removed intermediate container fc7f0d268d24
 ---> 2f7ba097e501
Step 8/8 : CMD ["infrastructure/lambda/handler.handler"]
 ---> [Warning] The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
 ---> Running in e8c2836813be
 ---> Removed intermediate container e8c2836813be
 ---> d172c75ff0db
Successfully built d172c75ff0db
Successfully tagged userapifunction:nodejs22.x-v1


Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided
```

### Deployment Process
1. Build container image
2. Push to Amazon ECR
3. Update Lambda function
4. Configure API Gateway
5. Update permissions

## Advantages
- Custom runtime environment
- Larger deployment size (10GB)
- Better dependency management
- Consistent environments
- Familiar Docker workflow
- Portable configuration
- Local testing with containers

## Disadvantages
- Slower cold starts than ZIP
- More complex deployment
- Higher storage costs
- Container management overhead
- Image build time
- Larger minimum package size

## Next Steps
Consider moving to [Lambda Web Adapter Deployment](./lambda-web-adapter-deployment.md) when:
- You need better HTTP capabilities
- Web framework compatibility is required
- Enhanced request/response handling is needed
- Local testing needs to match production exactly

[← Back to Lambda ZIP](./lambda-zip-deployment.md) | [Next: Lambda Web Adapter →](./lambda-web-adapter-deployment.md)

#!/bin/bash

# Delete previous directory
rm -rf .aws-sam

# Create .aws-sam directory
mkdir -p .aws-sam/

# Get absolute path to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

echo $PROJECT_ROOT

# Copy Dockerfile and add Lambda Web Adapter
cp $PROJECT_ROOT/Dockerfile .aws-sam/Dockerfile
sed -i '' '/FROM node:22-slim/a\
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
' .aws-sam/Dockerfile

# Copy necessary files
mkdir -p .aws-sam/dist
cp -r "$PROJECT_ROOT/dist/"* .aws-sam/dist/
cp "$PROJECT_ROOT"/package*.json .aws-sam/

# Install production dependencies
cd .aws-sam && npm install --production

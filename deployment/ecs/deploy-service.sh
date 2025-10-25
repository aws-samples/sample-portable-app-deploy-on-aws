#!/bin/bash

# Get AWS profile information
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: Could not get AWS Account ID or Region"
    echo "Please verify that you are authenticated and have a configured AWS profile"
    exit 1
fi

# Set variables
STACK_NAME="portable-ecs-service"
ECR_REPO_NAME="portable-container-ecs"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d%H%M%S)}"  # Use provided IMAGE_TAG or generate new one
ECR_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

echo "📋 Using AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo "🚀 Starting ECS service deployment..."

# ECR login
echo ""
echo ""
echo "📦 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build Docker image for amd64 (x86_64) architecture
echo ""
echo ""
echo "🔨 Building Docker image for x86_64 architecture..."
docker buildx build --platform=linux/amd64 --no-cache --force-rm --load -t $ECR_REPO_NAME:$IMAGE_TAG -f Dockerfile .

# Tag and push image
echo ""
echo ""
echo "📤 Pushing image to ECR..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG $ECR_REPO_URI:$IMAGE_TAG
docker push $ECR_REPO_URI:$IMAGE_TAG

# Deploy using CloudFormation
echo ""
echo ""
echo "🚀 Deploying service stack..."
aws cloudformation deploy \
    --template-file deployment/ecs/ecs-service-template.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment=dev \
        ImageRepository=$ECR_REPO_URI \
        ImageTag=$IMAGE_TAG \
        DesiredCount=1

# Get service details
echo ""
echo ""
echo "🔍 Getting service details..."
echo "Service stack outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[].{Key:OutputKey,Value:OutputValue}' \
    --output json | jq -r '.[] | "• \(.Key): \(.Value)"'

echo ""
echo "✅ Service deployment completed!"
echo "🌐 Service URL: http://$(aws cloudformation describe-stacks --stack-name portable-ecs --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text):8081"

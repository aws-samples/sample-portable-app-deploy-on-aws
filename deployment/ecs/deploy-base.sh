#!/bin/bash

# Get AWS profile information
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: Could not get AWS Account ID or Region"
    echo "Please verify that you are authenticated and have a configured AWS profile"
    exit 1
fi

# Set variables
STACK_NAME="portable-ecs"
ECR_REPO_NAME="portable-container-ecs"

echo "📋 Using AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo "🚀 Starting ECS base infrastructure deployment..."

# Create ECR repository if it doesn't exist
echo ""
echo ""
echo "🏗️  Checking ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO_NAME >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION >/dev/null 2>&1

# Deploy using CloudFormation
echo ""
echo ""
echo "⚠️  IMPORTANT: This deployment may take several minutes as it creates VPC, subnets, route tables"
echo "   Internet Gateway, and ECS cluster. ⚠️"
echo ""
echo "🚀 Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file deployment/ecs/ecs-base-template.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment=dev

# Get outputs
echo ""
echo ""
echo "🔍 Getting infrastructure details..."
echo "Stack outputs have been saved. Key details:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[].{Key:OutputKey,Value:OutputValue}' \
    --output json | jq -r '.[] | "• \(.Key): \(.Value)"'

echo ""
echo "✅ Base infrastructure deployment completed!"

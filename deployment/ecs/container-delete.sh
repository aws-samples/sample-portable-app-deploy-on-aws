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
ECR_REPO_NAME="portable-container-ecs"

echo "📋 Using AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo "🗑️  Deleting ECR repository..."

# Delete ECR repository
aws ecr delete-repository \
    --repository-name $ECR_REPO_NAME \
    --force \
    --region $AWS_REGION

echo "✅ ECR repository deletion completed!"

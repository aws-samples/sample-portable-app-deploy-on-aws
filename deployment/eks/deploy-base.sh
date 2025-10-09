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
STACK_NAME="portable-eks"
CLUSTER_NAME="$STACK_NAME"
ECR_REPO_NAME="portable-container-eks"

echo "📋 Using AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo "🚀 Starting EKS infrastructure deployment..."

# Create ECR repository if it doesn't exist
echo ""
echo ""
echo "🏗️  Checking ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO_NAME >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION >/dev/null 2>&1

# Create EKS cluster using eksctl
echo ""
echo ""
echo "⚠️  IMPORTANT: This deployment may take 15-20 minutes as it creates VPC, subnets,"
echo "   NAT Gateways, and EKS cluster with managed node group. ⚠️"
echo ""
echo "🚀 Creating EKS cluster..."
eksctl create cluster \
    --name $CLUSTER_NAME \
    --region $AWS_REGION \
    --version 1.31 \
    --nodegroup-name portable-workers \
    --node-type t3.small \
    --nodes 1 \
    --nodes-min 1 \
    --nodes-max 3 \
    --managed \
    --with-oidc

# Update kubeconfig
echo ""
echo ""
echo "🔄 Updating kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION

# Create OIDC provider for service account
echo ""
echo ""
echo "🔐 Creating OIDC provider for service accounts..."
eksctl utils associate-iam-oidc-provider \
    --cluster $CLUSTER_NAME \
    --region $AWS_REGION \
    --approve

# Create IAM role and service account for pod execution
echo ""
echo ""
echo "👤 Creating service account and IAM role..."
eksctl create iamserviceaccount \
    --name portable-service-account \
    --namespace default \
    --cluster $CLUSTER_NAME \
    --region $AWS_REGION \
    --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    --approve

echo ""
echo ""
echo ""
echo ""
echo "🔍 Getting infrastructure details..."
echo "Cluster details:"
kubectl cluster-info | sed 's/^/• /'
echo ""
echo "Node details:"
kubectl get nodes -o wide | sed 's/^/• /'

echo ""
echo "✅ Base infrastructure deployment completed!"

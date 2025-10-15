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
CLUSTER_NAME="portable-eks"
ECR_REPO_NAME="portable-container-eks"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d%H%M%S)}"  # Use provided IMAGE_TAG or generate new one
ECR_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

echo "📋 Using AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo "🚀 Starting EKS service deployment..."

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

# Apply Kubernetes manifests with environment variable substitution
echo ""
echo ""
echo "🚀 Deploying to Kubernetes..."
export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID
export AWS_REGION=$AWS_REGION
export IMAGE_TAG=$IMAGE_TAG


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

envsubst < deployment/eks/k8s-deployment.yaml | kubectl apply -f -

# Wait for deployment
echo ""
echo ""
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/portable-app

# Get service details
echo ""
echo ""
echo "🔍 Getting service details..."
LOAD_BALANCER_DNS=$(kubectl get service portable-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo ""
echo ""
echo "✅ Service deployment completed!"
echo "🌐 Service URL: http://$LOAD_BALANCER_DNS:8081"

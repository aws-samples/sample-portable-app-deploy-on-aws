# ADR-0014: Using AWS SAM and CloudFormation for IaC

## Status
Accepted

## Context
We want to provision serverless resources and supporting infrastructure through a fully automated and repeatable process. AWS Serverless Application Model (SAM) provides high-level abstractions on top of AWS CloudFormation for building serverless applications. CloudFormation is an AWS-native service for infrastructure-as-code (IaC).

## Decision
Adopt AWS SAM to define serverless functions (Lambdas), event sources, APIs, IAM roles, and other resources. Under the hood, AWS SAM transforms these higher-level templates into CloudFormation, which then deploys and manages AWS stacks. This ensures the entire infrastructure is versioned in code, promoting a DevOps-friendly workflow.

## Consequences
- **Automated Provisioning**: The entire deployment (functions, APIs, triggers, roles) is declared in SAM/CloudFormation, making rollbacks, updates, and new deployments consistent.
- **Simplicity**: SAM abstracts common serverless patterns (e.g., API + Lambda) and auto-generates CloudFormation, simplifying the YAML required for typical serverless use cases.
- **AWS Ecosystem**: Tight integration with AWS CLI, CodePipeline, and CodeDeploy. However, this also implies vendor lock-in if we need a multi-cloud approach in the future.
- **Repeatability**: Infrastructure changes are tracked in source control and can be peer-reviewed, tested, and reverted easily.
- **Learning Curve**: Familiarity with YAML-based IaC and SAM CLI is required, which might initially slow down new contributors.

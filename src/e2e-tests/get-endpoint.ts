import { spawnSync } from 'child_process';
import axios from 'axios';

export type DeploymentType = 'lambda-zip' | 'lambda-container' | 'lambda-web-adapter' | 'ecs' | 'eks' | 'local';
export type CliDeploymentType = 'zip' | 'container' | 'web-adapter' | 'ecs' | 'eks' | 'local';

export function convertCliType(type: CliDeploymentType): DeploymentType {
  switch (type) {
    case 'zip':
      return 'lambda-zip';
    case 'container':
      return 'lambda-container';
    case 'web-adapter':
      return 'lambda-web-adapter';
    default:
      return type;
  }
}

export async function getEndpoint(type: DeploymentType): Promise<string> {
  switch (type) {
    case 'lambda-zip':
      return getLambdaEndpoint('portable-lambda-zip');
    case 'lambda-container':
      return getLambdaEndpoint('portable-lambda-container');
    case 'ecs':
      return getEcsEndpoint();
    case 'eks':
      return getEksEndpoint();
    case 'local':
      return 'http://127.0.0.1:3000';
    case 'lambda-web-adapter':
      return getLambdaEndpoint('portable-lambda-web-adapter');
    default:
      throw new Error(`Unknown deployment type: ${type}`);
  }
}

function getLambdaEndpoint(stackName: string): string {
  try {
    // Validate stack name to prevent command injection
    const validStackNames = ['portable-lambda-zip', 'portable-lambda-container', 'portable-lambda-web-adapter'];
    if (!validStackNames.includes(stackName)) {
      throw new Error(`Invalid stack name: ${stackName}. Must be one of: ${validStackNames.join(', ')}`);
    }

    // Primeiro verifica se a stack existe usando spawnSync com array de argumentos
    try {
      const checkResult = spawnSync('aws', [
        'cloudformation',
        'describe-stacks',
        '--stack-name',
        stackName,
        '--output',
        'text'
      ], { encoding: 'utf-8' });

      if (checkResult.error || checkResult.status !== 0) {
        throw new Error('Stack not found');
      }
    } catch (error) {
      let deployType = 'container';
      if (stackName === 'portable-lambda-zip') {
        deployType = 'zip';
      } else if (stackName === 'portable-lambda-web-adapter') {
        deployType = 'web-adapter';
      }
      throw new Error(`The Lambda has not been deployed yet. Run: npm run lambda:${deployType}:deploy:all`);
    }

    // Se a stack existe, pega o endpoint usando spawnSync com array de argumentos
    const result = spawnSync('aws', [
      'cloudformation',
      'describe-stacks',
      '--stack-name',
      stackName,
      '--query',
      'Stacks[0].Outputs',
      '--output',
      'json'
    ], { encoding: 'utf-8' });

    if (result.error || result.status !== 0) {
      throw new Error(`Failed to get stack outputs: ${result.stderr}`);
    }

    const outputs = JSON.parse(result.stdout);
    
    if (!Array.isArray(outputs)) {
      throw new Error(`No outputs found in ${stackName} stack`);
    }

    const apiOutput = outputs.find((o: any) => o.OutputKey === "ApiEndpoint");
    if (!apiOutput) {
      throw new Error(`ApiEndpoint output not found in ${stackName} stack`);
    }

    const apiUrl = apiOutput.OutputValue;
    if (!apiUrl) {
      throw new Error(`API Gateway URL is empty in ${stackName} stack outputs`);
    }
    
    return apiUrl;
  } catch (error: any) {
    if (error.message.includes('The Lambda has not been deployed yet')) {
      throw error;
    }
    throw new Error(`Failed to get API URL from CloudFormation stack: ${error}`);
  }
}

function getEcsEndpoint(): string {
  try {
    // Primeiro verifica se a stack existe usando spawnSync com array de argumentos
    try {
      const checkResult = spawnSync('aws', [
        'cloudformation',
        'describe-stacks',
        '--stack-name',
        'portable-ecs',
        '--output',
        'text'
      ], { encoding: 'utf-8' });

      if (checkResult.error || checkResult.status !== 0) {
        throw new Error('Stack not found');
      }
    } catch (error) {
      throw new Error('The ECS stack has not been deployed yet. Run: npm run container:ecs:deploy:all');
    }

    // Se a stack existe, pega o endpoint usando spawnSync com array de argumentos
    const result = spawnSync('aws', [
      'cloudformation',
      'describe-stacks',
      '--stack-name',
      'portable-ecs',
      '--query',
      'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue',
      '--output',
      'text'
    ], { encoding: 'utf-8' });

    if (result.error || result.status !== 0) {
      throw new Error(`Failed to get ECS endpoint: ${result.stderr}`);
    }

    const loadBalancerDNS = result.stdout.trim();
    
    return `http://${loadBalancerDNS}:3000`;
  } catch (error: any) {
    if (error.message.includes('The ECS stack has not been deployed yet')) {
      throw error;
    }
    throw new Error(`Failed to get ECS service URL: ${error}`);
  }
}

async function getEksEndpoint(): Promise<string> {
  try {
    // Primeiro verifica se o serviço existe usando spawnSync com array de argumentos
    try {
      const checkResult = spawnSync('kubectl', [
        'get',
        'service',
        'portable-service'
      ], { encoding: 'utf-8' });

      if (checkResult.error || checkResult.status !== 0) {
        throw new Error('Service not found');
      }
    } catch (error) {
      throw new Error('The EKS service has not been deployed yet. Run: npm run container:eks:deploy:all');
    }

    // Se o serviço existe, pega o endpoint usando spawnSync com array de argumentos
    const result = spawnSync('kubectl', [
      'get',
      'service',
      'portable-service',
      '-o',
      'jsonpath={.status.loadBalancer.ingress[0].hostname}'
    ], { encoding: 'utf-8' });

    if (result.error || result.status !== 0) {
      throw new Error(`Failed to get EKS endpoint: ${result.stderr}`);
    }

    const loadBalancerDns = result.stdout.trim();

    return `http://${loadBalancerDns}:3000`;
  } catch (error: any) {
    if (error.message.includes('The EKS service has not been deployed yet')) {
      throw error;
    }
    throw new Error(`Failed to get EKS service URL: ${error}`);
  }
}

export async function waitForEndpoint(url: string, maxAttempts = 30): Promise<void> {
  console.log('Waiting for service to be available...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.get(`${url}/health`);
      console.log('Service is available!');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Service not available after ${maxAttempts} attempts`);
      }
      console.log(`Attempt ${attempt}/${maxAttempts} failed, retrying in 10 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

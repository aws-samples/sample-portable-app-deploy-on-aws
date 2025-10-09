import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { InMemoryUserRepositoryAdapter } from '../adapters/in-memory-user-repository.adapter';
import { UserManagementService } from '../../application/user-management.service';
import { ExpressApiAdapter } from '../adapters/express-api.adapter';

console.log('Lambda handler initialization started');

// Initialize dependencies
const userRepository = new InMemoryUserRepositoryAdapter();
const userManagementService = new UserManagementService(userRepository);
const expressApiAdapter = new ExpressApiAdapter(userManagementService);

// Get Express app from adapter
const app = expressApiAdapter.getApp();

// Create base handler
const baseHandler = serverlessExpress({ app });

// Wrap handler with logging
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent, 
  context: Context,
  callback: Callback
) => {
  console.log('Lambda invocation:', {
    requestId: context.awsRequestId,
    path: event.path,
    method: event.httpMethod,
    sourceIp: event.requestContext.identity.sourceIp
  });

  console.debug('Event details:', {
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
    body: event.body ? JSON.parse(event.body) : null
  });

  try {
    const response = await baseHandler(event, context, callback);
    console.log('Lambda response:', {
      requestId: context.awsRequestId,
      statusCode: response.statusCode
    });
    return response;
  } catch (error) {
    console.error('Lambda error:', error instanceof Error ? error.message : 'Unknown error', {
      requestId: context.awsRequestId,
      error
    });
    throw error;
  }
};

console.log('Lambda handler initialization completed');

import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import app from '../../app';

console.log('Lambda handler initialization started');

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

  let parsedBody = null;
  if (event.body) {
    try {
      parsedBody = JSON.parse(event.body);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.debug('Failed to parse request body:', e.message);
      } else {
        console.debug('Failed to parse request body: Unknown error');
      }
    }
  }

  console.debug('Event details:', {
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
    body: parsedBody
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

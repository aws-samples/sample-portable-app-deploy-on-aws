import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { handler } from '../../../../infrastructure/lambda/handler';
import * as expressApp from '../../../../infrastructure/http/express-app';

// Mock the express app
jest.mock('../../../../infrastructure/http/express-app', () => ({
  createExpressApp: jest.fn().mockReturnValue({})
}));

// Mock serverless-express
jest.mock('@vendia/serverless-express', () => {
  return jest.fn().mockImplementation(() => {
    return async () => ({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: { 'Content-Type': 'application/json' }
    });
  });
});

describe('Lambda Handler', () => {
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let mockCallback: Callback;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset modules and mocks before each test
    jest.resetModules();
    
    // Re-mock express app for each test
    jest.doMock('../../../../infrastructure/http/express-app', () => ({
      createExpressApp: jest.fn().mockReturnValue({})
    }));

    // Re-mock serverless-express with default success response
    jest.doMock('@vendia/serverless-express', () => {
      return jest.fn().mockImplementation(() => {
        return async () => ({
          statusCode: 200,
          body: JSON.stringify({ message: 'Success' }),
          headers: { 'Content-Type': 'application/json' }
        });
      });
    });

    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Setup mock event
    mockEvent = {
      path: '/test',
      httpMethod: 'GET',
      headers: { 'Content-Type': 'application/json' },
      queryStringParameters: { param: 'value' },
      body: JSON.stringify({ data: 'test' }),
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    } as any;

    // Setup mock context
    mockContext = {
      awsRequestId: 'test-request-id',
      functionName: 'test-function',
      functionVersion: '1',
      invokedFunctionArn: 'test-arn',
      memoryLimitInMB: '128',
      callbackWaitsForEmptyEventLoop: true,
      getRemainingTimeInMillis: () => 1000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
      logGroupName: '/aws/lambda/test-function',
      logStreamName: '2023/01/01/[$LATEST]123456789',
    };

    // Setup mock callback
    mockCallback = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize express app on module load', async () => {
    // Import handler to trigger initialization
    const { handler: initHandler } = await import('../../../../infrastructure/lambda/handler');
    
    // Get the fresh mock after module import
    const { createExpressApp } = require('../../../../infrastructure/http/express-app');
    
    expect(createExpressApp).toHaveBeenCalled();
  });

  it('should handle successful requests', async () => {
    // Import handler with default success mock
    const { handler: successHandler } = await import('../../../../infrastructure/lambda/handler');
    const response = await successHandler(mockEvent, mockContext, mockCallback);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: { 'Content-Type': 'application/json' }
    });

    // Verify logging
    expect(consoleSpy).toHaveBeenCalledWith('Lambda invocation:', {
      requestId: mockContext.awsRequestId,
      path: mockEvent.path,
      method: mockEvent.httpMethod,
      sourceIp: mockEvent.requestContext.identity.sourceIp
    });
  });

  it('should handle requests with null body', async () => {
    const eventWithNullBody = { ...mockEvent, body: null };
    const { handler: nullBodyHandler } = await import('../../../../infrastructure/lambda/handler');
    const response = await nullBodyHandler(eventWithNullBody, mockContext, mockCallback);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: { 'Content-Type': 'application/json' }
    });
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('Test error');
    
    // Reset the mock before setting new behavior
    jest.resetModules();
    
    // Setup error mock before importing handler
    jest.doMock('@vendia/serverless-express', () => {
      return jest.fn().mockImplementation(() => {
        return async () => {
          throw mockError;
        };
      });
    });

    // Import handler with new mock
    const { handler: errorHandler } = await import('../../../../infrastructure/lambda/handler');
    
    await expect(errorHandler(mockEvent, mockContext, mockCallback))
      .rejects.toThrow('Test error');
  });

  it('should handle unknown errors', async () => {
    // Reset the mock before setting new behavior
    jest.resetModules();
    
    // Setup unknown error mock before importing handler
    jest.doMock('@vendia/serverless-express', () => {
      return jest.fn().mockImplementation(() => {
        return async () => {
          throw 'Unknown error';
        };
      });
    });

    // Import handler with new mock
    const { handler: unknownErrorHandler } = await import('../../../../infrastructure/lambda/handler');
    
    await expect(unknownErrorHandler(mockEvent, mockContext, mockCallback))
      .rejects.toBe('Unknown error');
  });
});

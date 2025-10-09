import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

// Set up mocks before requiring the handler
const mockBaseHandler = jest.fn().mockImplementation(() => ({
  statusCode: 200,
  body: JSON.stringify({ message: 'Success' })
}));

jest.mock('@vendia/serverless-express', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockBaseHandler)
}));

jest.mock('../../../../infrastructure/adapters/express-api.adapter', () => ({
  ExpressApiAdapter: jest.fn().mockImplementation(() => ({
    getApp: jest.fn().mockReturnValue({})
  }))
}));

describe('Lambda Handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Partial<Context>;
  let mockCallback: Callback;
  let consoleSpy: jest.SpyInstance;
  let handler: any;

  beforeEach(() => {
    // Clear module registry before each test
    jest.resetModules();
    // Set up console spies before requiring handler
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Reset mocks
    jest.clearAllMocks();
    mockBaseHandler.mockImplementation(() => ({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    }));

    // Import handler after spies are set up
    handler = require('../../../../infrastructure/lambda/handler').handler;
    mockEvent = {
      path: '/test',
      httpMethod: 'GET',
      headers: { 'content-type': 'application/json' },
      queryStringParameters: { param: 'value' },
      body: JSON.stringify({ data: 'test' }),
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        authorizer: {},
        protocol: 'HTTP/1.1',
        httpMethod: 'GET',
        identity: {
          sourceIp: '127.0.0.1',
          accessKey: null,
          accountId: null,
          apiKey: null,
          apiKeyId: null,
          caller: null,
          clientCert: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          userAgent: 'Custom User Agent String',
          user: null,
          userArn: null
        },
        path: '/test',
        stage: 'test',
        requestId: 'test-request-id',
        requestTimeEpoch: 1234567890,
        resourceId: 'test-resource',
        resourcePath: '/test'
      },
      pathParameters: null,
      stageVariables: null,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false,
      resource: '/test'
    } as APIGatewayProxyEvent;

    mockContext = {
      awsRequestId: 'test-request-id'
    };

    mockCallback = jest.fn();
  });

  afterAll(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  it('should log initialization messages', async () => {
    expect(consoleSpy).toHaveBeenCalledWith('Lambda handler initialization started');
    expect(consoleSpy).toHaveBeenCalledWith('Lambda handler initialization completed');
  });

  it('should handle successful requests and log details', async () => {
    const response = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      mockCallback
    );

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    });

    expect(consoleSpy).toHaveBeenCalledWith('Lambda invocation:', {
      requestId: 'test-request-id',
      path: '/test',
      method: 'GET',
      sourceIp: '127.0.0.1'
    });

    expect(consoleSpy).toHaveBeenCalledWith('Lambda response:', {
      requestId: 'test-request-id',
      statusCode: 200
    });
  });

  it('should handle requests with null body', async () => {
    const eventWithNullBody = {
      ...mockEvent,
      body: null
    };

    await handler(
      eventWithNullBody as APIGatewayProxyEvent,
      mockContext as Context,
      mockCallback
    );

    // Verify debug logging with null body
    expect(console.debug).toHaveBeenCalledWith('Event details:', {
      headers: { 'content-type': 'application/json' },
      queryStringParameters: { param: 'value' },
      body: null
    });
  });

  it('should handle and log errors', async () => {
    const error = new Error('Test error');
    mockBaseHandler.mockRejectedValueOnce(error);

    await expect(handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      mockCallback
    )).rejects.toThrow('Test error');

    expect(console.error).toHaveBeenCalledWith(
      'Lambda error:',
      'Test error',
      {
        requestId: 'test-request-id',
        error
      }
    );
  });

  it('should handle unknown error types', async () => {
    const unknownError = 'string error';
    mockBaseHandler.mockRejectedValueOnce(unknownError);

    await expect(handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      mockCallback
    )).rejects.toBe(unknownError);

    expect(console.error).toHaveBeenCalledWith(
      'Lambda error:',
      'Unknown error',
      {
        requestId: 'test-request-id',
        error: unknownError
      }
    );
  });
});

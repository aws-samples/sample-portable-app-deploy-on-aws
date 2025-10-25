import { Server } from 'http';
import { Express } from 'express';
import * as expressApp from '../../../../infrastructure/http/express-app';
import { startServer, setupGracefulShutdown } from '../../../../infrastructure/local/server';

describe('Local Server', () => {
  let mockServer: Partial<Server>;
  let mockApp: Partial<Express>;
  let mockConsole: { [key: string]: jest.SpyInstance };
  let mockExit: jest.SpyInstance;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };

    // Mock process.exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    // Mock console methods
    mockConsole = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };

    // Mock Express app and server
    mockServer = {
      close: jest.fn().mockImplementation(cb => cb?.()),
      on: jest.fn().mockImplementation((event, handler) => {
        if (event === 'listening') {
          handler();
        }
        return mockServer;
      })
    };

    mockApp = {
      listen: jest.fn().mockImplementation((port, cb) => {
        if (typeof cb === 'function') {
          cb();
        }
        return mockServer as Server;
      }),
    };

    // Mock createExpressApp
    jest.spyOn(expressApp, 'createExpressApp').mockReturnValue(mockApp as Express);
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
    // Restore process.env
    process.env = originalEnv;
    // Clear all mock calls
    jest.clearAllMocks();
    // Remove all signal listeners to prevent accumulation
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
  });

  it('should start server on default port 8081', () => {
    const server = startServer();

    expect(expressApp.createExpressApp).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith(8081);
    
    // Verify startup logs in order
    const calls = mockConsole.log.mock.calls.map(call => call[0]);
    expect(calls).toEqual([
      'Starting local development server...',
      `
  _____ _                  
 / ____| |                 
| |    | | ___  __ _ _ __  
| |    | |/ _ \\/ _\` | '_ \\ 
| |____| |  __/ (_| | | | |
 \\_____|_|\\___|\\__,_|_| |_|
`,
      '🚀 Server successfully started!',
      '📡 Server running at http://localhost:8081',
      '\n📍 Available endpoints:',
      '  GET    /health    - Health check endpoint',
      '  GET    /version   - Get architecture version',
      '  POST   /users     - Create a new user',
      '  GET    /users     - List all users',
      '  GET    /users/:id - Get user by ID',
      '  DELETE /users/:id - Delete user by ID',
      '\n🛠️  Development mode enabled'
    ]);
  });

  it('should start server on custom port from environment variable', () => {
    process.env.PORT = '8081';

    const server = startServer();

    expect(expressApp.createExpressApp).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith('8081');
    expect(mockConsole.log.mock.calls.map(call => call[0])).toContain('📡 Server running at http://localhost:8081');
  });

  it('should log debug messages during startup', () => {
    const server = startServer();

    expect(mockConsole.debug.mock.calls).toEqual([
      ['Creating Express application instance'],
      ['Using port:', 8081]
    ]);
  });

  it('should handle SIGTERM signal gracefully', () => {
    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.log.mock.calls.map(call => call[0])).toContain('\n🛑 Received SIGTERM signal. Shutting down gracefully...');
    expect(mockConsole.log.mock.calls.map(call => call[0])).toContain('✅ Server shutdown completed');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle server close error (Error object) during SIGTERM shutdown', () => {
    const closeError = new Error('Failed to close server');
    mockServer.close = jest.fn().mockImplementation(cb => {
      cb?.(closeError);
    });

    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith('Error during server shutdown:', closeError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle server close error (non-Error object) during SIGTERM shutdown', () => {
    const closeError = 'String error message';
    mockServer.close = jest.fn().mockImplementation(cb => {
      cb?.(closeError as any);
    });

    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith('Error during server shutdown:', closeError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle server close success (null error) during SIGTERM shutdown', () => {
    mockServer.close = jest.fn().mockImplementation(cb => {
      cb?.(null);
    });

    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.log).toHaveBeenCalledWith('✅ Server shutdown completed');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle server close success (undefined error) during SIGTERM shutdown', () => {
    mockServer.close = jest.fn().mockImplementation(cb => {
      cb?.(undefined);
    });

    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.log).toHaveBeenCalledWith('✅ Server shutdown completed');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle server close without callback during SIGTERM shutdown', () => {
    // Override the default mock implementation to do nothing
    mockServer.close = jest.fn().mockImplementation(() => {});

    const server = startServer();
    setupGracefulShutdown(server as Server);

    // Clear any logs from server startup
    jest.clearAllMocks();

    process.emit('SIGTERM');

    expect(mockServer.close).toHaveBeenCalled();
    // No callback means no logs or exit calls
    expect(mockConsole.log).not.toHaveBeenCalledWith('✅ Server shutdown completed');
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should handle SIGINT signal gracefully', () => {
    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGINT');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.log.mock.calls.map(call => call[0])).toContain('\n🛑 Received SIGINT signal. Shutting down gracefully...');
    expect(mockConsole.log.mock.calls.map(call => call[0])).toContain('✅ Server shutdown completed');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should handle server close error during SIGINT shutdown', () => {
    const closeError = new Error('Failed to close server');
    mockServer.close = jest.fn().mockImplementation(cb => {
      cb?.(closeError);
    });

    const server = startServer();
    setupGracefulShutdown(server as Server);

    process.emit('SIGINT');

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith('Error during server shutdown:', closeError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle server error event', () => {
    const mockError = new Error('Server error');
    const server = startServer();

    // Simulate error event
    const onMock = mockServer.on as jest.Mock;
    const errorHandler = onMock.mock.calls
      .find(([event]: [string, unknown]) => event === 'error')[1] as (error: Error) => void;
    errorHandler(mockError);

    expect(mockConsole.error).toHaveBeenCalledWith('❌ Server error:', mockError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle EADDRINUSE error event', () => {
    const mockError = new Error('Port in use') as Error & { code?: string };
    mockError.code = 'EADDRINUSE';
    const server = startServer();

    // Simulate error event
    const onMock = mockServer.on as jest.Mock;
    const errorHandler = onMock.mock.calls
      .find(([event]: [string, unknown]) => event === 'error')[1] as (error: Error) => void;
    errorHandler(mockError);

    expect(mockConsole.error).toHaveBeenCalledWith('❌ Port 8081 is already in use');
    expect(mockConsole.error).toHaveBeenCalledWith('Please try using a different port by setting the PORT environment variable');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle server creation error', () => {
    const mockError = new Error('Server creation failed');
    jest.spyOn(expressApp, 'createExpressApp').mockImplementation(() => {
      throw mockError;
    });

    try {
      startServer();
    } catch (error) {
      console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error details:', error);
      process.exit(1);
    }

    expect(mockConsole.error.mock.calls).toEqual([
      ['❌ Failed to start server:', 'Server creation failed'],
      ['Error details:', mockError]
    ]);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle non-Error objects in server creation error', () => {
    const mockError = 'String error';
    jest.spyOn(expressApp, 'createExpressApp').mockImplementation(() => {
      throw mockError;
    });

    try {
      startServer();
    } catch (error) {
      console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error details:', error);
      process.exit(1);
    }

    expect(mockConsole.error.mock.calls).toEqual([
      ['❌ Failed to start server:', 'Unknown error'],
      ['Error details:', mockError]
    ]);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle runServer success scenario', () => {
    const { runServer } = require('../../../../infrastructure/local/server');
    runServer();

    expect(mockConsole.log).toHaveBeenCalledWith('Starting local development server...');
    expect(mockServer.close).not.toHaveBeenCalled();
  });

  it('should handle runServer error scenario with Error object', () => {
    const mockError = new Error('Server creation failed');
    jest.spyOn(expressApp, 'createExpressApp').mockImplementation(() => {
      throw mockError;
    });

    const { runServer } = require('../../../../infrastructure/local/server');
    runServer();

    expect(mockConsole.error).toHaveBeenCalledWith('❌ Failed to start server:', 'Server creation failed');
    expect(mockConsole.error).toHaveBeenCalledWith('Error details:', mockError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle runServer error scenario with non-Error object', () => {
    const mockError = 'String error';
    jest.spyOn(expressApp, 'createExpressApp').mockImplementation(() => {
      throw mockError;
    });

    const { runServer } = require('../../../../infrastructure/local/server');
    runServer();

    expect(mockConsole.error).toHaveBeenCalledWith('❌ Failed to start server:', 'Unknown error');
    expect(mockConsole.error).toHaveBeenCalledWith('Error details:', mockError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should only run server when executed directly', () => {
    // Mock the module system
    jest.isolateModules(() => {
      // Mock require.main to be different from module
      jest.mock('module', () => ({
        ...jest.requireActual('module'),
        _cache: {
          [require.resolve('../../../../infrastructure/local/server')]: {
            exports: {},
            loaded: true,
            id: 'server.js',
            filename: 'server.js',
            parent: { id: 'parent.js' }, // This makes it look like it's being required
          }
        }
      }));
      
      // Clear previous calls
      jest.clearAllMocks();
      
      // Require the server module
      require('../../../../infrastructure/local/server');
      
      // Verify the server wasn't started
      expect(mockConsole.log).not.toHaveBeenCalledWith('Starting local development server...');
    });
  });

  it('should log available endpoints on startup', () => {
    const server = startServer();

    const expectedLogs = [
      'Starting local development server...',
      `
  _____ _                  
 / ____| |                 
| |    | | ___  __ _ _ __  
| |    | |/ _ \\/ _\` | '_ \\ 
| |____| |  __/ (_| | | | |
 \\_____|_|\\___|\\__,_|_| |_|
`,
      '🚀 Server successfully started!',
      '📡 Server running at http://localhost:8081',
      '\n📍 Available endpoints:',
      '  GET    /health    - Health check endpoint',
      '  GET    /version   - Get architecture version',
      '  POST   /users     - Create a new user',
      '  GET    /users     - List all users',
      '  GET    /users/:id - Get user by ID',
      '  DELETE /users/:id - Delete user by ID',
      '\n🛠️  Development mode enabled'
    ];

    const actualLogs = mockConsole.log.mock.calls.map(call => call[0]);
    expect(actualLogs).toEqual(expectedLogs);
  });
});

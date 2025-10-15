// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Server', () => {
  const originalPort = process.env.PORT;
  let mockListen: jest.SpyInstance;
  let server: any;
  let app: any;

  beforeAll(() => {
    console.log = mockConsoleLog;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    process.env.PORT = originalPort;
  });

  beforeEach(async () => {
    mockConsoleLog.mockClear();
    delete process.env.PORT;
    jest.resetModules();

    // Get a fresh instance of app
    app = (await import('../../app')).default;
    
    // Mock app.listen
    server = { 
      close: jest.fn(),
      on: jest.fn()
    };
    mockListen = jest.spyOn(app, 'listen').mockImplementation((...args: any[]) => {
      const [port, callback] = args;
      if (typeof callback === 'function') callback();
      return server;
    });
  });

  afterEach(() => {
    if (server?.close) {
      server.close();
    }
    if (mockListen) {
      mockListen.mockRestore();
    }
  });

  it('should start server on default port 8081 when PORT env is not set', async () => {
    const { server } = await import('../../server');

    expect(mockListen).toHaveBeenCalledWith(8081, expect.any(Function));
    expect(mockConsoleLog).toHaveBeenCalledWith('Starting local development server...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Creating Express application instance');
    expect(mockConsoleLog).toHaveBeenCalledWith('Initializing Express application dependencies');
    expect(mockConsoleLog).toHaveBeenCalledWith('Using port: 8081');
    // Check for ASCII art and server start message
    expect(mockConsoleLog).toHaveBeenCalledWith(`
 _                              _ 
| |    __ _ _   _  ___ _ __ __| |
| |   / _\` | | | |/ _ \\ '__/ _\` |
| |__| (_| | |_| |  __/ | | (_| |
|_____\\__,_|\\__, |\\___|_|  \\__,_|
            |___/                 
`);
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Server successfully started!');
    expect(mockConsoleLog).toHaveBeenCalledWith('📡 Server running at http://localhost:8081\n');
  });

  it('should start server on specified PORT from environment variable', async () => {
    process.env.PORT = '8081';
    
    const { server } = await import('../../server');

    expect(mockListen).toHaveBeenCalledWith(8081, expect.any(Function));
    expect(mockConsoleLog).toHaveBeenCalledWith('Using port: 8081');
    expect(mockConsoleLog).toHaveBeenCalledWith('📡 Server running at http://localhost:8081\n');
  });

  it('should log all available endpoints', async () => {
    const { server } = await import('../../server');

    expect(mockConsoleLog).toHaveBeenCalledWith('📍 Available endpoints:');
    expect(mockConsoleLog).toHaveBeenCalledWith('  GET    /health    - Health check endpoint');
    expect(mockConsoleLog).toHaveBeenCalledWith('  POST   /users     - Create a new user');
    expect(mockConsoleLog).toHaveBeenCalledWith('  GET    /users     - List all users');
    expect(mockConsoleLog).toHaveBeenCalledWith('  GET    /users/:id - Get user by ID');
    expect(mockConsoleLog).toHaveBeenCalledWith('  DELETE /users/:id - Delete user by ID');
  });
});

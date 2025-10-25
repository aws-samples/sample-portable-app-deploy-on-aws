import { startServer } from '../../server';
import { ExpressApiAdapter } from '../../infrastructure/adapters/express-api.adapter';

// Mock the ExpressApiAdapter
jest.mock('../../infrastructure/adapters/express-api.adapter');

describe('Server', () => {
  const originalPort = process.env.PORT;
  let mockStart: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockProcessExit: jest.SpyInstance;

  beforeAll(() => {
    // Store original console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore original console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    process.env.PORT = originalPort;
  });

  beforeEach(() => {
    // Clear environment
    delete process.env.PORT;
    
    // Clear mocks
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();

    // Mock process.exit to prevent actual exit
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
      throw new Error(`Process.exit called with code: ${code}`);
    });

    // Mock ExpressApiAdapter.prototype.start
    mockStart = jest.spyOn(ExpressApiAdapter.prototype, 'start').mockImplementation(() => {});
  });

  afterEach(() => {
    mockProcessExit.mockRestore();
    mockStart.mockRestore();
  });

  it('should start server with default port when PORT env is not set', async () => {
    await startServer();
    expect(mockStart).toHaveBeenCalledWith(8081);
    expect(mockConsoleLog).toHaveBeenCalledWith(`
 _    _                                        _ 
| |  | |                                      | |
| |__| | _____  ____ _  __ _  ___  _ __   __ _| |
|  __  |/ _ \\ \\/ / _\` |/ _\` |/ _ \\| '_ \\ / _\` | |
| |  | |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_|  |_|\\___/_/\\_\\__,_|\\__, |\\___/|_| |_|\\__,_|_|
                        __/ |                     
                       |___/                      
`);
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Server successfully started!');
  });

  it('should start server with PORT from environment variable', async () => {
    process.env.PORT = '4000';
    await startServer();
    expect(mockStart).toHaveBeenCalledWith(4000);
    expect(mockConsoleLog).toHaveBeenCalledWith(`
 _    _                                        _ 
| |  | |                                      | |
| |__| | _____  ____ _  __ _  ___  _ __   __ _| |
|  __  |/ _ \\ \\/ / _\` |/ _\` |/ _ \\| '_ \\ / _\` | |
| |  | |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_|  |_|\\___/_/\\_\\__,_|\\__, |\\___/|_| |_|\\__,_|_|
                        __/ |                     
                       |___/                      
`);
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Server successfully started!');
  });

  it('should start server with custom port parameter overriding PORT env', async () => {
    process.env.PORT = '4000';
    await startServer(5000);
    expect(mockStart).toHaveBeenCalledWith(5000);
    expect(mockConsoleLog).toHaveBeenCalledWith(`
 _    _                                        _ 
| |  | |                                      | |
| |__| | _____  ____ _  __ _  ___  _ __   __ _| |
|  __  |/ _ \\ \\/ / _\` |/ _\` |/ _ \\| '_ \\ / _\` | |
| |  | |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_|  |_|\\___/_/\\_\\__,_|\\__, |\\___/|_| |_|\\__,_|_|
                        __/ |                     
                       |___/                      
`);
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Server successfully started!');
  });

  it('should handle invalid PORT environment variable', async () => {
    process.env.PORT = 'invalid';
    await startServer();
    expect(mockStart).toHaveBeenCalledWith(8081); // Should use default port
    expect(mockConsoleLog).toHaveBeenCalledWith(`
 _    _                                        _ 
| |  | |                                      | |
| |__| | _____  ____ _  __ _  ___  _ __   __ _| |
|  __  |/ _ \\ \\/ / _\` |/ _\` |/ _ \\| '_ \\ / _\` | |
| |  | |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_|  |_|\\___/_/\\_\\__,_|\\__, |\\___/|_| |_|\\__,_|_|
                        __/ |                     
                       |___/                      
`);
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Server successfully started!');
  });

  it('should handle server start failure', async () => {
    const error = new Error('Failed to start');
    mockStart.mockImplementation(() => {
      throw error;
    });

    await expect(startServer()).rejects.toThrow('Process.exit called with code: 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Failed to start server:', error);
  });

  it('should handle server start failure with non-Error object', async () => {
    mockStart.mockImplementation(() => {
      throw 'Unexpected error';
    });

    await expect(startServer()).rejects.toThrow('Process.exit called with code: 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Failed to start server:', 'Unexpected error');
  });
});

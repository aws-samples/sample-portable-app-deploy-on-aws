// File: infrastructure/local/server.ts

import { createExpressApp } from '../http/express-app';
import { Server } from 'http';

/**
 * Starts the Express server.
 * @returns {Server} The HTTP server instance.
 */
export function startServer(): Server {
  console.log('Starting local development server...');

  console.debug('Creating Express application instance');
  const app = createExpressApp();
  
  const port = process.env.PORT || 8081;
  console.debug('Using port:', port);

  const server = app.listen(port);

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      console.error('Please try using a different port by setting the PORT environment variable');
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });

  server.on('listening', () => {
    console.log(`
  _____ _                  
 / ____| |                 
| |    | | ___  __ _ _ __  
| |    | |/ _ \\/ _\` | '_ \\ 
| |____| |  __/ (_| | | | |
 \\_____|_|\\___|\\__,_|_| |_|
`);
    console.log('🚀 Server successfully started!');
    console.log(`📡 Server running at http://localhost:${port}`);
    console.log('\n📍 Available endpoints:');
    console.log('  GET    /health    - Health check endpoint');
    console.log('  GET    /version   - Get architecture version');
    console.log('  POST   /users     - Create a new user');
    console.log('  GET    /users     - List all users');
    console.log('  GET    /users/:id - Get user by ID');
    console.log('  DELETE /users/:id - Delete user by ID');
    console.log('\n🛠️  Development mode enabled');
  });

  return server;
}

/**
 * Sets up graceful shutdown handlers for the server.
 * @param {Server} server - The HTTP server instance.
 */
export function setupGracefulShutdown(server: Server): void {
  const handleGracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal} signal. Shutting down gracefully...`);
    server.close((err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      console.log('✅ Server shutdown completed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
}

/**
 * Runs the server with error handling.
 */
export function runServer(): void {
  try {
    const server = startServer();
    setupGracefulShutdown(server);
  } catch (error) {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Export for testing
export const isDirectExecution = require.main === module;

// Only run the server if this file is being executed directly
if (isDirectExecution) {
  runServer();
}

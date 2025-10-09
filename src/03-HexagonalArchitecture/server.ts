// This file serves as the entry point for the application
// while maintaining hexagonal architecture principles by delegating
// to the proper infrastructure adapter

import { ExpressApiAdapter } from './infrastructure/adapters/express-api.adapter';
import { InMemoryUserRepositoryAdapter } from './infrastructure/adapters/in-memory-user-repository.adapter';
import { UserManagementService } from './application/user-management.service';

// Initialize dependencies
const userRepository = new InMemoryUserRepositoryAdapter();
const userManagementService = new UserManagementService(userRepository);
const expressApiAdapter = new ExpressApiAdapter(userManagementService);

/**
 * Starts the server with the specified port or environment variable PORT.
 * @param {number} [customPort] - Optional port number to override environment variable
 * @returns {Promise<void>}
 */
export async function startServer(customPort?: number): Promise<void> {
    try {
        const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        const port = customPort || (isNaN(envPort) ? 3000 : envPort);

        expressApiAdapter.start(port);

        console.log(`
 _    _                                        _ 
| |  | |                                      | |
| |__| | _____  ____ _  __ _  ___  _ __   __ _| |
|  __  |/ _ \\ \\/ / _\` |/ _\` |/ _ \\| '_ \\ / _\` | |
| |  | |  __/>  < (_| | (_| | (_) | | | | (_| | |
|_|  |_|\\___/_/\\_\\__,_|\\__, |\\___/|_| |_|\\__,_|_|
                        __/ |                     
                       |___/                      
`);
        console.log('🚀 Server successfully started!');
        console.log(`📡 Server running at http://localhost:${port}`);

        console.log('\n📍 Available endpoints:');
        console.log('  GET    /health    - Health check endpoint');
        console.log('  GET    /version   - Get architecture version');
        console.log('  POST   /users     - Create a new user');
        console.log('  GET    /users     - List all users');
        console.log('  GET    /users/:id - Get user by ID');
        console.log('  DELETE /users/:id - Delete user by ID\n');
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Export start function alias for consistency with other architectures
export const start = startServer;

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}
